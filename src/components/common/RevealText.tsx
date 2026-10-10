"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  animateMotion,
  animateMotionGroup,
  animateMotionLines,
  motionTokens,
  observeMotion,
  type MotionEffect,
} from "@/lib/motion";

type RevealTextMode = "words" | "lines" | "block";

interface RevealTextProps {
  children: string | ReactNode;
  mode: RevealTextMode;
  className?: string;
  delay?: number;
  animateOnMount?: boolean;
}

function getTextNodes(text: string, mode: "words" | "lines") {
  if (mode === "lines") {
    return text.split(/(\s+)/).map((part, index) =>
      /^\s+$/.test(part) ? part : (
        <span key={`line-word-${index}`} className="motion-line-word" data-motion-piece="true" aria-hidden="true">
          {part}
        </span>
      )
    );
  }

  return text.split(/(\s+)/).map((part, index) =>
    /^\s+$/.test(part) ? (
      part
    ) : (
      <span key={`word-${index}`} className="motion-word" data-motion-piece="true" aria-hidden="true">
        {part}
      </span>
    )
  );
}

export function RevealText({
  children,
  mode,
  className,
  delay = 0,
  animateOnMount = true,
}: RevealTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const plainText = typeof children === "string" ? children : null;
  const effect: MotionEffect = mode === "words" ? "heading" : "line";

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return observeMotion(
      element,
      (target) => {
        const container = target as HTMLElement;
        const pieces = Array.from(container.querySelectorAll<HTMLElement>("[data-motion-piece='true']"));
        if (mode === "block" || pieces.length === 0) {
          container.dataset.motionState = "animating";
          const animation = animateMotion(container, { effect: "block", delay });
          animation?.finished
            .catch(() => undefined)
            .then(() => {
              container.dataset.motionState = "visible";
            });
          if (!animation) container.dataset.motionState = "visible";
          return;
        }

        if (mode === "lines") {
          animateMotionLines(container, pieces, delay);
        } else {
          animateMotionGroup(container, pieces, effect, motionTokens.wordStagger, delay);
        }
      },
      { animateOnMount }
    );
  }, [animateOnMount, delay, effect, mode]);

  if (mode === "block") {
    return (
      <span
        ref={ref}
        className={`motion-text-block ${className ?? ""}`}
        data-motion-kind="block"
        data-motion-state="pending"
        suppressHydrationWarning
      >
        {children}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={className}
      data-motion-kind={mode}
      data-motion-state="pending"
      role="text"
      aria-label={plainText ?? undefined}
      suppressHydrationWarning
    >
      {plainText === null ? (
        children
      ) : (
        <span aria-hidden="true">{getTextNodes(plainText, mode)}</span>
      )}
    </span>
  );
}