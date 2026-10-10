import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  theme?: "light" | "dark";
}

export function Breadcrumbs({ items, theme = "dark" }: BreadcrumbsProps) {
  const isDark = theme === "dark";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tecra.sriet.ac.in";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      ...items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: item.label,
        ...(item.href
          ? { item: item.href.startsWith("http") ? item.href : `${baseUrl}${item.href}` }
          : {}),
      })),
    ],
  };

  return (
    <>
      {/* Schema.org BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="inline-flex items-center text-xs">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link
              href="/"
              className={`motion-link-underline inline-flex items-center gap-1 transition-colors ${
                isDark ? "text-sand/70 hover:text-gold" : "text-text-muted hover:text-royal-blue"
              }`}
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Home</span>
            </Link>
          </li>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={idx} className="flex items-center gap-1.5">
                <ChevronRight
                  className={`w-3 h-3 ${isDark ? "text-sand/40" : "text-sand"}`}
                  aria-hidden="true"
                />
                {isLast || !item.href ? (
                  <span
                    className={`font-semibold ${
                      isDark ? "text-gold" : "text-blue-text"
                    }`}
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={`motion-link-underline transition-colors ${
                      isDark ? "text-sand/70 hover:text-gold" : "text-text-muted hover:text-royal-blue"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
