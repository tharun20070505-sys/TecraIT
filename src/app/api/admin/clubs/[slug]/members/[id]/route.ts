import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ClubMember } from "@/models";
import {
  validateAndProcessMemberPhoto,
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

    const doc = await ClubMember.findOne({ _id: id, clubId: slug });
    if (!doc) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const before = doc.toObject();
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const name = formData.get("name") as string | null;
      const role = formData.get("role") as string | null;
      const batch = formData.get("batch") as string | null;
      const order = formData.get("order") as string | null;
      const active = formData.get("active") as string | null;
      const photoFile = formData.get("photo") as File | null;
      const removePhoto = formData.get("removePhoto") === "true";

      if (name && name.trim()) doc.name = name.trim();
      if (role && role.trim()) doc.role = role.trim();
      if (batch !== null) doc.batch = batch.trim();
      if (order !== null) doc.order = Number(order) || 0;
      if (active !== null) doc.active = active !== "false";

      if (removePhoto && doc.photo) {
        await deleteUploadedFile(doc.photo);
        doc.photo = "";
      } else if (photoFile && photoFile.size > 0) {
        if (doc.photo) await deleteUploadedFile(doc.photo);
        const buffer = Buffer.from(await photoFile.arrayBuffer());
        const processed = await validateAndProcessMemberPhoto(buffer);
        doc.photo = processed.url;
      }

      await doc.save();
    } else {
      const body = await req.json();
      const { name, role, batch, photo, order, active, clubId: newClubId } = body;

      if (name && String(name).trim()) doc.name = String(name).trim();
      if (role && String(role).trim()) doc.role = String(role).trim();
      if (batch !== undefined) doc.batch = String(batch).trim();
      if (photo !== undefined) doc.photo = String(photo).trim();
      if (order !== undefined) doc.order = Number(order) || 0;
      if (active !== undefined) doc.active = Boolean(active);
      if (newClubId && typeof newClubId === "string") doc.clubId = newClubId.trim();

      await doc.save();
    }

    await logAuditAction({
      actorEmail: session.email,
      entity: "ClubMember",
      entityId: id,
      action: "update",
      before,
      after: doc.toObject(),
    });

    revalidatePath(`/clubs/${slug}`);
    return NextResponse.json({ success: true, member: doc });
  } catch (err: unknown) {
    console.error("[Club Member PUT Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to update member";
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

    const doc = await ClubMember.findOne({ _id: id, clubId: slug });
    if (!doc) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const before = doc.toObject();

    if (doc.photo) {
      await deleteUploadedFile(doc.photo);
    }

    await ClubMember.deleteOne({ _id: id });

    await logAuditAction({
      actorEmail: session.email,
      entity: "ClubMember",
      entityId: id,
      action: "delete",
      before,
    });

    revalidatePath(`/clubs/${slug}`);
    return NextResponse.json({ success: true, message: "Member removed successfully" });
  } catch (err: unknown) {
    console.error("[Club Member DELETE Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to delete member";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
