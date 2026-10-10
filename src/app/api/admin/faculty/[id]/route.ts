import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Faculty } from "@/models";

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
      updated = await Faculty.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    }

    if (!updated) {
      // Fallback matching for static/seed IDs like "fac-hod"
      const query = id === "fac-hod" || body.isHod ? { isHod: true } : { name: body.name };
      updated = await Faculty.findOneAndUpdate(query, body, { new: true, upsert: true });
    }

    if (!updated) {
      return NextResponse.json({ error: "Faculty member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, faculty: updated });
  } catch (err: unknown) {
    console.error("[Faculty Update Error]", err);
    return NextResponse.json({ error: "Failed to update faculty member" }, { status: 500 });
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
      await Faculty.findByIdAndDelete(id);
    } else {
      const query = id === "fac-hod" ? { isHod: true } : { name: { $regex: new RegExp(`^${id}$`, "i") } };
      await Faculty.findOneAndDelete(query);
    }

    return NextResponse.json({ success: true, message: "Faculty member removed" });
  } catch (err: unknown) {
    console.error("[Faculty Delete Error]", err);
    return NextResponse.json({ error: "Failed to delete faculty member" }, { status: 500 });
  }
}
