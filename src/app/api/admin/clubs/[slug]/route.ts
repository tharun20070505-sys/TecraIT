import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Club, ClubImage, ClubMember, LogoReelItem, type IClub } from "@/models";
import { clubsData } from "@/data/clubs";
import { logAuditAction, validateAndProcessLogo } from "@/lib/media-upload";

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
    let clubDoc: IClub | null = null;

    if (isConnected) {
      clubDoc = await Club.findOne({ slug }).lean<IClub | null>();
    }

    const staticClub = clubsData.find((c) => c.slug === slug);
    if (!clubDoc && !staticClub) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const club = {
      id: clubDoc ? String(clubDoc._id) : staticClub?.id || slug,
      slug,
      name: clubDoc?.name || staticClub?.name || "",
      type: clubDoc?.type || staticClub?.type || "technical",
      logoUrl: clubDoc?.logoUrl || staticClub?.logoUrl || "",
      shortDescription: clubDoc?.shortDescription || staticClub?.shortDescription || "",
      about: clubDoc?.about || staticClub?.about || "",
      vision: clubDoc?.vision || staticClub?.vision || "",
      mission: clubDoc?.mission || staticClub?.mission || "",
      whatWeDo: clubDoc?.whatWeDo || staticClub?.whatWeDo || [],
      videoUrl: clubDoc?.videoUrl || staticClub?.videoUrl || "",
      videoPoster: clubDoc?.videoPoster || staticClub?.videoPoster || "",
    };

    // Also fetch club images and members from their respective models
    let images: unknown[] = [];
    let members: unknown[] = [];

    if (isConnected) {
      const [dbImages, dbMembers] = await Promise.all([
        ClubImage.find({ clubId: slug }).sort({ order: 1, createdAt: 1 }).lean(),
        ClubMember.find({ clubId: slug }).sort({ order: 1, createdAt: 1 }).lean(),
      ]);
      images = dbImages.map((img) => ({
        id: String(img._id),
        clubId: img.clubId,
        url: img.url,
        blurDataUrl: img.blurDataUrl,
        alt: img.alt,
        caption: img.caption,
        focalPoint: img.focalPoint || { x: 50, y: 50 },
        order: img.order,
        active: img.active,
      }));
      members = dbMembers.map((m) => ({
        id: String(m._id),
        clubId: m.clubId,
        name: m.name,
        role: m.role,
        batch: m.batch,
        photo: m.photo,
        order: m.order,
        active: m.active,
      }));
    }

    return NextResponse.json({
      club,
      images,
      members,
    });
  } catch (err) {
    console.error("[Admin Club GET Error]", err);
    return NextResponse.json({ error: "Failed to fetch club" }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // Check if multipart form data (e.g. logo upload) or JSON
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("logo") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No logo file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const processed = await validateAndProcessLogo(buffer, "clubs/logos");

      const existing = await Club.findOne({ slug });
      const before = existing ? { logoUrl: existing.logoUrl } : {};

      const updated = await Club.findOneAndUpdate(
        { slug },
        { $set: { logoUrl: processed.url } },
        { upsert: true, new: true }
      );

      // Automatically sync updated logo to LogoReelItem if present
      await LogoReelItem.updateMany(
        { refId: slug, type: "club" },
        { $set: { logoUrl: processed.url, label: updated.name } }
      );

      await logAuditAction({
        actorEmail: session.email,
        entity: "Club",
        entityId: slug,
        action: "update",
        before,
        after: { logoUrl: processed.url },
      });

      revalidatePath(`/clubs/${slug}`);
      revalidatePath("/clubs");
      revalidatePath("/");

      return NextResponse.json({
        success: true,
        logoUrl: processed.url,
        warning: processed.warning,
      });
    }

    // JSON update
    const body = await req.json();
    const { name, shortDescription, about, vision, mission, whatWeDo } = body;

    const existing = await Club.findOne({ slug });
    const before = existing ? existing.toObject() : {};

    const updated = await Club.findOneAndUpdate(
      { slug },
      {
        $set: {
          ...(name && { name: String(name).trim() }),
          ...(shortDescription !== undefined && { shortDescription: String(shortDescription).trim() }),
          ...(about !== undefined && { about: String(about).trim() }),
          ...(vision !== undefined && { vision: String(vision).trim() }),
          ...(mission !== undefined && { mission: String(mission).trim() }),
          ...(Array.isArray(whatWeDo) && { whatWeDo }),
        },
      },
      { upsert: true, new: true }
    );

    // If club name updated, update logo reel label too
    if (name) {
      await LogoReelItem.updateMany(
        { refId: slug, type: "club" },
        { $set: { label: String(name).trim() } }
      );
    }

    await logAuditAction({
      actorEmail: session.email,
      entity: "Club",
      entityId: slug,
      action: "update",
      before,
      after: updated.toObject(),
    });

    revalidatePath(`/clubs/${slug}`);
    revalidatePath("/clubs");
    revalidatePath("/");

    return NextResponse.json({ success: true, club: updated });
  } catch (err: unknown) {
    console.error("[Admin Club PUT Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to update club";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
