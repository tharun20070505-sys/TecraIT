"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, ShieldAlert } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorRefId = error.digest || "ERR-TECRA-SYSTEM";

  useEffect(() => {
    console.error("TECRA System Runtime Error:", error);
    try {
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          pathname: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      }).catch(() => {});
    } catch {
      // Ignore background logging errors
    }
  }, [error]);

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center bg-burgundy-deep text-white px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
      {/* Circuit / Structural Lines in Background */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
      </div>

      <div className="relative z-10 max-w-xl w-full text-center space-y-6 bg-ink/70 p-8 sm:p-10 rounded-2xl border border-sand/20 shadow-2xl backdrop-blur-md">
        {/* Error Icon Badge */}
        <div className="w-16 h-16 mx-auto rounded-full bg-burgundy/30 border border-burgundy text-coral flex items-center justify-center shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy/40 border border-burgundy text-sand text-xs font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-coral" />
            <span>Ref: {errorRefId || "INITIALIZING"}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            System Execution Interrupted
          </h1>
          <p className="text-sm text-sand/80 leading-relaxed max-w-md mx-auto">
            An unexpected error occurred while resolving this operation. Our technical team has been notified with the trace reference above.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-royal-blue text-white text-sm font-semibold hover:bg-royal-blue/90 shadow-md transition-all focus-dark"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-midnight/90 text-sand hover:text-white border border-sand/25 text-sm font-medium transition-all focus-dark"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
