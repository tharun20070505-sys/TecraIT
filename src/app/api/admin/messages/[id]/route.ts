import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ContactMessage } from "@/models";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
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
      return NextResponse.json({ success: true, updated: body });
    }

    const updated = await ContactMessage.findByIdAndUpdate(id, body, {
      new: true,
    });
    return NextResponse.json({ success: true, message: updated });
  } catch (err: unknown) {
    console.error("[Message Patch Error]", err);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
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
    if (isConnected) {
      await ContactMessage.findByIdAndDelete(id);
    }
    return NextResponse.json({ success: true, message: "Inquiry removed" });
  } catch (err: unknown) {
    console.error("[Message Delete Error]", err);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
