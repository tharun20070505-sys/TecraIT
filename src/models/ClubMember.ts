import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClubMemberDoc extends Document {
  clubId: string;
  name: string;
  role: string;
  batch?: string;
  photo?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClubMemberSchema = new Schema<IClubMemberDoc>(
  {
    clubId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    batch: { type: String, default: "", trim: true },
    photo: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ClubMemberSchema.index({ clubId: 1, order: 1 });

export const ClubMember: Model<IClubMemberDoc> =
  mongoose.models.ClubMember || mongoose.model<IClubMemberDoc>("ClubMember", ClubMemberSchema);
