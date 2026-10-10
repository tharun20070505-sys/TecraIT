"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motionTokens, prefersReducedMotion } from "@/lib/motion";

export function RouteContentFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (
      !content ||
      pathname?.startsWith("/admin") ||
      window.scrollY > 0 ||
      window.location.hash.length > 0 ||
      navigation?.type === "back_forward" ||
      prefersReducedMotion()
    ) return;

    content.style.willChange = "opacity";
    const animation = content.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: motionTokens.durationFilter, easing: motionTokens.ease }
    );
    animation.finished
      .catch(() => undefined)
      .then(() => {
        content.style.willChange = "";
        animation.cancel();
      });
    return () => animation.cancel();
  }, [pathname]);

  return <div ref={contentRef}>{children}</div>;
}
