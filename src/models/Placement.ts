import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlacedStudent {
  id: string;
  name: string;
  company: string;
  role: string;
  package: string;
  photoUrl: string;
}

export interface IRecruiterPartner {
  id: string;
  name: string;
  logoUrl: string;
  offers: number;
}

export interface IPlacement extends Document {
  batch: string;
  academicYear: string;
  totalOffers: string;
  highestPackage: string;
  averagePackage: string;
  topRecruiters: string[];
  recruiters: IRecruiterPartner[];
  placedStudents: IPlacedStudent[];
  createdAt: Date;
  updatedAt: Date;
}

const PlacementSchema = new Schema<IPlacement>(
  {
    batch: { type: String, required: true, index: true },
    academicYear: { type: String, required: true },
    totalOffers: { type: String, required: true },
    highestPackage: { type: String, required: true },
    averagePackage: { type: String, required: true },
    topRecruiters: { type: [String], default: [] },
    recruiters: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          logoUrl: { type: String, required: true },
          offers: { type: Number, required: true },
        },
      ],
      default: [],
    },
    placedStudents: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          company: { type: String, required: true },
          role: { type: String, required: true },
          package: { type: String, required: true },
          photoUrl: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Placement: Model<IPlacement> =
  mongoose.models.Placement ||
  mongoose.model<IPlacement>("Placement", PlacementSchema);
