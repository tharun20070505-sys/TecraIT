"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const toggleVisibility = () => {
      if (animationFrameRef.current !== null) return;
      animationFrameRef.current = window.requestAnimationFrame(() => {
        const nextVisible = window.scrollY > 350;
        if (nextVisible !== visibleRef.current) {
          visibleRef.current = nextVisible;
          setVisible(nextVisible);
        }
        animationFrameRef.current = null;
      });
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-deep-navy text-gold border border-gold/40 shadow-xl hover:bg-royal-blue hover:text-white transition-colors duration-200 focus-dark"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
