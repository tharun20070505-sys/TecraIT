"use client";
/* eslint-disable @next/next/no-img-element -- Native image layers reuse predecoded sources to avoid duplicate optimizer requests and blank frames. */

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { HeroSlide } from "@/types";

const PRELOAD_AFTER_MS = 3_000;
const SESSION_INDEX_KEY = "tecra-hero-last-index";
const SESSION_COOKIE_NAME = "tecra-hero-last-index";
const NEXT_IMAGE_DEVICE_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

function rotationIsRestricted(): boolean {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    connection?.saveData === true || connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g";
}

interface HeroSlideshowProps {
  slides: HeroSlide[];
  intervalSeconds: number;
  overlayMinimum: number;
  initialIndex: number;
  paused: boolean;
}

interface PreparedSlide {
  fromIndex: number;
  index: number;
  src: string;
  isFallback?: boolean;
}

const CLIENT_FALLBACKS = [
  "/images/hero/hero-background.jpg",
  "/images/hero/hero-background.jpeg",
  "/images/hero/hero-background.png",
  "/images/hero/hero-background.webp",
  "/images/hero/sriet-campus.png",
];

function nextImageCandidates(slide: HeroSlide) {
  const configured = slide.responsiveUrls.map((url) => ({
    url,
    width: Number(url.match(/-(\d+)\.webp(?:\?.*)?$/)?.[1]) || 0,
  }));
  const optimized = NEXT_IMAGE_DEVICE_WIDTHS.map((width) => ({
    url: `/_next/image?url=${encodeURIComponent(slide.url)}&w=${width}&q=80`,
    width,
  }));
  return [...configured, ...optimized]
    .filter((candidate) => candidate.width > 0)
    .sort((a, b) => a.width - b.width)
    .filter((candidate, index, all) => index === 0 || candidate.width !== all[index - 1].width);
}

function nextImageSource(slide: HeroSlide, viewportWidth: number) {
  const target = viewportWidth * Math.min(window.devicePixelRatio || 1, 2);
  return nextImageCandidates(slide).find((candidate) => candidate.width >= target)?.url
    ?? nextImageCandidates(slide).at(-1)?.url
    ?? slide.url;
}

function reportFailedImage(url: string, reason: string) {
  void fetch("/api/log-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Hero slideshow image failed: ${reason}`,
      pathname: "/",
      digest: url.slice(0, 100),
    }),
  }).catch(() => undefined);
}

async function preloadAndDecode(src: string, onCreate?: (image: HTMLImageElement) => void): Promise<void> {
  const image = new window.Image();
  image.decoding = "async";
  onCreate?.(image);
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("The browser could not load this image"));
  });
  image.src = src;
  try {
    if (typeof image.decode === "function") await image.decode();
    else await loaded;
  } catch {
    if (!image.complete) await loaded;
    else if (image.naturalWidth === 0) await loaded;
  }
  if (image.naturalWidth === 0) throw new Error("Image decoded with zero width");
}

function imagePosition(slide: HeroSlide): CSSProperties {
  return {
    "--hero-focal-desktop": `${slide.focalDesktop.x}% ${slide.focalDesktop.y}%`,
    "--hero-focal-mobile": `${slide.focalMobile.x}% ${slide.focalMobile.y}%`,
  } as React.CSSProperties;
}

export function HeroSlideshow({
  slides,
  intervalSeconds,
  overlayMinimum,
  initialIndex,
  paused,
}: HeroSlideshowProps) {
  const safeInitialIndex = slides.length ? Math.max(0, Math.min(slides.length - 1, initialIndex)) : 0;
  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex);
  const initialCurrentIndexRef = useRef(safeInitialIndex);
  const [currentSource, setCurrentSource] = useState(slides[safeInitialIndex]?.url ?? "");
  const [hasRotated, setHasRotated] = useState(false);
  const [initialImageLoaded, setInitialImageLoaded] = useState(slides.length === 0);
  const [fadingTo, setFadingTo] = useState<PreparedSlide | null>(null);
  const [rotationAllowed, setRotationAllowed] = useState(false);
  const failedUrlsRef = useRef(new Set<string>());
  const fallbackShownRef = useRef(false);
  const preparedRef = useRef<PreparedSlide | null>(null);
  const preloadPromiseRef = useRef<Promise<PreparedSlide | null> | null>(null);
  const timerRefs = useRef<number[]>([]);
  const preloadImageRef = useRef<HTMLImageElement | null>(null);
  const mountedRef = useRef(true);
  const elapsedMsRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const pausedRef = useRef(paused);

  useLayoutEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      timerRefs.current.forEach((timer) => window.clearTimeout(timer));
      timerRefs.current = [];
      if (preloadImageRef.current) preloadImageRef.current.src = "";
      preloadImageRef.current = null;
    };
  }, []);

  const storeLastIndex = useCallback((index: number) => {
    try {
      window.sessionStorage.setItem(SESSION_INDEX_KEY, String(index));
    } catch {
      // Storage can be disabled; the session cookie remains a best-effort hint.
    }
    try {
      document.cookie = `${SESSION_COOKIE_NAME}=${index}; path=/; SameSite=Lax`;
    } catch {
      // Cookie restrictions must never interrupt the slideshow.
    }
  }, []);

  const getNextDecodedSlide = useCallback(async (): Promise<PreparedSlide | null> => {
    if (fallbackShownRef.current) return null;
    if (preparedRef.current?.fromIndex !== currentIndex) preparedRef.current = null;
    if (preparedRef.current) return preparedRef.current;
    if (preloadPromiseRef.current) return preloadPromiseRef.current;

    const loadNext = async () => {
      for (let step = 1; step < slides.length; step += 1) {
        const index = (currentIndex + step) % slides.length;
        const slide = slides[index];
        if (!slide || failedUrlsRef.current.has(slide.url)) continue;
        const src = nextImageSource(slide, window.innerWidth);
        try {
          await preloadAndDecode(src, (image) => { preloadImageRef.current = image; });
          if (!mountedRef.current) return null;
          const prepared = { fromIndex: currentIndex, index, src };
          preparedRef.current = prepared;
          return prepared;
        } catch (error) {
          if (!mountedRef.current) return null;
          failedUrlsRef.current.add(slide.url);
          reportFailedImage(slide.url, error instanceof Error ? error.message : "Unknown load error");
        }
      }
      for (const src of CLIENT_FALLBACKS) {
        if (slides.some((slide) => slide.url === src)) continue;
        try {
          await preloadAndDecode(src, (image) => { preloadImageRef.current = image; });
          if (!mountedRef.current) return null;
          fallbackShownRef.current = true;
          return { fromIndex: currentIndex, index: currentIndex, src, isFallback: true };
        } catch (error) {
          reportFailedImage(src, error instanceof Error ? error.message : "Static hero fallback failed");
        }
      }
      return null;
    };

    preloadPromiseRef.current = loadNext();
    try {
      return await preloadPromiseRef.current;
    } finally {
      preloadPromiseRef.current = null;
    }
  }, [currentIndex, slides]);

  useEffect(() => {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string; addEventListener?: (type: string, callback: () => void) => void; removeEventListener?: (type: string, callback: () => void) => void };
    }).connection;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      const restricted = media.matches || connection?.saveData === true ||
        connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g";
      setRotationAllowed(slides.length > 1 && !restricted);
      if (restricted && slides.length > 0) {
        setCurrentIndex(0);
        setCurrentSource(slides[0].url);
        setFadingTo(null);
        setHasRotated(false);
        setInitialImageLoaded(false);
        elapsedMsRef.current = 0;
        startedAtRef.current = null;
        preparedRef.current = null;
      }
    };
    updatePreference();
    media.addEventListener?.("change", updatePreference);
    connection?.addEventListener?.("change", updatePreference);
    return () => {
      media.removeEventListener?.("change", updatePreference);
      connection?.removeEventListener?.("change", updatePreference);
    };
  }, [slides]);

  useEffect(() => {
    if (slides.length === 0) return;
    let desiredIndex = initialIndex;
    if (!rotationIsRestricted() && slides.length > 1) {
      try {
        const lastIndex = Number(window.sessionStorage.getItem(SESSION_INDEX_KEY));
        if (Number.isInteger(lastIndex) && lastIndex >= 0) {
          desiredIndex = (lastIndex + 1) % slides.length;
        }
      } catch {
        // The server-provided cookie hint remains usable when sessionStorage is blocked.
      }
    } else {
      desiredIndex = 0;
    }

    let cancelled = false;
    const commitStartIndex = async () => {
      const target = slides[desiredIndex];
      if (!target) return;
      if (desiredIndex === initialCurrentIndexRef.current) {
        return;
      }
      const src = nextImageSource(target, window.innerWidth);
      try {
        await preloadAndDecode(src, (image) => { preloadImageRef.current = image; });
        if (cancelled) return;
        if (rotationIsRestricted()) {
          setCurrentIndex(0);
          setCurrentSource(slides[0]?.url ?? "");
          setHasRotated(false);
          setInitialImageLoaded(false);
          storeLastIndex(0);
        } else {
          setFadingTo({ fromIndex: initialCurrentIndexRef.current, index: desiredIndex, src });
        }
      } catch (error) {
        reportFailedImage(target.url, error instanceof Error ? error.message : "Could not restore session image");
        storeLastIndex(initialCurrentIndexRef.current);
      }
    };
    void commitStartIndex();
    return () => {
      cancelled = true;
    };
  }, [initialIndex, slides, storeLastIndex]);

  useEffect(() => {
    if (slides.length < 2 || !rotationAllowed || fadingTo || !initialImageLoaded) return;
    const clearTimers = () => {
      timerRefs.current.forEach((timer) => window.clearTimeout(timer));
      timerRefs.current = [];
    };

    if (paused) {
      if (startedAtRef.current !== null) {
        elapsedMsRef.current += performance.now() - startedAtRef.current;
        startedAtRef.current = null;
      }
      return clearTimers;
    }

    startedAtRef.current = performance.now();
    const elapsed = elapsedMsRef.current;
    const preloadDelay = Math.max(0, PRELOAD_AFTER_MS - elapsed);
    const rotationDelay = Math.max(0, intervalSeconds * 1000 - elapsed);

    timerRefs.current.push(window.setTimeout(() => {
      void getNextDecodedSlide();
    }, preloadDelay));

    timerRefs.current.push(window.setTimeout(async () => {
      const next = await getNextDecodedSlide();
      if (!mountedRef.current || pausedRef.current) return;
      if (next) {
        setFadingTo(next);
        return;
      }
      elapsedMsRef.current = 0;
      startedAtRef.current = null;
    }, rotationDelay));

    return () => {
      clearTimers();
      if (pausedRef.current && startedAtRef.current !== null) {
        elapsedMsRef.current += performance.now() - startedAtRef.current;
        startedAtRef.current = null;
      }
    };
  }, [
    currentIndex,
    fadingTo,
    getNextDecodedSlide,
    initialImageLoaded,
    intervalSeconds,
    paused,
    rotationAllowed,
    slides.length,
  ]);

  const currentSlide = slides[currentIndex];
  if (!currentSlide) return null;
  const overlayStrength = Math.max(
    overlayMinimum,
    ...slides.filter((slide) => slide.active).map((slide) => slide.overlay ?? overlayMinimum)
  );

  const finishCrossfade = () => {
    if (!fadingTo) return;
    const nextSlide = slides[fadingTo.index];
    if (!nextSlide) return;
    setCurrentIndex(fadingTo.index);
    setCurrentSource(fadingTo.src);
    setHasRotated(true);
    if (fadingTo.isFallback) setRotationAllowed(false);
    elapsedMsRef.current = 0;
    startedAtRef.current = null;
    storeLastIndex(fadingTo.index);
  };

  const handleImageFailure = async (url: string) => {
    failedUrlsRef.current.add(url);
    if (preparedRef.current && slides[preparedRef.current.index]?.url === url) preparedRef.current = null;
    reportFailedImage(url, "The active poster image failed to load");
    const next = await getNextDecodedSlide();
    if (!pausedRef.current && next) setFadingTo(next);
  };

  return (
    <div className="absolute inset-0 bg-midnight" aria-hidden="true">
      {hasRotated ? (
        <img
          src={currentSource}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          decoding="async"
          className="hero-slide-image absolute inset-0 h-full w-full object-cover"
          style={imagePosition(currentSlide)}
          onError={() => void handleImageFailure(currentSlide.url)}
        />
      ) : (
        <Image
          src={currentSlide.url}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          placeholder={currentSlide.blurDataUrl ? "blur" : "empty"}
          blurDataURL={currentSlide.blurDataUrl || undefined}
          quality={80}
          className="hero-slide-image object-cover"
          style={imagePosition(currentSlide)}
          onLoad={(event) => {
            setInitialImageLoaded(true);
            if (!hasRotated && event.currentTarget.currentSrc) setCurrentSource(event.currentTarget.currentSrc);
            if (!hasRotated) storeLastIndex(currentIndex);
          }}
          onError={() => {
            setInitialImageLoaded(true);
            void handleImageFailure(currentSlide.url);
          }}
        />
      )}

      {fadingTo && (
        <img
          key={`${fadingTo.index}-${fadingTo.src}`}
          src={fadingTo.src}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          decoding="async"
          className="hero-slide-image hero-crossfade-layer absolute inset-0 h-full w-full object-cover"
          style={{ ...imagePosition(slides[fadingTo.index]), animationPlayState: paused ? "paused" : "running" }}
          onAnimationEnd={finishCrossfade}
          onError={() => {
            const failed = slides[fadingTo.index];
            if (failed) void handleImageFailure(failed.url);
            preparedRef.current = null;
            elapsedMsRef.current = 0;
            startedAtRef.current = null;
            setFadingTo(null);
          }}
        />
      )}
      <div className="absolute inset-0 bg-midnight" style={{ opacity: overlayStrength }} />
    </div>
  );
}
/* eslint-enable @next/next/no-img-element */
