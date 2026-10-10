import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ErrorLog } from "@/models";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, stack, digest, pathname } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await ErrorLog.create({
          message: String(message).slice(0, 500),
          stack: String(stack || "").slice(0, 3000),
          digest: String(digest || "").slice(0, 100),
          pathname: String(pathname || "").slice(0, 200),
          userAgent: String(userAgent).slice(0, 250),
          ip,
          timestamp: new Date(),
        });
      }
    } catch (dbErr) {
      console.warn("[ErrorLog API] Failed to write error log to MongoDB:", dbErr);
    }

    return NextResponse.json({ logged: true }, { status: 200 });
  } catch {
    return NextResponse.json({ logged: false }, { status: 500 });
  }
}
