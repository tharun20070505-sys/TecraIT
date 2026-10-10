"use client";

import { useEffect, useRef } from "react";
import { motionTokens, observeMotion, prefersReducedMotion } from "@/lib/motion";

interface CountUpNumberProps {
  value: string;
  className?: string;
}

export function CountUpNumber({ value, className }: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const finalValue = Number(value.replaceAll(",", ""));
    if (!Number.isFinite(finalValue) || prefersReducedMotion()) return;
    let frame = 0;

    const stopObserving = observeMotion(element, () => {
      const startedAt = performance.now();
      const decimalPlaces = value.includes(".") ? value.split(".")[1]?.length ?? 0 : 0;

      const update = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / motionTokens.durationBase);
        const currentValue = finalValue * progress;
        element.textContent = progress === 1
          ? value
          : new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimalPlaces }).format(
              Number(currentValue.toFixed(decimalPlaces))
            );
        if (progress < 1) frame = window.requestAnimationFrame(update);
      };

      frame = window.requestAnimationFrame(update);
      element.dataset.motionState = "visible";
    }, { animateOnMount: true });

    return () => {
      stopObserving();
      window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={className} aria-label={value}>
      {value}
    </span>
  );
}
