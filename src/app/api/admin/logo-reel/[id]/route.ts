import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { LogoReelItem } from "@/models";
import { deleteUploadedFile, logAuditAction } from "@/lib/media-upload";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const doc = await LogoReelItem.findById(id);
    if (!doc) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const before = doc.toObject();

    // If custom logo was uploaded, remove file from disk
    if (doc.type === "custom") {
      if (doc.logoUrl) await deleteUploadedFile(doc.logoUrl);
      if (doc.logoDarkUrl) await deleteUploadedFile(doc.logoDarkUrl);
      await LogoReelItem.deleteOne({ _id: id });
    } else {
      // For club items, remove from reel list (or set active: false)
      await LogoReelItem.deleteOne({ _id: id });
    }

    await logAuditAction({
      actorEmail: session.email,
      entity: "LogoReelItem",
      entityId: id,
      action: "delete",
      before,
    });

    revalidatePath("/");
    revalidatePath("/clubs");

    return NextResponse.json({ success: true, message: "Logo reel item removed" });
  } catch (err: unknown) {
    console.error("[Logo Reel DELETE Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to delete item";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
