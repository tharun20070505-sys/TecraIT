import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ClubImage, type IClubImageDoc } from "@/models";
import {
  validateAndProcessClubImage,
  deleteUploadedFile,
  logAuditAction,
} from "@/lib/media-upload";

export const runtime = "nodejs";

const MAX_IMAGES_PER_CLUB = 30;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json({ images: [] });
    }

    const docs = await ClubImage.find({ clubId: slug }).sort({ order: 1, createdAt: 1 }).lean<IClubImageDoc[]>();
    const images = docs.map((doc) => ({
      id: String(doc._id),
      clubId: doc.clubId,
      url: doc.url,
      blurDataUrl: doc.blurDataUrl,
      alt: doc.alt,
      caption: doc.caption || "",
      focalPoint: doc.focalPoint || { x: 50, y: 50 },
      order: doc.order,
      active: doc.active,
      createdAt: doc.createdAt?.toISOString(),
    }));

    return NextResponse.json({ images, count: images.length, maxAllowed: MAX_IMAGES_PER_CLUB });
  } catch (err) {
    console.error("[Club Images GET Error]", err);
    return NextResponse.json({ error: "Failed to load club images" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const currentCount = await ClubImage.countDocuments({ clubId: slug });
    if (currentCount >= MAX_IMAGES_PER_CLUB) {
      return NextResponse.json(
        { error: `Maximum limit of ${MAX_IMAGES_PER_CLUB} images reached for this club` },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const allFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No image files provided" }, { status: 400 });
    }

    if (currentCount + allFiles.length > MAX_IMAGES_PER_CLUB) {
      return NextResponse.json(
        {
          error: `Cannot upload ${allFiles.length} images. Limit is ${MAX_IMAGES_PER_CLUB} (currently ${currentCount} images).`,
        },
        { status: 400 }
      );
    }

    const altOverride = (formData.get("alt") as string) || "";
    const captionOverride = (formData.get("caption") as string) || "";

    const createdImages: unknown[] = [];
    let nextOrder = currentCount;

    for (const file of allFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const processed = await validateAndProcessClubImage(buffer, `clubs/${slug}`);

      const fallbackAlt =
        altOverride.trim() ||
        file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim() ||
        `${slug} club activity photo`;

      const newImage = await ClubImage.create({
        clubId: slug,
        url: processed.url,
        blurDataUrl: processed.blurDataUrl,
        alt: fallbackAlt,
        caption: captionOverride.trim(),
        focalPoint: { x: 50, y: 50 },
        order: nextOrder++,
        active: true,
      });

      await logAuditAction({
        actorEmail: session.email,
        entity: "ClubImage",
        entityId: String(newImage._id),
        action: "create",
        after: newImage.toObject(),
      });

      createdImages.push({
        id: String(newImage._id),
        clubId: newImage.clubId,
        url: newImage.url,
        blurDataUrl: newImage.blurDataUrl,
        alt: newImage.alt,
        caption: newImage.caption,
        focalPoint: newImage.focalPoint,
        order: newImage.order,
        active: newImage.active,
      });
    }

    revalidatePath(`/clubs/${slug}`);
    revalidatePath("/clubs");

    return NextResponse.json({
      success: true,
      uploadedCount: createdImages.length,
      images: createdImages,
    });
  } catch (err: unknown) {
    console.error("[Club Images POST Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to upload club images";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// Bulk update (reorder, bulk toggle active, bulk delete)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const body = await req.json();
    const { action, ids, items, active } = body;

    // 1. Bulk Reorder
    if (action === "reorder" && Array.isArray(items)) {
      for (const item of items) {
        if (item.id && typeof item.order === "number") {
          await ClubImage.updateOne(
            { _id: item.id, clubId: slug },
            { $set: { order: item.order } }
          );
        }
      }
      await logAuditAction({
        actorEmail: session.email,
        entity: "ClubImage",
        entityId: slug,
        action: "reorder",
        after: { reorderedCount: items.length },
      });
      revalidatePath(`/clubs/${slug}`);
      return NextResponse.json({ success: true, message: "Order updated successfully" });
    }

    // 2. Bulk Toggle Active
    if (action === "bulk-toggle-active" && Array.isArray(ids) && ids.length > 0) {
      const targetActive = Boolean(active);
      await ClubImage.updateMany(
        { _id: { $in: ids }, clubId: slug },
        { $set: { active: targetActive } }
      );
      await logAuditAction({
        actorEmail: session.email,
        entity: "ClubImage",
        entityId: slug,
        action: "update",
        after: { bulkActive: targetActive, ids },
      });
      revalidatePath(`/clubs/${slug}`);
      return NextResponse.json({ success: true, updatedCount: ids.length });
    }

    // 3. Bulk Delete with confirmation and file unlinking
    if (action === "bulk-delete" && Array.isArray(ids) && ids.length > 0) {
      const docsToDelete = await ClubImage.find({ _id: { $in: ids }, clubId: slug });
      for (const doc of docsToDelete) {
        await deleteUploadedFile(doc.url);
      }
      await ClubImage.deleteMany({ _id: { $in: ids }, clubId: slug });

      await logAuditAction({
        actorEmail: session.email,
        entity: "ClubImage",
        entityId: slug,
        action: "delete",
        before: { deletedIds: ids },
      });

      revalidatePath(`/clubs/${slug}`);
      return NextResponse.json({ success: true, deletedCount: docsToDelete.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[Club Images PUT Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to update images";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
