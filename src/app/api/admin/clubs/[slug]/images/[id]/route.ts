import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ClubImage } from "@/models";
import {
  validateAndProcessClubImage,
  deleteUploadedFile,
  logAuditAction,
} from "@/lib/media-upload";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, id } = await context.params;

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const existing = await ClubImage.findOne({ _id: id, clubId: slug });
    if (!existing) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const before = existing.toObject();
    const contentType = req.headers.get("content-type") || "";

    // 1. File Replacement
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No image file provided for replacement" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const processed = await validateAndProcessClubImage(buffer, `clubs/${slug}`);

      // Delete old file
      await deleteUploadedFile(existing.url);

      existing.url = processed.url;
      existing.blurDataUrl = processed.blurDataUrl;

      const alt = formData.get("alt") as string | null;
      if (alt && alt.trim()) existing.alt = alt.trim();

      const caption = formData.get("caption") as string | null;
      if (caption !== null) existing.caption = caption.trim();

      await existing.save();

      await logAuditAction({
        actorEmail: session.email,
        entity: "ClubImage",
        entityId: id,
        action: "update",
        before,
        after: existing.toObject(),
      });

      revalidatePath(`/clubs/${slug}`);
      return NextResponse.json({ success: true, image: existing });
    }

    // 2. Metadata Edit (alt, caption, focalPoint, active)
    const body = await req.json();
    const { alt, caption, focalPoint, active, order } = body;

    if (alt !== undefined) {
      if (!String(alt).trim()) {
        return NextResponse.json({ error: "Alt text is required" }, { status: 400 });
      }
      existing.alt = String(alt).trim();
    }

    if (caption !== undefined) {
      existing.caption = String(caption).trim();
    }

    if (focalPoint && typeof focalPoint === "object") {
      const x = Math.max(0, Math.min(100, Number(focalPoint.x) || 50));
      const y = Math.max(0, Math.min(100, Number(focalPoint.y) || 50));
      existing.focalPoint = { x, y };
    }

    if (active !== undefined) {
      existing.active = Boolean(active);
    }

    if (order !== undefined) {
      existing.order = Number(order) || 0;
    }

    await existing.save();

    await logAuditAction({
      actorEmail: session.email,
      entity: "ClubImage",
      entityId: id,
      action: "update",
      before,
      after: existing.toObject(),
    });

    revalidatePath(`/clubs/${slug}`);
    return NextResponse.json({ success: true, image: existing });
  } catch (err: unknown) {
    console.error("[Club Image PUT Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to update image";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, id } = await context.params;

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const doc = await ClubImage.findOne({ _id: id, clubId: slug });
    if (!doc) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const before = doc.toObject();

    // 1. Unlink file from disk
    await deleteUploadedFile(doc.url);

    // 2. Remove document from DB
    await ClubImage.deleteOne({ _id: id });

    // 3. Log Audit
    await logAuditAction({
      actorEmail: session.email,
      entity: "ClubImage",
      entityId: id,
      action: "delete",
      before,
    });

    // 4. Revalidate public pages
    revalidatePath(`/clubs/${slug}`);
    revalidatePath("/clubs");

    return NextResponse.json({ success: true, message: "Image removed successfully" });
  } catch (err: unknown) {
    console.error("[Club Image DELETE Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to delete image";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
