import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Notice } from "@/models";
import { getNotices } from "@/lib/db-data";

export async function GET() {
  // Public or admin can get notices
  const notices = await getNotices();
  return NextResponse.json({ notices });
}

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, link, startDate, endDate, active, order } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Notice title is required." },
        { status: 400 }
      );
    }

    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json(
        { error: "Database offline. Operating in fallback read mode." },
        { status: 503 }
      );
    }

    const newNotice = await Notice.create({
      title: title.trim(),
      link: link ? link.trim() : "",
      startDate: startDate || "",
      endDate: endDate || "",
      active: active !== undefined ? Boolean(active) : true,
      order: typeof order === "number" ? order : 0,
    });

    return NextResponse.json(
      {
        success: true,
        notice: {
          id: String(newNotice._id),
          title: newNotice.title,
          link: newNotice.link,
          startDate: newNotice.startDate,
          endDate: newNotice.endDate,
          active: newNotice.active,
          order: newNotice.order,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Notices POST Error]", err);
    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 }
    );
  }
}
