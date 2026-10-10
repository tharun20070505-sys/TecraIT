"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollProgress() {
  const pathname = usePathname();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    let animationFrame = 0;
    const handleScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        const root = document.documentElement;
        const scrollableHeight = root.scrollHeight - root.clientHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progressRef.current?.style.setProperty(
          "transform",
          `scaleX(${Math.min(1, Math.max(0, progress))})`
        );
        animationFrame = 0;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div
        ref={progressRef}
        className="h-full bg-gold will-change-transform"
        style={{ width: "100%", transform: "scaleX(0)", transformOrigin: "left center" }}
      />
    </div>
  );
}
