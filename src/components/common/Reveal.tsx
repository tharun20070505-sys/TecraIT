"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  animateMotion,
  motionTokens,
  observeMotion,
  type MotionEffect,
} from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  effect?: MotionEffect;
  delay?: number;
  duration?: number;
  animateOnMount?: boolean;
  observe?: boolean;
}

export function Reveal({
  children,
  className,
  effect = "block",
  delay = 0,
  duration = effect === "fade" ? motionTokens.durationFilter : motionTokens.durationBase,
  animateOnMount = true,
  observe = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!observe) {
      element.dataset.motionState = "animating";
      const animation = animateMotion(element, { effect, delay, duration });
      animation?.finished
        .catch(() => undefined)
        .then(() => {
          element.dataset.motionState = "visible";
        });
      if (!animation) element.dataset.motionState = "visible";
      return () => animation?.cancel();
    }

    return observeMotion(
      element,
      (target) => {
        target.dataset.motionState = "animating";
        const animation = animateMotion(target, { effect, delay, duration });
        if (animation) {
          animation.finished
            .catch(() => undefined)
            .then(() => {
              target.dataset.motionState = "visible";
            });
        } else {
          target.dataset.motionState = "visible";
        }
      },
      { animateOnMount }
    );
  }, [animateOnMount, delay, duration, effect, observe]);

  return (
    <div
      ref={ref}
      className={className}
      data-motion-kind={effect === "fade" ? "fade" : effect === "row" ? "row" : "block"}
      data-motion-effect={effect}
      data-motion-state="pending"
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}