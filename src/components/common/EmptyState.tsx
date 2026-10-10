import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  theme?: "light" | "dark";
}

export function EmptyState({
  title = "No Data Available Yet",
  message = "This section is actively being populated by the department administration. Please check back shortly.",
  icon,
  actionText,
  onAction,
  actionHref,
  className,
  theme = "light",
}: EmptyStateProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "w-full text-center py-12 px-6 rounded-xl border border-dashed flex flex-col items-center justify-center max-w-lg mx-auto",
        isDark
          ? "bg-midnight/60 border-sand/20 text-sand"
          : "bg-white/70 border-sand text-text",
        className
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-4 border",
          isDark
            ? "bg-ink border-sand/20 text-gold"
            : "bg-mist border-sand text-royal-blue"
        )}
      >
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>

      <h3
        className={cn(
          "font-heading font-bold text-base sm:text-lg mb-1.5",
          isDark ? "text-white" : "text-text"
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          "text-xs sm:text-sm max-w-md leading-relaxed",
          isDark ? "text-sand/70" : "text-text-muted"
        )}
      >
        {message}
      </p>

      {actionText && (
        <div className="mt-5">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-royal-blue text-white text-xs font-semibold hover:bg-royal-blue/90 transition-colors shadow-sm focus-visible:outline-2"
            >
              {actionText}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-royal-blue text-white text-xs font-semibold hover:bg-royal-blue/90 transition-colors shadow-sm focus-visible:outline-2"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
