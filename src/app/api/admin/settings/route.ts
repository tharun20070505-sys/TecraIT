import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { SiteSettingsModel } from "@/models";
import { siteSettings } from "@/data/site";

export async function GET() {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const doc = await SiteSettingsModel.findOne().lean();
      if (doc) {
        return NextResponse.json({
          settings: {
            tneaCode: doc.tneaCode ?? siteSettings.tneaCode ?? "2738",
            officePhone: doc.officePhone ?? siteSettings.officePhone ?? "",
            highlightPillText: doc.highlightPillText ?? siteSettings.highlightPillText ?? "",
            brochurePdfUrl: doc.brochurePdfUrl ?? siteSettings.brochurePdfUrl ?? "",
            srietLogoSrc: doc.srietLogoSrc ?? siteSettings.srietLogoSrc ?? "/images/logos/sriet-logo.png",
            heroCampusImage: doc.heroCampusImage ?? siteSettings.heroCampusImage ?? "/images/hero/hero-background.jpg",
            heroIntervalSeconds: doc.heroIntervalSeconds ?? 10,
            heroOverlayMinimum: doc.heroOverlayMinimum ?? 0.7,
            heroTitleLineOne: doc.heroTitleLineOne ?? siteSettings.heroTitleLineOne ?? "TECRA",
            heroTitleLineTwo: doc.heroTitleLineTwo ?? siteSettings.heroTitleLineTwo ?? "Department of Information Technology",
            heroTextSeconds: doc.heroTextSeconds ?? siteSettings.heroTextSeconds ?? 3,
            navbarBadgeLogos: doc.navbarBadgeLogos ?? siteSettings.navbarBadgeLogos ?? [],
            brandReel: doc.brandReel ?? siteSettings.brandReel ?? [],
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Settings GET Error]", err);
  }

  // Fallback to static siteSettings
  return NextResponse.json({
    settings: {
      tneaCode: siteSettings.tneaCode ?? "2738",
      officePhone: siteSettings.officePhone ?? "",
      highlightPillText: siteSettings.highlightPillText ?? "",
      brochurePdfUrl: siteSettings.brochurePdfUrl ?? "",
      srietLogoSrc: siteSettings.srietLogoSrc ?? "/images/logos/sriet-logo.png",
      heroCampusImage: siteSettings.heroCampusImage ?? "/images/hero/hero-background.jpg",
      heroIntervalSeconds: 10,
      heroOverlayMinimum: 0.7,
      heroTitleLineOne: siteSettings.heroTitleLineOne ?? "TECRA",
      heroTitleLineTwo: siteSettings.heroTitleLineTwo ?? "Department of Information Technology",
      heroTextSeconds: siteSettings.heroTextSeconds ?? 3,
      navbarBadgeLogos: siteSettings.navbarBadgeLogos ?? [],
      brandReel: siteSettings.brandReel ?? [],
    },
  });
}

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      tneaCode,
      officePhone,
      highlightPillText,
      brochurePdfUrl,
      srietLogoSrc,
      navbarBadgeLogos,
      brandReel,
      heroTitleLineOne,
      heroTitleLineTwo,
      heroTextSeconds,
    } = body;

    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json(
        { error: "Settings could not be saved because the database is unavailable" },
        { status: 503 }
      );
    }

    const validatedSeconds = heroTextSeconds !== undefined
      ? Math.max(2, Math.min(6, Number(heroTextSeconds) || 3))
      : undefined;

    const updatedSettings = await SiteSettingsModel.findOneAndUpdate(
      {},
      {
        ...(tneaCode !== undefined && { tneaCode }),
        ...(officePhone !== undefined && { officePhone }),
        ...(highlightPillText !== undefined && { highlightPillText }),
        ...(brochurePdfUrl !== undefined && { brochurePdfUrl }),
        ...(srietLogoSrc !== undefined && { srietLogoSrc }),
        ...(navbarBadgeLogos !== undefined && { navbarBadgeLogos }),
        ...(brandReel !== undefined && { brandReel }),
        ...(heroTitleLineOne !== undefined && { heroTitleLineOne: String(heroTitleLineOne).trim() || "TECRA" }),
        ...(heroTitleLineTwo !== undefined && { heroTitleLineTwo: String(heroTitleLineTwo).trim() || "Department of Information Technology" }),
        ...(validatedSeconds !== undefined && { heroTextSeconds: validatedSeconds }),
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      settings: {
        tneaCode: updatedSettings?.tneaCode ?? siteSettings.tneaCode,
        officePhone: updatedSettings?.officePhone ?? siteSettings.officePhone,
        highlightPillText: updatedSettings?.highlightPillText ?? siteSettings.highlightPillText,
        brochurePdfUrl: updatedSettings?.brochurePdfUrl ?? siteSettings.brochurePdfUrl,
        srietLogoSrc: updatedSettings?.srietLogoSrc ?? siteSettings.srietLogoSrc,
        navbarBadgeLogos: updatedSettings?.navbarBadgeLogos ?? siteSettings.navbarBadgeLogos,
        brandReel: updatedSettings?.brandReel ?? siteSettings.brandReel,
        heroTitleLineOne: updatedSettings?.heroTitleLineOne ?? siteSettings.heroTitleLineOne,
        heroTitleLineTwo: updatedSettings?.heroTitleLineTwo ?? siteSettings.heroTitleLineTwo,
        heroTextSeconds: updatedSettings?.heroTextSeconds ?? siteSettings.heroTextSeconds,
      },
    });
  } catch (err) {
    console.error("[Settings POST Error]", err);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
