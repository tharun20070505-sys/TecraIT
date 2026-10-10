import { connectToDatabase } from "@/lib/mongodb";
import {
  Faculty,
  Event,
  GalleryImage,
  Club,
  ClubImage,
  ClubMember,
  Association,
  AssociationLogo,
  LogoReelItem,
  LogoReelSettings,
  Placement,
  Notice,
  NavItemModel,
  type IFaculty,
  type IEvent,
  type IGalleryImage,
  type IClub,
  type IAssociation,
  type IPlacement,
  type INotice,
  type INavItem,
} from "@/models";
import { facultyData } from "@/data/faculty";
import { eventsData } from "@/data/events";
import { galleryItems } from "@/data/gallery";
import { clubsData } from "@/data/clubs";
import { associationData } from "@/data/association";
import { alumniData } from "@/data/alumni";
import { placementData } from "@/data/placements";
import { noticesData } from "@/data/notices";
import {
  FacultyMember,
  EventItem,
  GalleryItem,
  Club as ClubType,
  ITAssociationMember,
  AlumniBatchPdf,
  PlacementBatchSummary,
  NoticeItem,
  DbNavItem,
} from "@/types";

/**
 * Fetch Faculty Members from MongoDB with resilient fallback.
 */
export async function getFaculty(): Promise<FacultyMember[]> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const docs = await Faculty.find().sort({ isHod: -1, order: 1 }).lean<IFaculty[]>();
      if (docs && docs.length > 0) {
        return docs.map((doc) => ({
          id: String(doc._id),
          name: doc.name,
          position: doc.position,
          qualification: doc.qualification,
          specialisation: doc.specialisation,
          email: doc.email || "",
          contactNumber: doc.contactNumber || "",
          showEmail: doc.showEmail ?? true,
          showContactNumber: doc.showContactNumber ?? false,
          photoUrl: doc.photoUrl,
          isHod: doc.isHod ?? false,
          order: doc.order ?? 0,
          active: true,
          bio: doc.bio || "",
          quota: doc.quota,
          quotaLabel: doc.quotaLabel,
        }));
      }
    }
  } catch (err) {
    console.warn("[Data Access] Faculty DB query error, using static fallback:", err);
  }
  return facultyData;
}

/**
 * Fetch Events from MongoDB with resilient fallback.
 */
export async function getEvents(): Promise<EventItem[]> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const docs = await Event.find().sort({ date: -1 }).lean<IEvent[]>();
      if (docs && docs.length > 0) {
        return docs.map((doc) => ({
          id: String(doc._id),
          title: doc.title,
          slug: doc.slug,
          date: doc.date,
          time: doc.time,
          venue: doc.venue,
          description: doc.description,
          fullContent: doc.fullContent,
          posterUrl: doc.posterUrl,
          isUpcoming: doc.isUpcoming,
          scope: doc.scope,
          category: doc.category,
          registrationUrl: doc.registerUrl,
        }));
      }
    }
  } catch (err) {
    console.warn("[Data Access] Events DB query error, using static fallback:", err);
  }
  return eventsData;
}

/**
 * Fetch a single event by its slug.
 */
export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const doc = await Event.findOne({ slug }).lean<IEvent | null>();
      if (doc) {
        return {
          id: String(doc._id),
          title: doc.title,
          slug: doc.slug,
          date: doc.date,
          time: doc.time,
          venue: doc.venue,
          description: doc.description,
          fullContent: doc.fullContent,
          posterUrl: doc.posterUrl,
          isUpcoming: doc.isUpcoming,
          scope: doc.scope,
          category: doc.category,
          registrationUrl: doc.registerUrl,
        };
      }
    }
  } catch (err) {
    console.warn(`[Data Access] Event (${slug}) DB query error, using static fallback:`, err);
  }
  return eventsData.find((e) => e.slug === slug) || null;
}

/**
 * Fetch Gallery Items from MongoDB with resilient fallback.
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const docs = await GalleryImage.find().sort({ order: 1, date: -1 }).lean<IGalleryImage[]>();
      if (docs && docs.length > 0) {
        return docs.map((doc) => ({
          id: String(doc._id),
          title: doc.title,
          imageUrl: doc.imageUrl,
          category: doc.category as GalleryItem["category"],
          caption: doc.caption || "",
          date: doc.date,
        }));
      }
    }
  } catch (err) {
    console.warn("[Data Access] Gallery DB query error, using static fallback:", err);
  }
  return galleryItems;
}

/**
 * Fetch Clubs from MongoDB with resilient fallback.
 */
export async function getClubs(): Promise<ClubType[]> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const docs = await Club.find().lean<IClub[]>();
      if (docs && docs.length > 0) {
        return docs.map((doc) => ({
          id: String(doc._id),
          slug: doc.slug,
          name: doc.name,
          type: doc.type,
          logoUrl: doc.logoUrl,
          shortDescription: doc.shortDescription,
          about: doc.about,
          vision: doc.vision,
          mission: doc.mission,
          whatWeDo: doc.whatWeDo || [],
          members: doc.members || [],
          weeklyReports: doc.weeklyReports,
          videoUrl: doc.videoUrl,
          videoPoster: doc.videoPoster,
          images: doc.images || [],
        }));
      }
    }
  } catch (err) {
    console.warn("[Data Access] Clubs DB query error, using static fallback:", err);
  }
  return clubsData;
}

/**
 * Fetch a single club by slug.
 */
export async function getClubBySlug(slug: string): Promise<ClubType | null> {
  const staticClub = clubsData.find((c) => c.slug === slug) || null;
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const [doc, dbImages, dbMembers] = await Promise.all([
        Club.findOne({ slug }).lean<IClub | null>(),
        ClubImage.find({ clubId: slug, active: true }).sort({ order: 1, createdAt: 1 }).lean(),
        ClubMember.find({ clubId: slug, active: true }).sort({ order: 1, createdAt: 1 }).lean(),
      ]);

      const base = doc || staticClub;
      if (base) {
        // If DB has dedicated ClubImage records for this club, use them!
        const images =
          dbImages.length > 0
            ? dbImages.map((img) => ({
                id: String(img._id),
                url: img.url,
                caption: img.caption || "",
                altText: img.alt || "",
                order: img.order,
              }))
            : doc?.images && doc.images.length > 0
            ? doc.images
            : staticClub?.images || [];

        // If DB has dedicated ClubMember records for this club, use them!
        const members =
          dbMembers.length > 0
            ? dbMembers.map((m) => ({
                id: String(m._id),
                name: m.name,
                role: m.role,
                batch: m.batch || "",
                photoUrl: m.photo || "",
              }))
            : doc?.members && doc.members.length > 0
            ? doc.members
            : staticClub?.members || [];

        return {
          id: doc ? String(doc._id) : staticClub?.id || slug,
          slug: base.slug,
          name: base.name,
          type: base.type,
          logoUrl: base.logoUrl,
          shortDescription: base.shortDescription,
          about: base.about,
          vision: base.vision,
          mission: base.mission,
          whatWeDo: base.whatWeDo || [],
          members,
          weeklyReports: doc?.weeklyReports || staticClub?.weeklyReports,
          videoUrl: doc?.videoUrl || staticClub?.videoUrl,
          videoPoster: doc?.videoPoster || staticClub?.videoPoster,
          images,
        };
      }
    }
  } catch (err) {
    console.warn(`[Data Access] Club (${slug}) DB query error, using static fallback:`, err);
  }
  return staticClub;
}

/**
 * Fetch Association data with resilient fallback.
 */
export async function getAssociationData(): Promise<{
  membersByBatch: {
    batch: string;
    members: ITAssociationMember[];
  }[];
}> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const docs = await Association.find().sort({ order: 1 }).lean<IAssociation[]>();
      if (docs && docs.length > 0) {
        const batchMap = new Map<string, ITAssociationMember[]>();
        docs.forEach((doc) => {
          const b = doc.batch || "Current Batch";
          if (!batchMap.has(b)) batchMap.set(b, []);
          batchMap.get(b)!.push({
            id: String(doc._id),
            name: doc.name,
            role: doc.role,
            batch: b,
            photoUrl: doc.photoUrl,
          });
        });

        const membersByBatch = Array.from(batchMap.entries()).map(
          ([batch, members]) => ({
            batch,
            members,
          })
        );

        return { membersByBatch };
      }
    }
  } catch (err) {
    console.warn("[Data Access] Association DB query error, using static fallback:", err);
  }
  return { membersByBatch: associationData.membersByBatch };
}

/**
 * Fetch Association Logo configuration with fallback.
 */
export async function getAssociationLogoConfig(): Promise<{
  logoLight: string;
  logoDark?: string;
  alt: string;
  showInFooter: boolean;
  showInReel: boolean;
}> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const doc = await AssociationLogo.findOne().lean();
      if (doc) {
        return {
          logoLight: doc.logoLight || associationData.logoUrl,
          logoDark: doc.logoDark || "",
          alt: doc.alt || "TECRA IT Association Logo",
          showInFooter: Boolean(doc.showInFooter),
          showInReel: Boolean(doc.showInReel),
        };
      }
    }
  } catch (err) {
    console.warn("[Data Access] Association Logo DB query error:", err);
  }
  return {
    logoLight: associationData.logoUrl,
    logoDark: "",
    alt: "TECRA IT Association Logo",
    showInFooter: false,
    showInReel: false,
  };
}

/**
 * Fetch Alumni directory batch records with resilient fallback.
 */
export async function getAlumniBatchPdfs(): Promise<AlumniBatchPdf[]> {
  return alumniData.batchPdfs;
}

/**
 * Fetch Placement records with resilient fallback.
 */
export async function getPlacementBatches(): Promise<PlacementBatchSummary[]> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const docs = await Placement.find().sort({ batch: -1 }).lean<IPlacement[]>();
      if (docs && docs.length > 0) {
        return docs.map((doc) => ({
          batch: doc.batch,
          summaryText: `${doc.totalOffers} Total Offers, Highest: ${doc.highestPackage}, Average: ${doc.averagePackage}`,
        }));
      }
    }
  } catch (err) {
    console.warn("[Data Access] Placement DB query error, using static fallback:", err);
  }
  return placementData.batches;
}

/**
 * Fetch Notices with active status and date checking.
 */
export async function getNotices(): Promise<NoticeItem[]> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const today = new Date().toISOString().split("T")[0];
      const docs = await Notice.find({ active: true }).sort({ order: 1, createdAt: -1 }).lean<INotice[]>();
      if (docs && docs.length > 0) {
        // Filter out expired notices if endDate is provided
        return docs
          .filter((doc) => !doc.endDate || doc.endDate >= today)
          .map((doc) => ({
            id: String(doc._id),
            title: doc.title,
            link: doc.link,
            startDate: doc.startDate,
            endDate: doc.endDate,
            active: doc.active,
            order: doc.order,
          }));
      }
    }
  } catch (err) {
    console.warn("[Data Access] Notices DB query error, using static fallback:", err);
  }
  return noticesData;
}


/** Default nav items used when MongoDB is unavailable */
export { defaultNavItems } from "@/data/navItems";
// Re-import locally for use in getNavItems()
import { defaultNavItems as _defaultNavItems } from "@/data/navItems";

/**
 * Fetch nav items from MongoDB with static fallback.
 */
export async function getNavItems(): Promise<DbNavItem[]> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const docs = await NavItemModel.find().sort({ order: 1 }).lean<INavItem[]>();
      if (docs && docs.length > 0) {
        return docs.map((doc) => ({
          id: String(doc._id),
          label: doc.label,
          href: doc.href,
          type: doc.type,
          autoSource: doc.autoSource ?? undefined,
          children: (doc.children || []).map((c) => ({
            label: c.label,
            href: c.href,
            order: c.order,
            visible: c.visible,
          })),
          order: doc.order,
          visible: doc.visible,
          isSystem: doc.isSystem,
        }));
      }
    }
  } catch (err) {
    console.warn("[Data Access] NavItems DB query error, using static fallback:", err);
  }
  return _defaultNavItems;
}

/**
 * Fetch Logo Reel items and configuration with resilient fallback.
 */
export async function getLogoReelData(): Promise<{
  items: Array<{
    id: string;
    name: string;
    logoUrl: string;
    logoDarkUrl?: string;
    href?: string;
  }>;
  settings: {
    speed: "slow" | "medium" | "fast";
    height: number;
    greyscale: boolean;
    linkEnabled: boolean;
  };
}> {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const [dbItems, settingsDoc] = await Promise.all([
        LogoReelItem.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean(),
        LogoReelSettings.findOne().lean(),
      ]);

      const validItems = (dbItems || []).filter(
        (i) => i.logoUrl && !i.logoUrl.includes("placeholder") && i.logoUrl.trim() !== ""
      );

      if (validItems.length > 0) {
        return {
          items: validItems.map((i) => ({
            id: String(i._id),
            name: i.label,
            logoUrl: i.logoUrl,
            logoDarkUrl: i.logoDarkUrl || "",
            href: i.href || "",
          })),
          settings: {
            speed: (settingsDoc?.speed as "slow" | "medium" | "fast") || "slow",
            height: settingsDoc?.height || 64,
            greyscale: settingsDoc?.greyscale ?? true,
            linkEnabled: settingsDoc?.linkEnabled ?? true,
          },
        };
      }
    }
  } catch (err) {
    console.warn("[Data Access] LogoReel DB query error, using static fallback:", err);
  }

  return {
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
  };
}
