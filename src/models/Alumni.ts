import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAlumni extends Document {
  batch: string;
  name: string;
  currentRole: string;
  company: string;
  location: string;
  photoUrl: string;
  testimonial?: string;
  isFeatured: boolean;
  linkedin?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlumniSchema = new Schema<IAlumni>(
  {
    batch: { type: String, required: true, index: true },
    name: { type: String, required: true },
    currentRole: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    photoUrl: { type: String, required: true },
    testimonial: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false, index: true },
    linkedin: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Alumni: Model<IAlumni> =
  mongoose.models.Alumni || mongoose.model<IAlumni>("Alumni", AlumniSchema);
