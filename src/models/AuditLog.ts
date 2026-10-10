import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAuditLog extends Document {
  actorEmail: string;
  entity: string;
  entityId: string;
  action: "create" | "update" | "delete" | "reorder" | "settings";
  before?: unknown;
  after?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorEmail: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, default: "" },
    action: {
      type: String,
      enum: ["create", "update", "delete", "reorder", "settings"],
      required: true,
    },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
