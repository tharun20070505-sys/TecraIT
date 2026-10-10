import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryImage extends Document {
  title: string;
  imageUrl: string;
  category: string;
  caption?: string;
  date: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true, index: true },
    caption: { type: String, default: "" },
    date: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const GalleryImage: Model<IGalleryImage> =
  mongoose.models.GalleryImage ||
  mongoose.model<IGalleryImage>("GalleryImage", GalleryImageSchema);
