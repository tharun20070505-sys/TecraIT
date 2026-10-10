import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NavItemModel } from "@/models";
import type { INavItem } from "@/models/NavItemModel";

// ─── PATCH /api/admin/nav-items/[id] ─────────────────────────────────────────
// Partial update: label, href, type, children, order, visible.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const { isConnected } = await connectToDatabase();
    if (!isConnected) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    // Build update object from supplied fields only
    const allowedFields = ["label", "href", "type", "autoSource", "children", "order", "visible"];
    const update: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) update[field] = body[field];
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const doc = await NavItemModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean<INavItem>();

    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      item: {
        id: String(doc._id),
        label: doc.label,
        href: doc.href,
        type: doc.type,
        autoSource: doc.autoSource ?? null,
        children: doc.children,
        order: doc.order,
        visible: doc.visible,
        isSystem: doc.isSystem,
      },
    });
  } catch (err) {
    console.error("[nav-items PATCH]", err);
    return NextResponse.json({ error: "Failed to update nav item" }, { status: 500 });
  }
}

// ─── DELETE /api/admin/nav-items/[id] ────────────────────────────────────────
// System items cannot be deleted, only hidden.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const doc = await NavItemModel.findById(id).lean<INavItem>();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.isSystem) {
      return NextResponse.json(
        { error: "System items cannot be deleted. Set visible=false to hide them." },
        { status: 403 }
      );
    }

    await NavItemModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[nav-items DELETE]", err);
    return NextResponse.json({ error: "Failed to delete nav item" }, { status: 500 });
  }
}
