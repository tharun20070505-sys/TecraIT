"use client";

import { Children, cloneElement, isValidElement, useEffect, useRef, type ReactElement, type ReactNode, type Ref } from "react";
import {
  animateMotion,
  animateMotionGroup,
  motionTokens,
  observeMotion,
  type MotionEffect,
} from "@/lib/motion";

type StaggerKind = "cards" | "rows" | "footer";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  kind?: StaggerKind;
  itemClassNames?: string[];
  as?: "div" | "tbody";
  directItems?: boolean;
  animateOnMount?: boolean;
}

const STAGGER_CONFIG: Record<StaggerKind, { effect: MotionEffect; delay: number }> = {
  cards: { effect: "block", delay: motionTokens.cardStagger },
  rows: { effect: "row", delay: motionTokens.rowStagger },
  footer: { effect: "block", delay: motionTokens.footerStagger },
};

export function Stagger({
  children,
  className,
  kind = "cards",
  itemClassNames = [],
  as = "div",
  directItems = false,
  animateOnMount = true,
}: StaggerProps) {
  const ref = useRef<HTMLElement>(null);
  const config = STAGGER_CONFIG[kind];

  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    return observeMotion(group, (target) => {
      const container = target as HTMLElement;
      const items = Array.from(container.querySelectorAll<HTMLElement>(":scope > [data-motion-item='true']"));
      if (!items.length) {
        container.dataset.motionState = "visible";
        return;
      }
      container.dataset.motionState = "animating";
      const groupAnimation = kind === "rows"
        ? null
        : animateMotion(container, { effect: "fade", duration: motionTokens.durationFast });
      animateMotionGroup(
        container,
        items,
        config.effect,
        config.delay,
        0,
        kind === "rows" ? motionTokens.maxTableRows : motionTokens.maxStaggeredItems
      );
      groupAnimation?.finished
        .catch(() => undefined)
        .then(() => {
          if (container.dataset.motionState !== "visible") container.dataset.motionState = "visible";
        });
    }, {
      animateOnMount,
      onSkip: (target) => {
        target.querySelectorAll<HTMLElement>(":scope > [data-motion-item='true']").forEach((item) => {
          item.dataset.motionState = "visible";
        });
      },
    });
  }, [animateOnMount, config, kind]);

  const motionItems = Children.toArray(children).map((child, index) => {
    if (directItems && isValidElement(child)) {
      return cloneElement(child as ReactElement<Record<string, unknown>>, {
        "data-motion-item": "true",
        "data-motion-kind": "item",
        "data-motion-effect": config.effect,
        "data-motion-state": "pending",
        suppressHydrationWarning: true,
      });
    }

    return (
      <div
        key={index}
        className={`${itemClassNames[index] ?? ""} ${kind === "footer" ? "motion-footer-column" : ""}`}
        data-motion-item="true"
        data-motion-kind={kind === "rows" ? "row" : "item"}
        data-motion-effect={config.effect}
        data-motion-state="pending"
        suppressHydrationWarning
      >
        {child}
      </div>
    );
  });
  const props = {
    className,
    "data-motion-kind": "group",
    "data-motion-effect": config.effect,
    "data-motion-state": "pending",
    suppressHydrationWarning: true,
  } as const;

  if (as === "tbody") {
    return <tbody ref={ref as unknown as Ref<HTMLTableSectionElement>} {...props}>{motionItems}</tbody>;
  }
  return <div ref={ref as unknown as Ref<HTMLDivElement>} {...props}>{motionItems}</div>;
}