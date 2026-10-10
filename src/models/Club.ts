import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClubMember {
  id: string;
  name: string;
  role: string;
  batch: string;
  photoUrl?: string;
}

export interface IClubWeeklyReport {
  id: string;
  weekNumber: number;
  date: string;
  title: string;
  description: string;
  highlights?: string[];
}

export interface IClubImage {
  id: string;
  url: string;
  caption: string;
}

export interface IClub extends Document {
  slug: string;
  name: string;
  type: "technical" | "non-technical";
  logoUrl: string;
  shortDescription: string;
  about: string;
  vision: string;
  mission: string;
  whatWeDo: string[];
  members: IClubMember[];
  weeklyReports?: IClubWeeklyReport[];
  videoUrl?: string;
  videoPoster?: string;
  images: IClubImage[];
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema = new Schema<IClub>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["technical", "non-technical"], required: true },
    logoUrl: { type: String, required: true },
    shortDescription: { type: String, required: true },
    about: { type: String, required: true },
    vision: { type: String, required: true },
    mission: { type: String, required: true },
    whatWeDo: { type: [String], default: [] },
    members: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          role: { type: String, required: true },
          batch: { type: String, required: true },
          photoUrl: { type: String },
        },
      ],
      default: [],
    },
    weeklyReports: {
      type: [
        {
          id: { type: String, required: true },
          weekNumber: { type: Number, required: true },
          date: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
          highlights: { type: [String], default: [] },
        },
      ],
      default: [],
    },
    videoUrl: { type: String },
    videoPoster: { type: String },
    images: {
      type: [
        {
          id: { type: String, required: true },
          url: { type: String, required: true },
          caption: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Club: Model<IClub> =
  mongoose.models.Club || mongoose.model<IClub>("Club", ClubSchema);
