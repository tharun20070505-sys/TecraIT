import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
    const session = await verifySession(sessionToken);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Allowed formats: PNG, JPEG, WebP, SVG, PDF.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 5MB maximum limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and create unique file name
    const timestamp = Date.now();
    const originalExt = path.extname(file.name) || ".png";
    const baseName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);
    const fileName = `${baseName}-${timestamp}${originalExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
      fileName,
      size: file.size,
    });
  } catch (err) {
    console.error("[Upload API Error]", err);
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 }
    );
  }
}
