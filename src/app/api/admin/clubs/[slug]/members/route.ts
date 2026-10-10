import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ClubMember, type IClubMemberDoc } from "@/models";
import {
  validateAndProcessMemberPhoto,
  logAuditAction,
} from "@/lib/media-upload";
import { clubMemberSchema } from "@/lib/validations";

export const runtime = "nodejs";

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
      return NextResponse.json({ members: [] });
    }

    const docs = await ClubMember.find({ clubId: slug }).sort({ order: 1, createdAt: 1 }).lean<IClubMemberDoc[]>();
    const members = docs.map((doc) => ({
      id: String(doc._id),
      clubId: doc.clubId,
      name: doc.name,
      role: doc.role,
      batch: doc.batch || "",
      photo: doc.photo || "",
      order: doc.order,
      active: doc.active,
      createdAt: doc.createdAt?.toISOString(),
    }));

    return NextResponse.json({ members });
  } catch (err) {
    console.error("[Club Members GET Error]", err);
    return NextResponse.json({ error: "Failed to load club members" }, { status: 500 });
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

    const contentType = req.headers.get("content-type") || "";

    // 1. Bulk CSV Import mode
    if (contentType.includes("application/json")) {
      const body = await req.json();

      if (body.bulk && Array.isArray(body.members)) {
        const rows = body.members;
        const created: unknown[] = [];
        const warnings: string[] = [];
        const errors: string[] = [];

        // Check existing members for duplicate detection
        const existingMembers = await ClubMember.find({ clubId: slug }).lean<IClubMemberDoc[]>();
        const existingSet = new Set(
          existingMembers.map((m) => `${m.name.toLowerCase().trim()}_${m.role.toLowerCase().trim()}`)
        );

        let curOrder = existingMembers.length;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const name = String(row.name || "").trim();
          const role = String(row.role || "").trim();
          const batch = String(row.batch || "").trim();
          const photo = String(row.photo || row.photoLink || "").trim();

          if (!name || !role) {
            errors.push(`Row ${i + 1}: Name and role are required.`);
            continue;
          }

          const dupKey = `${name.toLowerCase()}_${role.toLowerCase()}`;
          if (existingSet.has(dupKey)) {
            warnings.push(`Warning: ${name} (${role}) already exists in this club.`);
          } else {
            existingSet.add(dupKey);
          }

          const memberDoc = await ClubMember.create({
            clubId: slug,
            name,
            role,
            batch,
            photo,
            order: curOrder++,
            active: true,
          });

          await logAuditAction({
            actorEmail: session.email,
            entity: "ClubMember",
            entityId: String(memberDoc._id),
            action: "create",
            after: memberDoc.toObject(),
          });

          created.push({
            id: String(memberDoc._id),
            clubId: memberDoc.clubId,
            name: memberDoc.name,
            role: memberDoc.role,
            batch: memberDoc.batch,
            photo: memberDoc.photo,
            order: memberDoc.order,
            active: memberDoc.active,
          });
        }

        revalidatePath(`/clubs/${slug}`);
        return NextResponse.json({
          success: true,
          createdCount: created.length,
          members: created,
          warnings,
          errors,
        });
      }

      // Single member JSON add
      const parsed = clubMemberSchema.parse(body);

      // Duplicate warning / check
      const duplicate = await ClubMember.findOne({
        clubId: slug,
        name: { $regex: new RegExp(`^${parsed.name.trim()}$`, "i") },
        role: { $regex: new RegExp(`^${parsed.role.trim()}$`, "i") },
      });

      const count = await ClubMember.countDocuments({ clubId: slug });
      const newDoc = await ClubMember.create({
        clubId: slug,
        name: parsed.name.trim(),
        role: parsed.role.trim(),
        batch: parsed.batch.trim(),
        photo: parsed.photo,
        order: parsed.order ?? count,
        active: parsed.active ?? true,
      });

      await logAuditAction({
        actorEmail: session.email,
        entity: "ClubMember",
        entityId: String(newDoc._id),
        action: "create",
        after: newDoc.toObject(),
      });

      revalidatePath(`/clubs/${slug}`);
      return NextResponse.json({
        success: true,
        member: newDoc,
        warning: duplicate ? `Notice: A member named "${parsed.name}" with role "${parsed.role}" already exists.` : undefined,
      });
    }

    // 2. Multipart form data with photo upload
    const formData = await req.formData();
    const name = (formData.get("name") as string)?.trim() || "";
    const role = (formData.get("role") as string)?.trim() || "";
    const batch = (formData.get("batch") as string)?.trim() || "";
    const photoFile = formData.get("photo") as File | null;
    const order = Number(formData.get("order")) || 0;
    const active = formData.get("active") !== "false";

    if (!name || !role) {
      return NextResponse.json({ error: "Name and role are required." }, { status: 400 });
    }

    let photoUrl = "";
    if (photoFile && photoFile.size > 0) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const processed = await validateAndProcessMemberPhoto(buffer);
      photoUrl = processed.url;
    }

    const duplicate = await ClubMember.findOne({
      clubId: slug,
      name: { $regex: new RegExp(`^${name}$`, "i") },
      role: { $regex: new RegExp(`^${role}$`, "i") },
    });

    const count = await ClubMember.countDocuments({ clubId: slug });
    const newDoc = await ClubMember.create({
      clubId: slug,
      name,
      role,
      batch,
      photo: photoUrl,
      order: order || count,
      active,
    });

    await logAuditAction({
      actorEmail: session.email,
      entity: "ClubMember",
      entityId: String(newDoc._id),
      action: "create",
      after: newDoc.toObject(),
    });

    revalidatePath(`/clubs/${slug}`);
    return NextResponse.json({
      success: true,
      member: newDoc,
      warning: duplicate ? `Notice: A member named "${name}" with role "${role}" already exists.` : undefined,
    });
  } catch (err: unknown) {
    console.error("[Club Members POST Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to create member";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// Bulk update (reorder, move to another club)
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
    const { action, items, memberId, targetClubId } = body;

    // 1. Reorder
    if (action === "reorder" && Array.isArray(items)) {
      for (const item of items) {
        if (item.id && typeof item.order === "number") {
          await ClubMember.updateOne(
            { _id: item.id, clubId: slug },
            { $set: { order: item.order } }
          );
        }
      }
      await logAuditAction({
        actorEmail: session.email,
        entity: "ClubMember",
        entityId: slug,
        action: "reorder",
        after: { reorderedCount: items.length },
      });
      revalidatePath(`/clubs/${slug}`);
      return NextResponse.json({ success: true, message: "Order updated" });
    }

    // 2. Move member to another club
    if (action === "move-club" && memberId && targetClubId) {
      const doc = await ClubMember.findOne({ _id: memberId, clubId: slug });
      if (!doc) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      const before = doc.toObject();
      doc.clubId = targetClubId;
      await doc.save();

      await logAuditAction({
        actorEmail: session.email,
        entity: "ClubMember",
        entityId: memberId,
        action: "update",
        before,
        after: { movedTo: targetClubId },
      });

      revalidatePath(`/clubs/${slug}`);
      revalidatePath(`/clubs/${targetClubId}`);

      return NextResponse.json({ success: true, message: `Member moved to ${targetClubId}` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[Club Members PUT Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to update members";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
