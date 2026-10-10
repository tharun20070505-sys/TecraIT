import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { ScrollProgress } from "@/components/common/ScrollProgress";
import { RouteContentFade } from "@/components/common/RouteContentFade";
import { MotionInitializer } from "@/components/common/MotionInitializer";
import { DepartmentJsonLd } from "@/components/seo/DepartmentJsonLd";
import { getClubs } from "@/lib/db-data";
import { getHeroPresentation } from "@/lib/hero-data";

export const metadata: Metadata = {
  title: {
    default: "TECRA - Department of Information Technology - SRIET",
    template: "%s - TECRA IT SRIET",
  },
  description:
    "Official portal for the Department of Information Technology (TECRA), Sri Ranganathar Institute of Engineering and Technology (SRIET). Advancing technical education, student innovation, and engineering leadership.",
  keywords: [
    "TECRA",
    "Information Technology",
    "SRIET",
    "Sri Ranganathar Institute of Engineering and Technology",
    "Engineering College Coimbatore",
    "B.Tech IT",
    "Autonomous College",
    "Anna University Affiliated",
  ],
  authors: [{ name: "Department of Information Technology, SRIET" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://tecra.sriet.ac.in"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TECRA - Department of Information Technology - SRIET",
    description:
      "Department of Information Technology, Sri Ranganathar Institute of Engineering and Technology. Advancing computing education and student innovation.",
    url: "https://tecra.sriet.ac.in",
    siteName: "TECRA SRIET IT",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/hero/sriet-campus.png",
        width: 1200,
        height: 630,
        alt: "SRIET Campus - Department of Information Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TECRA - Department of Information Technology - SRIET",
    description:
      "Official portal for Department of Information Technology, Sri Ranganathar Institute of Engineering and Technology.",
    images: ["/images/hero/sriet-campus.png"],
    creator: "@srietofficial",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#070B18",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [clubs, heroPresentation] = await Promise.all([
    getClubs(),
    getHeroPresentation(),
  ]);

  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-ivory text-text font-body antialiased selection:bg-gold/30 selection:text-ink">
        <MotionInitializer />
        <noscript>
          <style>{`.motion-pending,[data-motion-state="pending"],[data-motion-state="animating"]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        {/* Schema.org EducationalOrganization structured data */}
        <DepartmentJsonLd />

        {/* Accessible Skip to Main Content (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-gold focus:text-midnight focus:font-bold focus:rounded-[3px] focus:shadow-md focus:ring-2 focus:ring-royal-blue focus:outline-hidden transition-all"
        >
          Skip to main content
        </a>

        <ScrollProgress />
        <Navbar clubs={clubs} />
        <main id="main-content" className="flex-1 w-full focus:outline-hidden">
          <RouteContentFade>{children}</RouteContentFade>
        </main>
        <Footer heroImageSrc={heroPresentation.slides[0]?.url ?? null} />
      </body>
    </html>
  );
}
