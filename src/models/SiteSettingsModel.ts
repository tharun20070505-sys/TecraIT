import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteSettings extends Document {
  tneaCode: string;
  officePhone: string;
  highlightPillText: string;
  brochurePdfUrl: string;
  srietLogoSrc: string;
  heroCampusImage: string;
  heroIntervalSeconds: number;
  heroOverlayMinimum: number;
  heroTitleLineOne: string;
  heroTitleLineTwo: string;
  heroTextSeconds: number;
  navbarBadgeLogos: Array<{
    id: string;
    url: string;
    alt: string;
    order: number;
  }>;
  brandReel: Array<{
    id: string;
    text: string;
    order: number;
    active: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    tneaCode: { type: String, default: "2738" },
    officePhone: { type: String, default: "" },
    highlightPillText: { type: String, default: "" },
    brochurePdfUrl: { type: String, default: "" },
    srietLogoSrc: { type: String, default: "/images/logos/sriet-logo.png" },
    heroCampusImage: { type: String, default: "/images/hero/hero-background.jpg" },
    heroIntervalSeconds: { type: Number, min: 5, max: 20, default: 10 },
    heroOverlayMinimum: { type: Number, min: 0.7, max: 0.95, default: 0.7 },
    heroTitleLineOne: { type: String, default: "TECRA" },
    heroTitleLineTwo: { type: String, default: "Department of Information Technology" },
    heroTextSeconds: { type: Number, min: 2, max: 6, default: 3 },
    navbarBadgeLogos: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
        alt: { type: String, default: "" },
        order: { type: Number, default: 0 },
      },
    ],
    brandReel: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        order: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export const SiteSettingsModel: Model<ISiteSettings> =
  mongoose.models.SiteSettingsModel ||
  mongoose.model<ISiteSettings>("SiteSettingsModel", SiteSettingsSchema);
