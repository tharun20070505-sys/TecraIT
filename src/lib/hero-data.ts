import { cache } from "react";
import { access } from "node:fs/promises";
import path from "node:path";
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

const HERO_IMAGE = "/images/hero/tecra-it-campus.webp";

async function getFixedHeroSlide(): Promise<HeroSlide[]> {
  try {
    await access(path.join(process.cwd(), "public", "images/hero/tecra-it-campus.webp"));
  } catch {
    return [];
  }

  return [{
    id: "tecra-it-fixed-hero",
    url: HERO_IMAGE,
    responsiveUrls: [],
    blurDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%230c1535'/%3E%3C/svg%3E",
    label: "",
    focalDesktop: { x: 50, y: 50 },
    focalMobile: { x: 50, y: 50 },
    overlay: null,
    active: true,
    order: 0,
  }];
}

export const getHeroPresentation = cache(async (): Promise<HeroPresentation> => {
  const slides = await getFixedHeroSlide();

  return {
    slides,
    intervalSeconds: DEFAULT_HERO_INTERVAL_SECONDS,
    overlayMinimum: HERO_OVERLAY_MINIMUM,
    heroTitleLineOne: "TECRA",
    heroTitleLineTwo: "Department of Information Technology",
    heroTextSeconds: 3,
  };
});
