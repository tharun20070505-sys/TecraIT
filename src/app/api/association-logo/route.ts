import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AssociationLogo } from "@/models";
import { associationData } from "@/data/association";

export async function GET() {
  try {
    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      const doc = await AssociationLogo.findOne().lean();
      if (doc) {
        return NextResponse.json({
          logo: {
            logoLight: doc.logoLight || associationData.logoUrl,
            logoDark: doc.logoDark || "",
            alt: doc.alt || "TECRA IT Association Logo",
            showInFooter: Boolean(doc.showInFooter),
            showInReel: Boolean(doc.showInReel),
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Public Association Logo GET Error]", err);
  }

  return NextResponse.json({
    logo: {
      logoLight: associationData.logoUrl,
      logoDark: "",
      alt: "TECRA IT Association Logo",
      showInFooter: false,
      showInReel: false,
    },
  });
}
