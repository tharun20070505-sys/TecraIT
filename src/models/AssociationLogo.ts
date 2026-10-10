import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAssociationLogoDoc extends Document {
  logoLight: string;
  logoDark?: string;
  alt: string;
  showInFooter: boolean;
  showInReel: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssociationLogoSchema = new Schema<IAssociationLogoDoc>(
  {
    logoLight: { type: String, default: "/images/logos/tecra-logo.png" },
    logoDark: { type: String, default: "" },
    alt: { type: String, default: "TECRA IT Association Emblem", trim: true },
    showInFooter: { type: Boolean, default: false },
    showInReel: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AssociationLogo: Model<IAssociationLogoDoc> =
  mongoose.models.AssociationLogo || mongoose.model<IAssociationLogoDoc>("AssociationLogo", AssociationLogoSchema);
