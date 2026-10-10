import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAssociation extends Document {
  batch: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  photoUrl: string;
  order: number;
  linkedin?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssociationSchema = new Schema<IAssociation>(
  {
    batch: { type: String, required: true, index: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    photoUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
    linkedin: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Association: Model<IAssociation> =
  mongoose.models.Association ||
  mongoose.model<IAssociation>("Association", AssociationSchema);
