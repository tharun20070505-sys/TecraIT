import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  LogoReelItem,
  LogoReelSettings,
  Club,
  AssociationLogo,
  type ILogoReelItemDoc,
  type IClub,
} from "@/models";
import { clubsData } from "@/data/clubs";
import {
  validateAndProcessLogo,
  logAuditAction,
} from "@/lib/media-upload";
import { logoReelSettingsSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    // 1. Fetch current LogoReelItems & Settings
    const [fetchedItems, settingsDoc] = await Promise.all([
      LogoReelItem.find().sort({ order: 1, createdAt: 1 }).lean<ILogoReelItemDoc[]>(),
      LogoReelSettings.findOne().lean(),
    ]);
    let items = fetchedItems;

    // 2. Sync all clubs: check if each club exists in LogoReelItem; if not, create it!
    const dbClubs = await Club.find().lean<IClub[]>();
    const allClubs = clubsData.map((sc) => {
      const match = dbClubs.find((c) => c.slug === sc.slug);
      return {
        slug: sc.slug,
        name: match?.name || sc.name,
        logoUrl: match?.logoUrl || sc.logoUrl || "",
      };
    });

    let currentOrder = items.length;
    let didSync = false;

    for (const club of allClubs) {
      const exists = items.find((it) => it.type === "club" && it.refId === club.slug);
      if (!exists) {
        const newItem = await LogoReelItem.create({
          type: "club",
          refId: club.slug,
          label: club.name,
          logoUrl: club.logoUrl,
          href: `/clubs/${club.slug}`,
          order: currentOrder++,
          active: true,
        });
        didSync = true;
        items.push(newItem.toObject() as unknown as ILogoReelItemDoc);
      } else {
        // Sync logo or name changes automatically if different
        if (exists.logoUrl !== club.logoUrl || exists.label !== club.name) {
          await LogoReelItem.updateOne(
            { _id: exists._id },
            { $set: { logoUrl: club.logoUrl, label: club.name } }
          );
          exists.logoUrl = club.logoUrl;
          exists.label = club.name;
        }
      }
    }

    // 3. Sync IT Association if turned on in AssociationLogo
    const assocLogo = await AssociationLogo.findOne().lean();
    if (assocLogo && assocLogo.showInReel) {
      const assocExists = items.find((it) => it.type === "association");
      if (!assocExists) {
        const newAssocItem = await LogoReelItem.create({
          type: "association",
          refId: "it-association",
          label: assocLogo.alt || "TECRA IT Association",
          logoUrl: assocLogo.logoLight,
          logoDarkUrl: assocLogo.logoDark || "",
          href: "/student-life/it-association",
          order: currentOrder++,
          active: true,
        });
        items.push(newAssocItem.toObject() as unknown as ILogoReelItemDoc);
      } else {
        if (assocExists.logoUrl !== assocLogo.logoLight) {
          await LogoReelItem.updateOne(
            { _id: assocExists._id },
            { $set: { logoUrl: assocLogo.logoLight, logoDarkUrl: assocLogo.logoDark || "" } }
          );
          assocExists.logoUrl = assocLogo.logoLight;
          assocExists.logoDarkUrl = assocLogo.logoDark || "";
        }
      }
    }

    if (didSync) {
      items = await LogoReelItem.find().sort({ order: 1, createdAt: 1 }).lean<ILogoReelItemDoc[]>();
    }

    // Flag clubs without a logo: "Logo missing. Upload one in Logos"
    const formattedItems = items.map((doc) => {
      const isMissingLogo =
        !doc.logoUrl ||
        doc.logoUrl.includes("placeholder") ||
        doc.logoUrl.trim() === "";

      return {
        id: String(doc._id),
        type: doc.type,
        refId: doc.refId || "",
        label: doc.label,
        logoUrl: doc.logoUrl,
        logoDarkUrl: doc.logoDarkUrl || "",
        href: doc.href || (doc.type === "club" ? `/clubs/${doc.refId}` : ""),
        order: doc.order,
        active: doc.active,
        isMissingLogo,
      };
    });

    const settings = {
      speed: settingsDoc?.speed || "slow",
      height: settingsDoc?.height || 64,
      greyscale: settingsDoc?.greyscale ?? true,
      linkEnabled: settingsDoc?.linkEnabled ?? true,
    };

    return NextResponse.json({
      items: formattedItems,
      settings,
    });
  } catch (err) {
    console.error("[Logo Reel GET Error]", err);
    return NextResponse.json({ error: "Failed to load logo reel" }, { status: 500 });
  }
}

// Add Custom Logo Item
export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const contentType = req.headers.get("content-type") || "";
    let logoUrl = "";
    let logoDarkUrl = "";
    let label = "";
    let href = "";
    let warning: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("logo") as File | null;
      const darkFile = formData.get("logoDark") as File | null;
      label = (formData.get("label") as string)?.trim() || "";
      href = (formData.get("href") as string)?.trim() || "";

      if (!file) {
        return NextResponse.json({ error: "PNG logo file is required" }, { status: 400 });
      }
      if (!label) {
        return NextResponse.json({ error: "Logo label / alt text is required" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const processed = await validateAndProcessLogo(buffer, "logos");
      logoUrl = processed.url;
      warning = processed.warning;

      if (darkFile && darkFile.size > 0) {
        const darkBuf = Buffer.from(await darkFile.arrayBuffer());
        const processedDark = await validateAndProcessLogo(darkBuf, "logos");
        logoDarkUrl = processedDark.url;
      }
    } else {
      const body = await req.json();
      logoUrl = String(body.logoUrl || "").trim();
      logoDarkUrl = String(body.logoDarkUrl || "").trim();
      label = String(body.label || "").trim();
      href = String(body.href || "").trim();

      if (!logoUrl || !label) {
        return NextResponse.json({ error: "Logo URL and label are required" }, { status: 400 });
      }
    }

    const count = await LogoReelItem.countDocuments();
    const newItem = await LogoReelItem.create({
      type: "custom",
      label,
      logoUrl,
      logoDarkUrl,
      href,
      order: count,
      active: true,
    });

    await logAuditAction({
      actorEmail: session.email,
      entity: "LogoReelItem",
      entityId: String(newItem._id),
      action: "create",
      after: newItem.toObject(),
    });

    revalidatePath("/");
    revalidatePath("/clubs");

    return NextResponse.json({
      success: true,
      item: {
        id: String(newItem._id),
        type: newItem.type,
        label: newItem.label,
        logoUrl: newItem.logoUrl,
        logoDarkUrl: newItem.logoDarkUrl,
        href: newItem.href,
        order: newItem.order,
        active: newItem.active,
      },
      warning,
    });
  } catch (err: unknown) {
    console.error("[Logo Reel POST Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to add logo reel item";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// Update settings and/or bulk reorder / active toggle
export async function PUT(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const body = await req.json();

    // 1. Update Logo Reel Settings
    if (body.settings) {
      const parsedSettings = logoReelSettingsSchema.parse(body.settings);
      const beforeSettings = await LogoReelSettings.findOne().lean();

      const updatedSettings = await LogoReelSettings.findOneAndUpdate(
        {},
        { $set: parsedSettings },
        { upsert: true, new: true }
      );

      await logAuditAction({
        actorEmail: session.email,
        entity: "LogoReelSettings",
        entityId: String(updatedSettings._id),
        action: "settings",
        before: beforeSettings,
        after: updatedSettings.toObject(),
      });
    }

    // 2. Update Items (order, active toggle, href)
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        if (item.id) {
          const updateFields: Record<string, unknown> = {};
          if (typeof item.order === "number") updateFields.order = item.order;
          if (typeof item.active === "boolean") updateFields.active = item.active;
          if (item.href !== undefined) updateFields.href = String(item.href).trim();

          if (Object.keys(updateFields).length > 0) {
            await LogoReelItem.updateOne({ _id: item.id }, { $set: updateFields });
          }
        }
      }

      await logAuditAction({
        actorEmail: session.email,
        entity: "LogoReelItem",
        entityId: "reel",
        action: "reorder",
        after: { updatedItemsCount: body.items.length },
      });
    }

    revalidatePath("/");
    revalidatePath("/clubs");

    return NextResponse.json({ success: true, message: "Logo reel configuration saved" });
  } catch (err: unknown) {
    console.error("[Logo Reel PUT Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to update logo reel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
