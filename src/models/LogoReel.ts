import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILogoReelItemDoc extends Document {
  type: "club" | "association" | "custom";
  refId?: string;
  label: string;
  logoUrl: string;
  logoDarkUrl?: string;
  href?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILogoReelSettingsDoc extends Document {
  speed: "slow" | "medium" | "fast";
  height: number;
  greyscale: boolean;
  linkEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LogoReelItemSchema = new Schema<ILogoReelItemDoc>(
  {
    type: { type: String, enum: ["club", "association", "custom"], default: "club", required: true },
    refId: { type: String, default: "" },
    label: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    logoDarkUrl: { type: String, default: "" },
    href: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const LogoReelSettingsSchema = new Schema<ILogoReelSettingsDoc>(
  {
    speed: { type: String, enum: ["slow", "medium", "fast"], default: "slow" },
    height: { type: Number, default: 64, min: 32, max: 120 },
    greyscale: { type: Boolean, default: true },
    linkEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const LogoReelItem: Model<ILogoReelItemDoc> =
  mongoose.models.LogoReelItem || mongoose.model<ILogoReelItemDoc>("LogoReelItem", LogoReelItemSchema);

export const LogoReelSettings: Model<ILogoReelSettingsDoc> =
  mongoose.models.LogoReelSettings || mongoose.model<ILogoReelSettingsDoc>("LogoReelSettings", LogoReelSettingsSchema);
