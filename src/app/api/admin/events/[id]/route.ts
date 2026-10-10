import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/models";

import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json(
        { error: "Database offline. Operating in fallback read mode." },
        { status: 503 }
      );
    }

    let updated = null;
    if (mongoose.isValidObjectId(id)) {
      updated = await Event.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    }

    if (!updated && body.slug) {
      updated = await Event.findOneAndUpdate({ slug: body.slug }, body, { new: true, upsert: true });
    }

    if (!updated) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event: updated });
  } catch (err: unknown) {
    console.error("[Event Update Error]", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
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
      await Event.findByIdAndDelete(id);
    } else {
      await Event.findOneAndDelete({ slug: id });
    }

    return NextResponse.json({ success: true, message: "Event removed" });
  } catch (err: unknown) {
    console.error("[Event Delete Error]", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
