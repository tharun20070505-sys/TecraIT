import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHealthCheck extends Document {
  service: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  message?: string;
  checkedAt: Date;
}

const HealthCheckSchema = new Schema<IHealthCheck>(
  {
    service: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["healthy", "degraded", "down"],
      required: true,
    },
    latencyMs: { type: Number, required: true },
    message: { type: String, default: "" },
    checkedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const HealthCheck: Model<IHealthCheck> =
  mongoose.models.HealthCheck ||
  mongoose.model<IHealthCheck>("HealthCheck", HealthCheckSchema);
