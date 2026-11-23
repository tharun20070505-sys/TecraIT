import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ProfessionalNavbar } from "@/components/navbar/ProfessionalNavbar";
import { Footer } from "@/components/footer/Footer";
import { ScrollProgress } from "@/components/common/ScrollProgress";
import { MotionInitializer } from "@/components/common/MotionInitializer";
import { DepartmentJsonLd } from "@/components/seo/DepartmentJsonLd";
import { getClubs } from "@/lib/db-data";
import { getHeroPresentation } from "@/lib/hero-data";

const manrope = localFont({
  src: "./fonts/manrope-latin.woff2",
  variable: "--type-display",
  weight: "400 800",
  display: "swap",
});

const dmSans = localFont({
  src: "./fonts/dm-sans-latin.woff2",
  variable: "--type-body",
  weight: "400 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TECRA - Department of Information Technology - Rathinam Institute of Technology",
    template: "%s - TECRA IT Rathinam Institute of Technology",
  },
  description:
    "Official portal for the Department of Information Technology (TECRA), Rathinam Institute of Technology. Advancing technical education, student innovation, and engineering leadership.",
  keywords: [
    "TECRA",
    "Information Technology",
    "Rathinam Institute of Technology",
    "Engineering College Coimbatore",
    "B.Tech IT",
    "Autonomous College",
    "Anna University Affiliated",
  ],
  authors: [{ name: "Department of Information Technology, Rathinam Institute of Technology" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://tecra.sriet.ac.in"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TECRA - Department of Information Technology - Rathinam Institute of Technology",
    description:
      "Department of Information Technology, Rathinam Institute of Technology. Advancing computing education and student innovation.",
    url: "https://tecra.sriet.ac.in",
    siteName: "TECRA IT | Rathinam Institute of Technology",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/hero/sriet-campus.png",
        width: 1200,
        height: 630,
        alt: "Campus illustration for the TECRA website",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TECRA - Department of Information Technology - Rathinam Institute of Technology",
    description:
      "Official portal for Department of Information Technology, Rathinam Institute of Technology.",
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
      className={`scroll-smooth ${manrope.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col text-text font-body antialiased selection:bg-gold/30 selection:text-ink">
        <MotionInitializer />
        <noscript>
          <style>{`.motion-pending,[data-motion-state="pending"],[data-motion-state="animating"]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        {/* Schema.org EducationalOrganization structured data */}
        <DepartmentJsonLd />

        <ScrollProgress />
        <ProfessionalNavbar clubs={clubs} />
        <main id="main-content" className="site-content flex-1 w-full focus:outline-hidden">
          {children}
        </main>
        <Footer heroImageSrc={heroPresentation.slides[0]?.url ?? null} />
      </body>
    </html>
  );
}
