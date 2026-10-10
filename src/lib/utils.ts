import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Sanitizes an image URL for next/image, returning a fallback if invalid or malformed.
 * Prevents runtime errors when invalid text, error traces, or unescaped characters are pasted.
 */
export function getSafeImageUrl(
  url: string | null | undefined,
  fallback = "/images/faculty/faculty-placeholder.png"
): string {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Disallow newlines and raw whitespace (e.g. pasted error logs)
  if (trimmed.includes("\n") || trimmed.includes("\r") || trimmed.includes(" ")) {
    return fallback;
  }

  // Must begin with a recognized prefix
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return fallback;
    }
  }

  return fallback;
}
