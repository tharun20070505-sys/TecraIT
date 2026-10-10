import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    category: {
      type: String,
      default: "General",
      enum: ["General", "Admissions", "Academics", "Placements", "Alumni", "Collaboration"],
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);
