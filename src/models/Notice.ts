import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotice extends Document {
  title: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    link: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Notice: Model<INotice> =
  mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);
