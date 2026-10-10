import { cache } from "react";
import { access } from "node:fs/promises";
import path from "node:path";
import { connectToDatabase } from "@/lib/mongodb";
import { HeroImage, SiteSettingsModel, type IHeroImage } from "@/models";
import type { HeroSlide } from "@/types";

export const HERO_OVERLAY_MINIMUM = 0.7;
export const DEFAULT_HERO_INTERVAL_SECONDS = 10;

export interface HeroPresentation {
  slides: HeroSlide[];
  intervalSeconds: number;
  overlayMinimum: number;
  heroTitleLineOne: string;
  heroTitleLineTwo: string;
  heroTextSeconds: number;
}

const fallbackFiles = [
  "/images/hero/hero-background.jpg",
  "/images/hero/hero-background.jpeg",
  "/images/hero/hero-background.png",
  "/images/hero/hero-background.webp",
  "/images/hero/sriet-campus.png",
];

async function getFallbackSlide(): Promise<HeroSlide[]> {
  for (const url of fallbackFiles) {
    try {
      await access(path.join(process.cwd(), "public", url.replace(/^\//, "")));
      return [{
        id: "static-hero-fallback",
        url,
        responsiveUrls: [],
        blurDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%230c1535'/%3E%3C/svg%3E",
        label: "",
        focalDesktop: { x: 50, y: 50 },
        focalMobile: { x: 50, y: 50 },
        overlay: null,
        active: true,
        order: 0,
      }];
    } catch {
      // Try the next documented fallback.
    }
  }
  return [];
}

function serializeSlide(doc: IHeroImage): HeroSlide {
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

export const getHeroPresentation = cache(async (): Promise<HeroPresentation> => {
  let slides: HeroSlide[] = [];
  let intervalSeconds = DEFAULT_HERO_INTERVAL_SECONDS;
  let overlayMinimum = HERO_OVERLAY_MINIMUM;
  let heroTitleLineOne = "TECRA";
  let heroTitleLineTwo = "Department of Information Technology";
  let heroTextSeconds = 3;

  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const [documents, settings] = await Promise.all([
        HeroImage.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean<IHeroImage[]>(),
        SiteSettingsModel.findOne().select("heroIntervalSeconds heroOverlayMinimum heroTitleLineOne heroTitleLineTwo heroTextSeconds").lean(),
      ]);
      const now = Date.now();
      slides = documents
        .filter((slide) =>
          (!slide.startAt || new Date(slide.startAt).getTime() <= now) &&
          (!slide.endAt || new Date(slide.endAt).getTime() >= now)
        )
        .slice(0, 8)
        .map(serializeSlide);
      intervalSeconds = Math.max(5, Math.min(20, Number(settings?.heroIntervalSeconds) || DEFAULT_HERO_INTERVAL_SECONDS));
      overlayMinimum = Math.max(
        HERO_OVERLAY_MINIMUM,
        Math.min(0.95, Number(settings?.heroOverlayMinimum) || HERO_OVERLAY_MINIMUM)
      );
      if (settings?.heroTitleLineOne) {
        heroTitleLineOne = settings.heroTitleLineOne;
      }
      if (settings?.heroTitleLineTwo) {
        heroTitleLineTwo = settings.heroTitleLineTwo;
      }
      if (settings?.heroTextSeconds) {
        heroTextSeconds = Math.max(2, Math.min(6, Number(settings.heroTextSeconds) || 3));
      }
    }
  } catch (error) {
    console.warn("[Hero Presentation] Database read failed; using static fallback", error);
  }

  if (slides.length === 0) slides = await getFallbackSlide();
  return { slides, intervalSeconds, overlayMinimum, heroTitleLineOne, heroTitleLineTwo, heroTextSeconds };
});
