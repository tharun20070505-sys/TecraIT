import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { AuditLog, HeroImage, SiteSettingsModel, type IHeroImage } from "@/models";
import { DEFAULT_HERO_INTERVAL_SECONDS, HERO_OVERLAY_MINIMUM } from "@/lib/hero-data";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_ACTIVE = 8;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const OUTPUT_WIDTHS = [960, 1600, 2400];
const HERO_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "hero");

type HeroPatch = {
  id: string;
  label?: string;
  focalDesktop?: { x: number; y: number };
  focalMobile?: { x: number; y: number };
  overlay?: number | null;
  active?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  order?: number;
};

function slideJson(doc: IHeroImage) {
  return {
    id: String(doc._id),
    url: doc.url,
    responsiveUrls: doc.responsiveUrls ?? [],
    blurDataUrl: doc.blurDataUrl ?? "",
    label: doc.label ?? "",
    focalDesktop: doc.focalDesktop ?? { x: 50, y: 50 },
    focalMobile: doc.focalMobile ?? { x: 50, y: 50 },
    overlay: doc.overlay ?? null,
    active: doc.active ?? true,
    startAt: doc.startAt?.toISOString() ?? null,
    endAt: doc.endAt?.toISOString() ?? null,
    order: doc.order ?? 0,
  };
}

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

async function writeAudit(
  actorEmail: string,
  action: "create" | "update" | "delete" | "reorder" | "settings",
  entityId: string,
  before?: unknown,
  after?: unknown
) {
  await AuditLog.create({ actorEmail, entity: "HeroImage", entityId, action, before, after });
}

function normalizeFocal(value: unknown) {
  const point = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const x = Number(point.x);
  const y = Number(point.y);
  return {
    x: Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 50,
    y: Number.isFinite(y) ? Math.max(0, Math.min(100, y)) : 50,
  };
}

function validDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function refreshPublicHero() {
  revalidatePath("/", "layout");
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    const [docs, settings] = await Promise.all([
      HeroImage.find().sort({ order: 1, createdAt: 1 }).lean<IHeroImage[]>(),
      SiteSettingsModel.findOne().select("heroIntervalSeconds heroOverlayMinimum").lean(),
    ]);
    return NextResponse.json({
      slides: docs.map(slideJson),
      intervalSeconds: Math.max(5, Math.min(20, Number(settings?.heroIntervalSeconds) || DEFAULT_HERO_INTERVAL_SECONDS)),
      overlayMinimum: Math.max(HERO_OVERLAY_MINIMUM, Number(settings?.heroOverlayMinimum) || HERO_OVERLAY_MINIMUM),
    });
  } catch (error) {
    console.error("[Hero Slides GET]", error);
    return NextResponse.json({ error: "Could not load hero images" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const writtenFiles: string[] = [];
  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const form = await req.formData();
    const files = form.getAll("files").filter((entry): entry is File => entry instanceof File);
    const uploadActive = form.get("active") !== "false";
    if (files.length === 0) return NextResponse.json({ error: "Choose at least one image" }, { status: 400 });
    if (files.some((file) => file.size > MAX_FILE_BYTES)) {
      return NextResponse.json({ error: "Each image must be 8 MB or smaller" }, { status: 413 });
    }
    if (files.some((file) => !ALLOWED_MIME_TYPES.has(file.type))) {
      return NextResponse.json({ error: "Only JPG, PNG, and WebP images are accepted" }, { status: 400 });
    }

    const currentActiveCount = await HeroImage.countDocuments({ active: true });
    if (uploadActive && currentActiveCount + files.length > MAX_ACTIVE) {
      return NextResponse.json({
        error: `Only ${MAX_ACTIVE} images can be active. Choose inactive uploads or deactivate an image first.`,
      }, { status: 409 });
    }

    await fs.mkdir(HERO_UPLOAD_DIR, { recursive: true });
    const last = await HeroImage.findOne().sort({ order: -1 }).select("order").lean();
    let nextOrder = (last?.order ?? 0) + 1;
    const created = [];

    for (const file of files) {
      const source = Buffer.from(await file.arrayBuffer());
      const image = sharp(source, { limitInputPixels: 60_000_000 });
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height || !["jpeg", "png", "webp"].includes(metadata.format ?? "")) {
        throw new Error(`${file.name} is not a valid JPEG, PNG, or WebP image`);
      }
      const id = randomUUID();
      const widths = OUTPUT_WIDTHS.filter((width) => width < metadata.width!);
      const finalWidths = [...widths, metadata.width > 0 ? Math.min(metadata.width, OUTPUT_WIDTHS.at(-1)!) : 960];
      const uniqueWidths = Array.from(new Set(finalWidths)).sort((a, b) => a - b);
      const urls: string[] = [];
      for (const width of uniqueWidths) {
        const fileName = `${id}-${width}.webp`;
        const outputPath = path.join(HERO_UPLOAD_DIR, fileName);
        await sharp(source, { limitInputPixels: 60_000_000 })
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82, effort: 4 })
          .toFile(outputPath);
        writtenFiles.push(outputPath);
        urls.push(`/uploads/hero/${fileName}`);
      }
      const blurBuffer = await sharp(source, { limitInputPixels: 60_000_000 })
        .rotate()
        .resize({ width: 24, withoutEnlargement: true })
        .webp({ quality: 35 })
        .toBuffer();
      const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
      const url = urls.at(-1)!;
      const doc = await HeroImage.create({
        url,
        responsiveUrls: urls,
        blurDataUrl,
        label: path.parse(file.name).name.slice(0, 100),
        active: uploadActive,
        order: nextOrder++,
      });
      created.push(doc);
      await writeAudit(session.email, "create", String(doc._id), undefined, slideJson(doc));
    }

    await refreshPublicHero();
    return NextResponse.json({ success: true, slides: created.map((doc) => slideJson(doc)) });
  } catch (error) {
    await Promise.all(writtenFiles.map((file) => fs.unlink(file).catch(() => undefined)));
    console.error("[Hero Slides POST]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    const body = await req.json() as { slides?: HeroPatch[]; intervalSeconds?: number };
    const patches = Array.isArray(body.slides) ? body.slides : [];
    const interval = body.intervalSeconds;
    if (interval !== undefined && (!Number.isInteger(interval) || interval < 5 || interval > 20)) {
      return NextResponse.json({ error: "Slideshow interval must be between 5 and 20 seconds" }, { status: 400 });
    }

    const ids = patches.map((patch) => patch.id);
    const current = await HeroImage.find({ _id: { $in: ids } }).lean<IHeroImage[]>();
    if (current.length !== ids.length) return NextResponse.json({ error: "One or more hero images were not found" }, { status: 404 });
    const currentById = new Map(current.map((doc) => [String(doc._id), doc]));
    const updates = patches.map((patch) => {
      const existing = currentById.get(patch.id)!;
      const startAt = validDate(patch.startAt);
      const endAt = validDate(patch.endAt);
      if (startAt === undefined || endAt === undefined) throw new Error("Enter valid seasonal start and end dates");
      if (startAt && endAt && startAt.getTime() > endAt.getTime()) {
        throw new Error("Season end must be after season start");
      }
      const overlay = patch.overlay === undefined ? existing.overlay : patch.overlay;
      if (overlay !== null && (!Number.isFinite(overlay) || overlay < HERO_OVERLAY_MINIMUM || overlay > 0.95)) {
        throw new Error(`Overlay must be between ${HERO_OVERLAY_MINIMUM} and 0.95`);
      }
      return {
        patch,
        existing,
        values: {
          label: patch.label === undefined ? existing.label : String(patch.label).slice(0, 100),
          focalDesktop: patch.focalDesktop === undefined ? existing.focalDesktop : normalizeFocal(patch.focalDesktop),
          focalMobile: patch.focalMobile === undefined ? existing.focalMobile : normalizeFocal(patch.focalMobile),
          overlay,
          active: patch.active === undefined ? existing.active : Boolean(patch.active),
          startAt,
          endAt,
          order: patch.order === undefined ? existing.order : Math.max(0, Math.floor(patch.order)),
        },
      };
    });
    const activeCount = await HeroImage.countDocuments({ active: true });
    const priorActive = current.filter((doc) => doc.active).length;
    const updatedActive = updates.filter((entry) => entry.values.active).length;
    if (activeCount - priorActive + updatedActive > MAX_ACTIVE) {
      return NextResponse.json({ error: `Only ${MAX_ACTIVE} hero images can be active` }, { status: 409 });
    }

    for (const { patch, existing, values } of updates) {
      const before = slideJson(existing as IHeroImage);
      const changed = await HeroImage.findByIdAndUpdate(patch.id, { $set: values }, { new: true, runValidators: true });
      if (changed) {
        await writeAudit(session.email, values.order !== existing.order ? "reorder" : "update", patch.id, before, slideJson(changed));
      }
    }

    let settings = await SiteSettingsModel.findOne();
    if (!settings) settings = new SiteSettingsModel();
    if (interval !== undefined && settings.heroIntervalSeconds !== interval) {
      const oldInterval = settings.heroIntervalSeconds ?? DEFAULT_HERO_INTERVAL_SECONDS;
      settings.heroIntervalSeconds = interval;
      await settings.save();
      await AuditLog.create({
        actorEmail: session.email,
        entity: "SiteSettings",
        entityId: String(settings._id),
        action: "settings",
        before: { heroIntervalSeconds: oldInterval },
        after: { heroIntervalSeconds: interval },
      });
    }

    await refreshPublicHero();
    const saved = await HeroImage.find().sort({ order: 1, createdAt: 1 }).lean<IHeroImage[]>();
    return NextResponse.json({ success: true, slides: saved.map(slideJson), intervalSeconds: settings.heroIntervalSeconds ?? DEFAULT_HERO_INTERVAL_SECONDS });
  } catch (error) {
    console.error("[Hero Slides PATCH]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Hero settings update failed" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Image id is required" }, { status: 400 });
    const doc = await HeroImage.findById(id);
    if (!doc) return NextResponse.json({ error: "Hero image not found" }, { status: 404 });
    const snapshot = slideJson(doc);
    await writeAudit(session.email, "delete", id, snapshot);
    await HeroImage.deleteOne({ _id: id });

    const urls = new Set([doc.url, ...(doc.responsiveUrls ?? [])]);
    for (const url of urls) {
      const relative = url.replace(/^\/+/, "");
      if (!relative.startsWith("uploads/hero/")) continue;
      const filePath = path.join(process.cwd(), "public", relative);
      const resolvedDirectory = path.resolve(HERO_UPLOAD_DIR);
      if (!path.resolve(filePath).startsWith(`${resolvedDirectory}${path.sep}`)) continue;
      await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") console.warn("[Hero Slides DELETE] Could not remove image asset", error);
      });
    }

    await refreshPublicHero();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[Hero Slides DELETE]", error);
    return NextResponse.json({ error: "Could not remove hero image" }, { status: 500 });
  }
}
