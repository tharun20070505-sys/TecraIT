import mongoose, { Schema, Document, Model } from "mongoose";

export interface INavItemChild {
  label: string;
  href: string;
  order: number;
  visible: boolean;
}

export interface INavItem extends Document {
  label: string;
  href: string;
  /** "page" = plain link, "dropdown" = has children, "auto" = children auto-sourced */
  type: "page" | "dropdown" | "auto";
  /** For "auto" dropdowns, the source collection (e.g. "clubs") */
  autoSource?: string;
  children: INavItemChild[];
  order: number;
  visible: boolean;
  /** Core system items may not be deleted, only renamed/reordered/hidden */
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NavItemChildSchema = new Schema<INavItemChild>(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const NavItemSchema = new Schema<INavItem>(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    type: { type: String, enum: ["page", "dropdown", "auto"], default: "page" },
    autoSource: { type: String, default: null },
    children: { type: [NavItemChildSchema], default: [] },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NavItemModel: Model<INavItem> =
  mongoose.models.NavItem ||
  mongoose.model<INavItem>("NavItem", NavItemSchema);
