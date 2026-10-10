"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Global Runtime Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#3E0F25] text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#070B18] p-8 rounded-2xl border border-[#E3DED2]/20 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#8C1F46]/30 border border-[#8C1F46] text-[#E4572E] flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Application Encountered a Critical Error
            </h1>
            <p className="text-xs text-[#E3DED2]/80 leading-relaxed">
              A foundational execution fault occurred. Please reload the application or return to safety.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2447C0] text-white text-xs font-semibold hover:opacity-90"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0C1535] text-[#E3DED2] text-xs font-medium border border-[#E3DED2]/20 hover:text-white"
            >
              <Home className="w-4 h-4" /> Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
