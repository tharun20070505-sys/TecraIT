import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Faculty } from "@/models";
import { getFaculty } from "@/lib/db-data";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const faculty = await getFaculty();
  return NextResponse.json({ faculty });
}

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      position,
      qualification,
      specialisation,
      email,
      contactNumber,
      showEmail,
      showContactNumber,
      photoUrl,
      isHod,
      bio,
      quote,
      quota,
      quotaLabel,
      order,
    } = body;

    if (!name || !position || !qualification || !specialisation) {
      return NextResponse.json(
        { error: "Name, position, qualification, and specialisation are required." },
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

    const newFaculty = await Faculty.create({
      name,
      position,
      qualification,
      specialisation,
      email: email || "",
      contactNumber: contactNumber || "",
      showEmail: showEmail ?? true,
      showContactNumber: showContactNumber ?? false,
      photoUrl: photoUrl || "/images/faculty/faculty-placeholder.png",
      isHod: isHod ?? false,
      bio: bio || "",
      quote: quote || "",
      quota: quota || "",
      quotaLabel: quotaLabel || "Cadre",
      order: Number(order) || 0,
    });

    return NextResponse.json({ success: true, faculty: newFaculty }, { status: 201 });
  } catch (err: unknown) {
    console.error("[Faculty Create Error]", err);
    return NextResponse.json({ error: "Failed to create faculty record" }, { status: 500 });
  }
}
