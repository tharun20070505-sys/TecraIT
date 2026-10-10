import { HeroSection } from "@/components/home/HeroSection";
import { TneaCounsellingHighlight } from "@/components/home/TneaCounsellingHighlight";
import { QuickMetrics } from "@/components/home/QuickMetrics";
import { WhyITSection } from "@/components/home/WhyITSection";
import { ProgramOverviewSection } from "@/components/home/ProgramOverviewSection";
import { CareerOpportunitiesSection } from "@/components/home/CareerOpportunitiesSection";
import { ClubsHomeSection } from "@/components/home/ClubsHomeSection";
import { FacultyHomeSection } from "@/components/home/FacultyHomeSection";
import { EventsHomeSection } from "@/components/home/EventsHomeSection";
import { AssociationHomeSection } from "@/components/home/AssociationHomeSection";
import { ImageReel } from "@/components/reels/ImageReel";
import { SectionHeading } from "@/components/common/SectionHeading";

// Fallback and db data sources
import {
  quickMetrics,
  whyItCards,
  programOverview,
  careerPaths,
  homeReelImages,
} from "@/data/site";
import { associationData } from "@/data/association";
import { getFaculty, getEvents, getClubs, getLogoReelData } from "@/lib/db-data";
import { getHeroPresentation } from "@/lib/hero-data";
import { cookies } from "next/headers";

export default async function HomePage() {
  const [faculty, events, clubs, heroPresentation, reelData, cookieStore] = await Promise.all([
    getFaculty(),
    getEvents(),
    getClubs(),
    getHeroPresentation(),
    getLogoReelData(),
    cookies(),
  ]);
  const previousHeroIndex = Number(cookieStore.get("tecra-hero-last-index")?.value);
  const initialHeroIndex = Number.isInteger(previousHeroIndex) && heroPresentation.slides.length > 1
    ? (previousHeroIndex + 1) % heroPresentation.slides.length
    : 0;

  return (
    <div className="w-full bg-ivory">
      {/* 1. Hero Poster with Static Campus Background and 3D Rotating Node Network Layer */}
      <HeroSection
        slides={heroPresentation.slides}
        intervalSeconds={heroPresentation.intervalSeconds}
        overlayMinimum={heroPresentation.overlayMinimum}
        initialIndex={initialHeroIndex}
        lineOne={heroPresentation.heroTitleLineOne}
        lineTwo={heroPresentation.heroTitleLineTwo}
        secondsPerText={heroPresentation.heroTextSeconds}
      />

      {/* Prominent, centered TNEA counselling information */}
      <TneaCounsellingHighlight />

      {/* 2. Quick Metrics in Deep-Navy Band */}
      <QuickMetrics metrics={quickMetrics} />

      {/* 3. Why Information Technology (6 Cards, 3 per row on 2 rows) */}
      <WhyITSection cards={whyItCards} />

      {/* 4. Program Overview Grid */}
      <ProgramOverviewSection overview={programOverview} />

      {/* 5. Career Opportunities */}
      <CareerOpportunitiesSection careers={careerPaths} />

      {/* 6. Clubs Information and LogoReel */}
      <ClubsHomeSection
        clubs={clubs}
        reelLogos={reelData.items}
        reelSettings={reelData.settings}
      />

      {/* 7. Faculty Intro and 4 Featured Faculty Cards */}
      <FacultyHomeSection faculty={faculty} />

      {/* 8. Events (Department and College Scope) */}
      <EventsHomeSection events={events} />

      {/* 9. IT Association Intro */}
      <AssociationHomeSection association={associationData} />

      {/* 10. Home Image Reel Section */}
      <section className="py-20 lg:py-24 bg-mist border-t border-sand text-text" aria-label="Campus Life Reel">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-8">
          <SectionHeading
            eyebrow="Campus Life in Motion"
            eyebrowColor="teal"
            title="Life and Learning at SRIET"
            description="Explore our laboratories, technical symposiums, research studios, and student community spaces."
          />

          <ImageReel images={homeReelImages} aspectRatio="video" />
        </div>
      </section>
    </div>
  );
}
