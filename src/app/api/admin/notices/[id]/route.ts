import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Notice } from "@/models";

import mongoose from "mongoose";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const updateData = {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.link !== undefined && { link: body.link.trim() }),
      ...(body.startDate !== undefined && { startDate: body.startDate }),
      ...(body.endDate !== undefined && { endDate: body.endDate }),
      ...(body.active !== undefined && { active: Boolean(body.active) }),
      ...(body.order !== undefined && { order: Number(body.order) }),
    };

    let updated = null;
    if (mongoose.isValidObjectId(id)) {
      updated = await Notice.findByIdAndUpdate(id, updateData, { new: true });
    }

    if (!updated && body.title) {
      updated = await Notice.findOneAndUpdate({ title: body.title.trim() }, updateData, { new: true, upsert: true });
    }

    if (!updated) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      notice: {
        id: String(updated._id),
        title: updated.title,
        link: updated.link,
        startDate: updated.startDate,
        endDate: updated.endDate,
        active: updated.active,
        order: updated.order,
      },
    });
  } catch (err) {
    console.error("[Notice PUT Error]", err);
    return NextResponse.json(
      { error: "Failed to update notice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    let deleted = null;
    if (mongoose.isValidObjectId(id)) {
      deleted = await Notice.findByIdAndDelete(id);
    } else {
      deleted = await Notice.findOneAndDelete({ $or: [{ id }, { title: id }] });
    }

    if (!deleted) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (err) {
    console.error("[Notice DELETE Error]", err);
    return NextResponse.json(
      { error: "Failed to delete notice" },
      { status: 500 }
    );
  }
}
