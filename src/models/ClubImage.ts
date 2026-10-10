import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClubImageDoc extends Document {
  clubId: string;
  url: string;
  blurDataUrl?: string;
  alt: string;
  caption?: string;
  focalPoint: { x: number; y: number };
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClubImageSchema = new Schema<IClubImageDoc>(
  {
    clubId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    blurDataUrl: { type: String, default: "" },
    alt: { type: String, required: true, trim: true },
    caption: { type: String, default: "", trim: true },
    focalPoint: {
      x: { type: Number, default: 50, min: 0, max: 100 },
      y: { type: Number, default: 50, min: 0, max: 100 },
    },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ClubImageSchema.index({ clubId: 1, order: 1 });

export const ClubImage: Model<IClubImageDoc> =
  mongoose.models.ClubImage || mongoose.model<IClubImageDoc>("ClubImage", ClubImageSchema);
