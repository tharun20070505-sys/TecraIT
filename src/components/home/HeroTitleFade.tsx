"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ENTER, EXIT } from "@/lib/motion";

export interface HeroTitleFadeProps {
  paused?: boolean;
  manualPaused?: boolean;
  lineOne?: string;
  lineTwo?: string;
  secondsPerText?: number;
}

export function HeroTitleFade({
  paused = false,
  manualPaused = false,
  lineOne = "TECRA",
  lineTwo = "Department of Information Technology",
  secondsPerText = 3,
}: HeroTitleFadeProps) {
  // Strip symbol characters to ensure purely letter/word glyph rendering
  const cleanLineOne = useMemo(
    () => lineOne.replace(/[^a-zA-Z0-9\s]/g, "").trim() || "TECRA",
    [lineOne]
  );
  const cleanLineTwo = useMemo(
    () =>
      lineTwo.replace(/[^a-zA-Z0-9\s]/g, "").trim() ||
      "Department of Information Technology",
    [lineTwo]
  );

  const lettersLineOne = useMemo(
    () => Array.from(cleanLineOne),
    [cleanLineOne]
  );
  const wordsLineTwo = useMemo(
    () => cleanLineTwo.split(/\s+/).filter(Boolean),
    [cleanLineTwo]
  );

  // Dynamic slot duration based on secondsPerText (2 to 6s, default 3s)
  const slotMs = Math.round(Math.max(2, Math.min(6, secondsPerText || 3)) * 1000);
  const enterMs = ENTER; // 900ms
  const exitMs = EXIT; // 500ms
  const holdMs = Math.max(0, slotMs - enterMs - exitMs); // Scales with secondsPerText (1600ms at 3s)

  // State: slot index (0 = line 1, 1 = line 2) and current phase
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  // Scheduling and drift correction refs
  const stepRef = useRef<number>(0);
  const cycleAnchorRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);

  const clearTimers = () => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      clearTimers();
      return;
    }

    // 1. Manual Pause: Show TECRA fully visible and sharp
    if (manualPaused) {
      clearTimers();
      pausedAtRef.current = null;
      cycleAnchorRef.current = null;
      stepRef.current = 0;
      const timer = window.setTimeout(() => {
        setActiveSlot(0);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    // 2. Auto-Pause (tab hidden or scrolled off screen): record timestamp and stop timers
    if (paused) {
      if (pausedAtRef.current === null) {
        pausedAtRef.current = performance.now();
      }
      clearTimers();
      return;
    }

    // 3. Resuming or starting the drift-corrected timeout chain
    if (cycleAnchorRef.current === null) {
      // Fresh start
      cycleAnchorRef.current = performance.now();
      stepRef.current = 0;
      pausedAtRef.current = null;
    } else if (pausedAtRef.current !== null) {
      // Resumed from auto-pause: shift anchor by exact paused duration
      const pauseDuration = performance.now() - pausedAtRef.current;
      cycleAnchorRef.current += pauseDuration;
      pausedAtRef.current = null;
    }

    const runSlot = (step: number, initialOffset: number) => {
      clearTimers();
      const slotIndex = (step % 2) as 0 | 1;
      setActiveSlot(slotIndex);

      const anchor = cycleAnchorRef.current ?? performance.now();
      const slotStartAnchor = anchor + step * slotMs;

      // Determine initial phase based on offset
      if (initialOffset < enterMs) {
        const holdTarget = slotStartAnchor + enterMs;
        const holdDelay = Math.max(0, holdTarget - performance.now());
        timeoutIdsRef.current.push(
          window.setTimeout(() => {
            // setPhase("hold");
          }, holdDelay)
        );
      } else if (initialOffset < enterMs + holdMs) {
        // setPhase("hold");
      } else {
        // setPhase("exit");
      }

      // Schedule exit phase if offset hasn't passed it
      if (initialOffset < enterMs + holdMs) {
        const exitTarget = slotStartAnchor + enterMs + holdMs;
        const exitDelay = Math.max(0, exitTarget - performance.now());
        timeoutIdsRef.current.push(
          window.setTimeout(() => {
            // setPhase("exit");
          }, exitDelay)
        );
      }

      // Schedule next slot (step + 1) at exact anchor + (step + 1) * slotMs
      const nextSlotTarget = anchor + (step + 1) * slotMs;
      const nextSlotDelay = Math.max(0, nextSlotTarget - performance.now());
      timeoutIdsRef.current.push(
        window.setTimeout(() => {
          stepRef.current = step + 1;
          runSlot(step + 1, 0);
        }, nextSlotDelay)
      );
    };

    const anchor = cycleAnchorRef.current;
    const currentStep = stepRef.current;
    const slotStartExpected = anchor + currentStep * slotMs;
    const elapsedInSlot = Math.max(0, performance.now() - slotStartExpected);

    runSlot(currentStep, elapsedInSlot);

    return () => {
      clearTimers();
    };
  }, [
    paused,
    manualPaused,
    prefersReducedMotion,
    slotMs,
    enterMs,
    holdMs,
    exitMs,
  ]);

  return (
    <div
      className="relative w-full min-h-[160px] sm:min-h-[185px] md:min-h-[220px] lg:min-h-[260px] xl:min-h-[290px] flex flex-col justify-center text-left contain-layout"
      style={{ contain: "layout" }}
    >
      {/* Visually hidden h1 for SEO and screen readers */}
      <h1 className="sr-only">{`${cleanLineOne}, ${cleanLineTwo}`}</h1>

      {/* Animated layer (aria-hidden) */}
      <div
        aria-hidden="true"
        className="relative text-left drop-shadow-[0_2px_12px_rgba(7,11,24,0.85)]"
      >
        <div className="relative block">
          {activeSlot === 0 ? (
            <div
              key={`slot-0-${cleanLineOne}`}
              className="block font-heading font-extrabold text-ivory text-left"
            >
              <span className="inline-block text-[clamp(3rem,13vw,11rem)] leading-none tracking-[-0.07em]">
                {lettersLineOne.map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    className="inline-block whitespace-pre"
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </div>
          ) : (
            <div
              key={`slot-1-${cleanLineTwo}`}
              className="block max-w-5xl font-heading font-extrabold text-ivory text-left"
            >
              <span className="block text-[clamp(1.85rem,5.7vw,5rem)] leading-[1.08] tracking-[-0.045em]">
                {wordsLineTwo.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className="mr-[0.3em] inline-block last:mr-0"
                  >
                    {word}
                  </span>
                ))}
              </span>
            </div>
          )}

          <div
            key={`bar-${activeSlot}`}
            aria-hidden="true"
            className="mt-4 sm:mt-5 h-[4px] w-28 rounded-full brand-spectrum origin-left"
          />
        </div>
      </div>
    </div>
  );
}
