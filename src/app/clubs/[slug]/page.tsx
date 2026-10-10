import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/common/PageBanner";
import { TechnicalClubView } from "@/components/clubs/TechnicalClubView";
import { NonTechnicalClubView } from "@/components/clubs/NonTechnicalClubView";
import { MediaClubView } from "@/components/clubs/MediaClubView";
import { clubsData } from "@/data/clubs";

interface ClubPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return clubsData.map((c) => ({
    slug: c.slug,
  }));
}

import { getClubBySlug } from "@/lib/db-data";

export async function generateMetadata({ params }: ClubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClubBySlug(slug);

  if (!club) {
    return {
      title: "Club Not Found",
    };
  }

  return {
    title: `${club.name} - Department of Information Technology`,
    description: club.shortDescription,
    openGraph: {
      title: `${club.name} - TECRA IT SRIET`,
      description: club.shortDescription,
      images: [club.logoUrl],
    },
  };
}

export default async function ClubDetailPage({ params }: ClubPageProps) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);

  if (!club) {
    notFound();
  }

  return (
    <div className="w-full bg-ivory text-text">
      {/* Page Banner */}
      <PageBanner
        title={club.name}
        eyebrow={`TECRA ${club.type === "technical" ? "TECHNICAL SOCIETY" : "CREATIVE GUILD"}`}
        breadcrumbs={[
          { label: "Clubs", href: "/clubs" },
          { label: club.name },
        ]}
        description={club.shortDescription}
      />

      {/* Render Appropriate View Template */}
      <div className="py-20">
        {club.type === "technical" ? (
          <TechnicalClubView club={club} />
        ) : club.slug === "media-club" ? (
          <MediaClubView club={club} />
        ) : (
          <NonTechnicalClubView club={club} />
        )}
      </div>
    </div>
  );
}
