import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/models";
import { getEvents } from "@/lib/db-data";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await getEvents();
  return NextResponse.json({ events });
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
      title,
      slug,
      date,
      time,
      venue,
      description,
      fullContent,
      posterUrl,
      isUpcoming,
      scope,
      category,
      registrationUrl,
    } = body;

    if (!title || !date || !time || !venue || !description || !scope || !category) {
      return NextResponse.json(
        { error: "Title, date, time, venue, description, scope, and category are required." },
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

    const computedSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newEvent = await Event.create({
      title,
      slug: computedSlug,
      date,
      time,
      venue,
      description,
      fullContent: fullContent || "",
      posterUrl: posterUrl || "/images/events/event-placeholder.png",
      isUpcoming: isUpcoming ?? true,
      scope,
      category,
      registerUrl: registrationUrl || "",
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (err: unknown) {
    console.error("[Event Create Error]", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
