import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { AuditLog } from "@/models";

// Magic bytes checks
export function isPngSignature(buffer: Buffer): boolean {
  if (buffer.length < 8) return false;
  return (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  );
}

export function isJpgSignature(buffer: Buffer): boolean {
  if (buffer.length < 3) return false;
  return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

export function isWebpSignature(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  return (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

/**
 * Audit log helper
 */
export async function logAuditAction(params: {
  actorEmail: string;
  entity: string;
  entityId: string;
  action: "create" | "update" | "delete" | "reorder" | "settings";
  before?: unknown;
  after?: unknown;
}) {
  try {
    await AuditLog.create({
      actorEmail: params.actorEmail,
      entity: params.entity,
      entityId: params.entityId,
      action: params.action,
      before: params.before,
      after: params.after,
    });
  } catch (err) {
    console.warn("[AuditLog] Failed to log action", err);
  }
}

/**
 * Safely delete a file from the uploads directory
 */
export async function deleteUploadedFile(fileUrl: string | undefined): Promise<boolean> {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return false;
  try {
    const relativePath = fileUrl.replace(/^\/+/, "");
    const uploadRoot = path.resolve(process.cwd(), "public", "uploads");
    const absolutePath = path.resolve(process.cwd(), "public", relativePath);

    // Prevent path traversal outside public/uploads
    if (!absolutePath.startsWith(uploadRoot)) {
      console.warn("[Delete File] Path traversal attempt blocked:", fileUrl);
      return false;
    }

    await fs.unlink(absolutePath);
    return true;
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== "ENOENT") {
      console.warn("[Delete File] Could not delete file:", fileUrl, err);
    }
    return false;
  }
}

/**
 * Process and validate Logo uploads:
 * - PNG only, checked by file signature
 * - Long side >= 400px
 * - Max 2MB
 * - Trim extra transparent padding automatically
 * - Never upscale
 * - Strip EXIF
 * - Detect solid white background warning
 */
export async function validateAndProcessLogo(
  buffer: Buffer,
  subFolder = "logos"
): Promise<{
  url: string;
  fileName: string;
  width: number;
  height: number;
  warning?: string;
}> {
  // 1. File size check (2 MB)
  if (buffer.length > 2 * 1024 * 1024) {
    throw new Error("Logo file exceeds 2 MB maximum limit");
  }

  // 2. Magic byte check
  if (!isPngSignature(buffer)) {
    throw new Error("Logo must be a genuine PNG file with valid file signature");
  }

  // 3. Inspect metadata
  const image = sharp(buffer);
  const meta = await image.metadata();

  const origWidth = meta.width ?? 0;
  const origHeight = meta.height ?? 0;
  const longSide = Math.max(origWidth, origHeight);

  if (longSide < 400) {
    throw new Error(
      `Logo must be at least 400 pixels on the long side (current: ${origWidth} by ${origHeight} pixels)`
    );
  }

  // 4. White box detection
  let whiteBoxWarning: string | undefined;
  try {
    const { data, info } = await sharp(buffer)
      .resize(64, 64, { fit: "fill" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Check corners: top-left (0,0), top-right (63,0), bottom-left (0,63), bottom-right (63,63)
    const corners = [
      0, // top-left
      (info.width - 1) * 4, // top-right
      (info.width * (info.height - 1)) * 4, // bottom-left
      (info.width * info.height - 1) * 4, // bottom-right
    ];

    let whiteCorners = 0;
    for (const offset of corners) {
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const a = data[offset + 3];
      // Opaque and near white (luminance > 230)
      if (a > 240 && r > 230 && g > 230 && b > 230) {
        whiteCorners++;
      }
    }

    if (whiteCorners >= 3 || (!meta.hasAlpha && whiteCorners >= 2)) {
      whiteBoxWarning =
        "This logo has a white box around it. Use a transparent PNG for the best result";
    }
  } catch {
    // Non-fatal if corner analysis fails
  }

  // 5. Trim extra transparent padding automatically (never upscale)
  let trimmedImage = sharp(buffer).rotate(); // auto orient & strip EXIF
  try {
    trimmedImage = trimmedImage.trim();
  } catch {
    // Keep original if trim fails
  }

  // Output optimized PNG
  const fileName = `logo-${randomUUID().slice(0, 10)}.png`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", subFolder);
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  const outInfo = await trimmedImage.png({ quality: 90, compressionLevel: 9 }).toFile(filePath);

  return {
    url: `/uploads/${subFolder}/${fileName}`,
    fileName,
    width: outInfo.width,
    height: outInfo.height,
    warning: whiteBoxWarning,
  };
}

/**
 * Process and validate Club Images (Reel):
 * - JPG, PNG or WebP
 * - Up to 8 MB
 * - Strip EXIF
 * - Convert to optimized WebP
 * - Generate blurDataUrl
 */
export async function validateAndProcessClubImage(
  buffer: Buffer,
  subFolder = "clubs"
): Promise<{
  url: string;
  blurDataUrl: string;
  fileName: string;
  width: number;
  height: number;
}> {
  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error("Club image exceeds 8 MB limit");
  }

  if (!isJpgSignature(buffer) && !isPngSignature(buffer) && !isWebpSignature(buffer)) {
    throw new Error("File must be a genuine JPG, PNG or WebP image");
  }

  const image = sharp(buffer).rotate(); // auto-orient & strip EXIF
  const meta = await image.metadata();

  const width = meta.width ?? 1600;
  const height = meta.height ?? 1000;

  // Resize down if excessively large (e.g. > 2400px), preserving aspect ratio
  let processed = image;
  if (width > 2400 || height > 2400) {
    processed = processed.resize({
      width: width > height ? 2400 : undefined,
      height: height >= width ? 2400 : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const fileName = `club-img-${randomUUID().slice(0, 10)}.webp`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", subFolder);
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  const outInfo = await processed.webp({ quality: 85 }).toFile(filePath);

  // Generate tiny blur placeholder base64
  let blurDataUrl = "";
  try {
    const blurBuffer = await sharp(buffer)
      .resize(16, 10, { fit: "cover" })
      .webp({ quality: 30 })
      .toBuffer();
    blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
  } catch {
    blurDataUrl = "";
  }

  return {
    url: `/uploads/${subFolder}/${fileName}`,
    blurDataUrl,
    fileName,
    width: outInfo.width,
    height: outInfo.height,
  };
}

/**
 * Process Member Photo:
 * - Square crop, up to 3MB
 * - JPG, PNG or WebP
 * - Strip EXIF
 */
export async function validateAndProcessMemberPhoto(
  buffer: Buffer
): Promise<{
  url: string;
  fileName: string;
}> {
  if (buffer.length > 3 * 1024 * 1024) {
    throw new Error("Member photo exceeds 3 MB limit");
  }

  if (!isJpgSignature(buffer) && !isPngSignature(buffer) && !isWebpSignature(buffer)) {
    throw new Error("Member photo must be a genuine JPG, PNG or WebP image");
  }

  const fileName = `member-${randomUUID().slice(0, 10)}.webp`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "members");
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  await sharp(buffer)
    .rotate()
    .resize(400, 400, { fit: "cover", position: "attention" })
    .webp({ quality: 85 })
    .toFile(filePath);

  return {
    url: `/uploads/members/${fileName}`,
    fileName,
  };
}
