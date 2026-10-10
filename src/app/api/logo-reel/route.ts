import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { LogoReelItem, LogoReelSettings, type ILogoReelItemDoc } from "@/models";
import { clubsData } from "@/data/clubs";

export async function GET() {
  try {
    const { isConnected } = await connectToDatabase();
    let items: ILogoReelItemDoc[] = [];
    let settingsDoc = null;

    if (isConnected) {
      [items, settingsDoc] = await Promise.all([
        LogoReelItem.find({ active: true }).sort({ order: 1 }).lean<ILogoReelItemDoc[]>(),
        LogoReelSettings.findOne().lean(),
      ]);
    }

    // Filter out items without a logo
    const validItems = items.filter(
      (item) =>
        item.logoUrl &&
        !item.logoUrl.includes("placeholder") &&
        item.logoUrl.trim() !== ""
    );

    // If DB has no items yet, fallback to active clubs with logos
    let displayItems = validItems.map((item) => ({
      id: String(item._id),
      name: item.label,
      logoUrl: item.logoUrl,
      logoDarkUrl: item.logoDarkUrl || "",
      href: item.href || "",
    }));

    if (displayItems.length === 0) {
      displayItems = clubsData.map((c) => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl,
        logoDarkUrl: "",
        href: `/clubs/${c.slug}`,
      }));
    }

    const settings = {
      speed: settingsDoc?.speed || "slow",
      height: settingsDoc?.height || 64,
      greyscale: settingsDoc?.greyscale ?? true,
      linkEnabled: settingsDoc?.linkEnabled ?? true,
    };

    return NextResponse.json({
      items: displayItems,
      settings,
    });
  } catch (err) {
    console.error("[Public Logo Reel GET Error]", err);
    return NextResponse.json({
      items: clubsData.map((c) => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl,
        logoDarkUrl: "",
        href: `/clubs/${c.slug}`,
      })),
      settings: {
        speed: "slow",
        height: 64,
        greyscale: true,
        linkEnabled: true,
      },
    });
  }
}
