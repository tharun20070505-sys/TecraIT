import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  fullContent?: string;
  posterUrl: string;
  isUpcoming: boolean;
  scope: "Department" | "College";
  category: string;
  tags: string[];
  agenda: string[];
  registerUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    description: { type: String, required: true },
    fullContent: { type: String, default: "" },
    posterUrl: { type: String, required: true },
    isUpcoming: { type: Boolean, default: true, index: true },
    scope: { type: String, enum: ["Department", "College"], required: true },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    agenda: { type: [String], default: [] },
    registerUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
