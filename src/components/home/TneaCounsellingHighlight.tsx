"use client";

import { useEffect, useState } from "react";
import { siteSettings } from "@/data/site";
import { Reveal } from "@/components/common/Reveal";
import { RevealText } from "@/components/common/RevealText";

export function TneaCounsellingHighlight() {
  const [tneaCode, setTneaCode] = useState(siteSettings.tneaCode || "2738");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/settings", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.settings?.tneaCode) {
          setTneaCode(data.settings.tneaCode);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="bg-ivory px-5 py-8 sm:py-10"
      aria-labelledby="tnea-highlight-title"
    >
      <Reveal className="mx-auto w-full max-w-5xl" animateOnMount>
      <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-midnight via-[#142451] to-midnight px-6 py-7 text-center text-white shadow-[0_18px_55px_rgba(12,21,53,0.18)] sm:px-10 sm:py-9">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-gold sm:text-sm">
          Important Admission Information
        </p>
        <h2
          id="tnea-highlight-title"
          className="text-xl font-bold sm:text-2xl"
        >
          <RevealText mode="words">TNEA Counselling Code</RevealText>
        </h2>
        <p
          className="mt-3 text-4xl font-black leading-none tracking-[0.12em] text-[#F1C40F] sm:text-5xl"
          aria-label={`TNEA counselling code ${tneaCode}`}
        >
          {tneaCode}
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
          Keep this code handy when choosing Sri Ranganathar Institute of
          Engineering and Technology during TNEA counselling.
        </p>
      </div>
      </Reveal>
    </section>
  );
}