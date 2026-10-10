import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NavItemModel } from "@/models";
import { defaultNavItems } from "@/lib/db-data";
import type { INavItem } from "@/models/NavItemModel";

/** Seed the collection with defaults if it is empty (first run). */
async function ensureSeeded() {
  const count = await NavItemModel.countDocuments();
  if (count === 0) {
    await NavItemModel.insertMany(
      defaultNavItems.map((n, i) => ({
        label: n.label,
        href: n.href,
        type: n.type,
        autoSource: n.autoSource ?? null,
        children: n.children,
        order: n.order ?? i + 1,
        visible: n.visible,
        isSystem: n.isSystem,
      }))
    );
  }
}

// ─── GET /api/admin/nav-items ─────────────────────────────────────────────────
export async function GET() {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      await ensureSeeded();
      const docs = await NavItemModel.find().sort({ order: 1 }).lean<INavItem[]>();
      const items = docs.map((doc) => ({
        id: String(doc._id),
        label: doc.label,
        href: doc.href,
        type: doc.type,
        autoSource: doc.autoSource ?? null,
        children: (doc.children || []).map((c) => ({
          label: c.label,
          href: c.href,
          order: c.order,
          visible: c.visible,
        })),
        order: doc.order,
        visible: doc.visible,
        isSystem: doc.isSystem,
      }));
      return NextResponse.json({ items });
    }
  } catch (err) {
    console.warn("[nav-items GET]", err);
  }
  // Fallback: static defaults (no auth needed for read)
  return NextResponse.json({ items: defaultNavItems });
}

// ─── POST /api/admin/nav-items ────────────────────────────────────────────────
// Create a new custom nav item.
export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { label, href, type = "page", children = [], order = 99, visible = true } = body;

    if (!label?.trim()) return NextResponse.json({ error: "Label is required" }, { status: 400 });
    if (!href?.trim()) return NextResponse.json({ error: "Href is required" }, { status: 400 });

    const { isConnected } = await connectToDatabase();
    if (!isConnected) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    await ensureSeeded();
    const doc = await NavItemModel.create({
      label: label.trim(),
      href: href.trim(),
      type,
      children,
      order,
      visible,
      isSystem: false,
    });

    return NextResponse.json({
      item: {
        id: String(doc._id),
        label: doc.label,
        href: doc.href,
        type: doc.type,
        children: doc.children,
        order: doc.order,
        visible: doc.visible,
        isSystem: doc.isSystem,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("[nav-items POST]", err);
    return NextResponse.json({ error: "Failed to create nav item" }, { status: 500 });
  }
}

// ─── PUT /api/admin/nav-items ─────────────────────────────────────────────────
// Bulk-save the full ordered list (reorder, bulk visibility toggle).
export async function PUT(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { items } = body as {
      items: Array<{
        id: string;
        label: string;
        href: string;
        type: string;
        autoSource?: string | null;
        children: Array<{ label: string; href: string; order: number; visible: boolean }>;
        order: number;
        visible: boolean;
        isSystem: boolean;
      }>;
    };

    if (!Array.isArray(items)) return NextResponse.json({ error: "items array required" }, { status: 400 });

    const { isConnected } = await connectToDatabase();
    if (!isConnected) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    await ensureSeeded();

    // Upsert each item by its id (create if new, update if existing)
    const bulkOps = items.map((item, idx) => {
      const isObjectId = /^[a-f0-9]{24}$/.test(item.id);
      // Cast type explicitly to satisfy Mongoose's strict union type
      const safeType = (["page", "dropdown", "auto"].includes(item.type) ? item.type : "page") as
        | "page"
        | "dropdown"
        | "auto";
      return {
        updateOne: {
          filter: isObjectId
            ? ({ _id: item.id } as Record<string, unknown>)
            : ({ label: item.label, href: item.href } as Record<string, unknown>),
          update: {
            $set: {
              label: item.label,
              href: item.href,
              type: safeType,
              autoSource: item.autoSource ?? undefined,
              children: item.children,
              order: item.order ?? idx + 1,
              visible: item.visible,
              isSystem: item.isSystem,
            },
          },
          upsert: true,
        },
      };
    });

    await NavItemModel.bulkWrite(bulkOps);

    const updated = await NavItemModel.find().sort({ order: 1 }).lean<INavItem[]>();
    return NextResponse.json({
      items: updated.map((doc) => ({
        id: String(doc._id),
        label: doc.label,
        href: doc.href,
        type: doc.type,
        autoSource: doc.autoSource ?? null,
        children: doc.children,
        order: doc.order,
        visible: doc.visible,
        isSystem: doc.isSystem,
      })),
    });
  } catch (err) {
    console.error("[nav-items PUT]", err);
    return NextResponse.json({ error: "Failed to save nav items" }, { status: 500 });
  }
}
