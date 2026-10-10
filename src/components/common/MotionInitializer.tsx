"use client";

import { useEffect } from "react";
import { motionTokens } from "@/lib/motion";

export function MotionInitializer() {
  useEffect(() => {
    const root = document.documentElement;
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean };
    }).connection;
    const motionReduced =
      window.matchMedia(motionTokens.reducedMotionQuery).matches ||
      connection?.saveData === true;

    if (!motionReduced) {
      root.classList.add("motion-js");
    }
  }, []);

  return null;
}
