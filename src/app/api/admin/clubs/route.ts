import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Club, ClubImage, ClubMember, type IClub } from "@/models";
import { clubsData } from "@/data/clubs";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { isConnected } = await connectToDatabase();
    let dbClubs: IClub[] = [];

    if (isConnected) {
      dbClubs = await Club.find().sort({ createdAt: 1 }).lean<IClub[]>();
    }

    // Merge with static data if DB is empty or missing clubs
    const allClubs = clubsData.map((staticClub) => {
      const match = dbClubs.find((c) => c.slug === staticClub.slug);
      return {
        id: match ? String(match._id) : staticClub.id,
        slug: staticClub.slug,
        name: match?.name || staticClub.name,
        type: match?.type || staticClub.type,
        logoUrl: match?.logoUrl || staticClub.logoUrl,
        shortDescription: match?.shortDescription || staticClub.shortDescription,
        about: match?.about || staticClub.about,
      };
    });

    // Get live image and member counts for each club
    const enrichedClubs = await Promise.all(
      allClubs.map(async (c) => {
        let imageCount = 0;
        let memberCount = 0;
        if (isConnected) {
          [imageCount, memberCount] = await Promise.all([
            ClubImage.countDocuments({ clubId: c.slug, active: true }),
            ClubMember.countDocuments({ clubId: c.slug, active: true }),
          ]);
        }
        return {
          ...c,
          imageCount,
          memberCount,
        };
      })
    );

    return NextResponse.json({ clubs: enrichedClubs });
  } catch (err) {
    console.error("[Admin Clubs GET Error]", err);
    return NextResponse.json({ error: "Failed to load clubs" }, { status: 500 });
  }
}
