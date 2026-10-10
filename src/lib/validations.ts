import { z } from "zod";

export const clubImageSchema = z.object({
  alt: z.string().min(1, "Alt text is required"),
  caption: z.string().optional().default(""),
  focalPoint: z
    .object({
      x: z.number().min(0).max(100).default(50),
      y: z.number().min(0).max(100).default(50),
    })
    .default({ x: 50, y: 50 }),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const clubMemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  role: z.string().min(1, "Role is required"),
  batch: z.string().optional().default(""),
  photo: z.string().optional().default(""),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const csvMemberRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  batch: z.string().optional().default(""),
  photo: z.string().optional().default(""),
});

export const logoReelItemSchema = z.object({
  type: z.enum(["club", "association", "custom"]).default("custom"),
  refId: z.string().optional().default(""),
  label: z.string().min(1, "Label is required"),
  logoUrl: z.string().min(1, "Logo image URL is required"),
  logoDarkUrl: z.string().optional().default(""),
  href: z.string().optional().default(""),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const logoReelSettingsSchema = z.object({
  speed: z.enum(["slow", "medium", "fast"]).default("slow"),
  height: z.number().min(32).max(120).default(64),
  greyscale: z.boolean().default(true),
  linkEnabled: z.boolean().default(true),
});

export const associationLogoSchema = z.object({
  logoLight: z.string().min(1, "Main logo is required"),
  logoDark: z.string().optional().default(""),
  alt: z.string().min(1, "Alt text is required"),
  showInFooter: z.boolean().default(false),
  showInReel: z.boolean().default(false),
});
