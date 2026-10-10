import { NextRequest, NextResponse } from "next/server";
import { signSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const seedEmail = process.env.ADMIN_SEED_EMAIL || "admin@tecra.sriet.ac.in";
    const seedPassword =
      process.env.ADMIN_SEED_PASSWORD || "TecraAdminSecurePass2026!";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const isAuthorized =
      trimmedEmail === seedEmail.toLowerCase() && password === seedPassword;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Invalid administrative credentials provided." },
        { status: 401 }
      );
    }

    const sessionToken = await signSession(trimmedEmail);

    const res = NextResponse.json({
      success: true,
      user: {
        email: trimmedEmail,
        role: "admin",
      },
    });

    res.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("[Admin Login Error]", err);
    return NextResponse.json(
      { error: "Internal authentication error" },
      { status: 500 }
    );
  }
}
