import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { GalleryImage } from "@/models";

import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json(
        { error: "Database offline. Operating in fallback read mode." },
        { status: 503 }
      );
    }

    if (mongoose.isValidObjectId(id)) {
      await GalleryImage.findByIdAndDelete(id);
    } else {
      await GalleryImage.findOneAndDelete({ $or: [{ id }, { title: id }] });
    }

    return NextResponse.json({ success: true, message: "Photograph removed" });
  } catch (err: unknown) {
    console.error("[Gallery Delete Error]", err);
    return NextResponse.json({ error: "Failed to delete photograph" }, { status: 500 });
  }
}
