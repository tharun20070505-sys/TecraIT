import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFaculty extends Document {
  name: string;
  position: string;
  qualification: string;
  specialisation: string;
  email: string;
  contactNumber: string;
  showEmail: boolean;
  showContactNumber: boolean;
  photoUrl: string;
  isHod: boolean;
  bio?: string;
  quote?: string;
  order: number;
  quota?: string;
  quotaLabel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    qualification: { type: String, required: true },
    specialisation: { type: String, required: true },
    email: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    showEmail: { type: Boolean, default: true },
    showContactNumber: { type: Boolean, default: false },
    photoUrl: { type: String, required: true },
    isHod: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    quote: { type: String, default: "" },
    order: { type: Number, default: 0 },
    quota: { type: String, default: "" },
    quotaLabel: { type: String, default: "Cadre" },
  },
  { timestamps: true }
);

export const Faculty: Model<IFaculty> =
  mongoose.models.Faculty || mongoose.model<IFaculty>("Faculty", FacultySchema);
