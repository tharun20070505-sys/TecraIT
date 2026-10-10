import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { GalleryImage } from "@/models";
import { getGalleryItems } from "@/lib/db-data";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getGalleryItems();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, imageUrl, category, caption, date, order } = body;

    if (!title || !imageUrl || !category) {
      return NextResponse.json(
        { error: "Title, image URL, and category are required." },
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

    const newImage = await GalleryImage.create({
      title,
      imageUrl,
      category,
      caption: caption || "",
      date: date || new Date().toISOString().split("T")[0],
      order: Number(order) || 0,
    });

    return NextResponse.json({ success: true, image: newImage }, { status: 201 });
  } catch (err: unknown) {
    console.error("[Gallery Create Error]", err);
    return NextResponse.json({ error: "Failed to add gallery photograph" }, { status: 500 });
  }
}
