import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { AssociationLogo, LogoReelItem } from "@/models";
import {
  validateAndProcessLogo,
  deleteUploadedFile,
  logAuditAction,
} from "@/lib/media-upload";

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
      return NextResponse.json({
        logo: {
          logoLight: "/images/logos/tecra-logo.png",
          logoDark: "",
          alt: "TECRA IT Association Emblem",
          showInFooter: false,
          showInReel: false,
        },
      });
    }

    let doc = await AssociationLogo.findOne().lean();
    if (!doc) {
      doc = {
        logoLight: "/images/logos/tecra-logo.png",
        logoDark: "",
        alt: "TECRA IT Association Emblem",
        showInFooter: false,
        showInReel: false,
      } as unknown as typeof doc;
    }

    return NextResponse.json({ logo: doc });
  } catch (err) {
    console.error("[Association Logo GET Error]", err);
    return NextResponse.json({ error: "Failed to load logo" }, { status: 500 });
  }
}

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
    let doc = await AssociationLogo.findOne();
    if (!doc) {
      doc = new AssociationLogo({
        logoLight: "/images/logos/tecra-logo.png",
        logoDark: "",
        alt: "TECRA IT Association Emblem",
        showInFooter: false,
        showInReel: false,
      });
    }

    const before = doc.toObject();
    let warning: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const lightFile = formData.get("logoLight") as File | null;
      const darkFile = formData.get("logoDark") as File | null;
      const alt = formData.get("alt") as string | null;
      const showInFooter = formData.get("showInFooter");
      const showInReel = formData.get("showInReel");
      const removeDark = formData.get("removeDark") === "true";

      if (lightFile && lightFile.size > 0) {
        if (doc.logoLight && doc.logoLight.startsWith("/uploads/")) {
          await deleteUploadedFile(doc.logoLight);
        }
        const buf = Buffer.from(await lightFile.arrayBuffer());
        const processedLight = await validateAndProcessLogo(buf, "association");
        doc.logoLight = processedLight.url;
        warning = processedLight.warning;
      }

      if (removeDark && doc.logoDark) {
        await deleteUploadedFile(doc.logoDark);
        doc.logoDark = "";
      } else if (darkFile && darkFile.size > 0) {
        if (doc.logoDark && doc.logoDark.startsWith("/uploads/")) {
          await deleteUploadedFile(doc.logoDark);
        }
        const darkBuf = Buffer.from(await darkFile.arrayBuffer());
        const processedDark = await validateAndProcessLogo(darkBuf, "association");
        doc.logoDark = processedDark.url;
      }

      if (alt && alt.trim()) doc.alt = alt.trim();
      if (showInFooter !== null && showInFooter !== undefined) {
        doc.showInFooter = String(showInFooter) === "true";
      }
      if (showInReel !== null && showInReel !== undefined) {
        doc.showInReel = String(showInReel) === "true";
      }

      await doc.save();
    } else {
      const body = await req.json();
      if (body.alt) doc.alt = String(body.alt).trim();
      if (body.showInFooter !== undefined) doc.showInFooter = Boolean(body.showInFooter);
      if (body.showInReel !== undefined) doc.showInReel = Boolean(body.showInReel);
      if (body.logoLight) doc.logoLight = String(body.logoLight).trim();
      if (body.logoDark !== undefined) doc.logoDark = String(body.logoDark).trim();

      await doc.save();
    }

    // Sync with Logo Reel if showInReel
    if (doc.showInReel) {
      await LogoReelItem.findOneAndUpdate(
        { type: "association" },
        {
          $set: {
            refId: "it-association",
            label: doc.alt || "TECRA IT Association",
            logoUrl: doc.logoLight,
            logoDarkUrl: doc.logoDark || "",
            href: "/student-life/it-association",
            active: true,
          },
        },
        { upsert: true }
      );
    } else {
      await LogoReelItem.deleteOne({ type: "association" });
    }

    await logAuditAction({
      actorEmail: session.email,
      entity: "AssociationLogo",
      entityId: String(doc._id),
      action: "update",
      before,
      after: doc.toObject(),
    });

    revalidatePath("/student-life/it-association");
    revalidatePath("/student-life");
    revalidatePath("/");
    revalidatePath("/clubs");

    return NextResponse.json({
      success: true,
      logo: doc,
      warning,
    });
  } catch (err: unknown) {
    console.error("[Association Logo POST Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to update association logo";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const doc = await AssociationLogo.findOne();
    if (doc) {
      const before = doc.toObject();
      if (doc.logoLight && doc.logoLight.startsWith("/uploads/")) {
        await deleteUploadedFile(doc.logoLight);
      }
      if (doc.logoDark && doc.logoDark.startsWith("/uploads/")) {
        await deleteUploadedFile(doc.logoDark);
      }

      doc.logoLight = "/images/logos/tecra-logo.png";
      doc.logoDark = "";
      doc.showInFooter = false;
      doc.showInReel = false;
      await doc.save();

      await LogoReelItem.deleteOne({ type: "association" });

      await logAuditAction({
        actorEmail: session.email,
        entity: "AssociationLogo",
        entityId: String(doc._id),
        action: "delete",
        before,
        after: doc.toObject(),
      });
    }

    revalidatePath("/student-life/it-association");
    revalidatePath("/student-life");
    revalidatePath("/");

    return NextResponse.json({ success: true, message: "Association logo reset to default" });
  } catch (err: unknown) {
    console.error("[Association Logo DELETE Error]", err);
    const msg = err instanceof Error ? err.message : "Failed to delete association logo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
