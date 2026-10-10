import mongoose, { Schema, Document, Model } from "mongoose";

export interface IErrorLog extends Document {
  message: string;
  stack?: string;
  digest?: string;
  pathname?: string;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
}

const ErrorLogSchema = new Schema<IErrorLog>(
  {
    message: { type: String, required: true },
    stack: { type: String, default: "" },
    digest: { type: String, default: "" },
    pathname: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const ErrorLog: Model<IErrorLog> =
  mongoose.models.ErrorLog ||
  mongoose.model<IErrorLog>("ErrorLog", ErrorLogSchema);
