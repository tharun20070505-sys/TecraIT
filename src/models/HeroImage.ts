import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IHeroImage extends Document {
  url: string;
  responsiveUrls: string[];
  blurDataUrl: string;
  label: string;
  focalDesktop: { x: number; y: number };
  focalMobile: { x: number; y: number };
  overlay: number | null;
  active: boolean;
  startAt: Date | null;
  endAt: Date | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FocalPointSchema = new Schema(
  {
    x: { type: Number, min: 0, max: 100, default: 50 },
    y: { type: Number, min: 0, max: 100, default: 50 },
  },
  { _id: false }
);

const HeroImageSchema = new Schema<IHeroImage>(
  {
    url: { type: String, required: true },
    responsiveUrls: { type: [String], default: [] },
    blurDataUrl: { type: String, default: "" },
    label: { type: String, default: "" },
    focalDesktop: { type: FocalPointSchema, default: () => ({ x: 50, y: 50 }) },
    focalMobile: { type: FocalPointSchema, default: () => ({ x: 50, y: 50 }) },
    overlay: { type: Number, min: 0.7, max: 0.95, default: null },
    active: { type: Boolean, default: true, index: true },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export const HeroImage: Model<IHeroImage> =
  mongoose.models.HeroImage || mongoose.model<IHeroImage>("HeroImage", HeroImageSchema);
