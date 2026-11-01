import { z } from "zod";
import { BESPOKE_STAGES, MEASUREMENT_FIELDS } from "./rules";
const text = (max: number) => z.string().trim().min(1).max(max);
export const addressInput = z.object({
  id: z.uuid().optional(),
  label: z.string().trim().max(80).default(""),
  recipientName: text(120),
  phone: text(40),
  line1: text(300),
  line2: z.string().trim().max(300).default(""),
  city: text(100),
  state: text(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid six-digit Indian pincode"),
  country: z.literal("India").default("India"),
  isDefault: z.boolean().default(false),
});
const measurementValue = z
  .number()
  .positive()
  .max(500)
  .nullable()
  .default(null);
const measurementShape = Object.fromEntries(
  MEASUREMENT_FIELDS.map((field) => [field, measurementValue]),
) as Record<(typeof MEASUREMENT_FIELDS)[number], typeof measurementValue>;
export const measurementInput = z
  .object({
    id: z.uuid().optional(),
    label: text(100),
    unit: z.enum(["inches", "cm"]).default("inches"),
    ...measurementShape,
  })
  .refine(
    (value) => MEASUREMENT_FIELDS.some((field) => value[field] !== null),
    "Enter at least one measurement",
  );
export const profileInput = z.object({
  name: text(120),
  number: z
    .string()
    .trim()
    .max(40)
    .nullish()
    .transform((value) => value ?? ""),
  dateOfBirth: z
    .union([z.iso.date(), z.literal("")])
    .default("")
    .refine(
      (value) => !value || new Date(value).getTime() <= Date.now(),
      "Date of birth cannot be in the future",
    ),
  preferredTopSize: z.string().trim().max(20).default(""),
  preferredBottomSize: z.string().trim().max(20).default(""),
  preferredBlouseSize: z.string().trim().max(20).default(""),
});
export const deleteInput = z.object({ id: z.uuid() });
export const wishlistInput = z.object({
  add: z.array(z.uuid()).max(200).default([]),
  remove: z.array(z.uuid()).max(200).default([]),
});
export const bespokeInput = z.object({
  garmentType: text(120),
  occasion: z.string().trim().max(100).default(""),
  eventDate: z.union([z.iso.date(), z.literal("")]).default(""),
  budgetRange: z.string().trim().max(80).default(""),
  fabricPreference: z.string().trim().max(120).default(""),
  colorPreference: z.string().trim().max(120).default(""),
  inspirationNotes: z.string().trim().min(20).max(2000),
  fullName: text(120),
  email: z.email().max(254),
  phone: z.string().trim().max(40).default(""),
  country: z.string().trim().max(80).default(""),
});
export const bespokeUpdateInput = z.object({
  id: z.uuid(),
  status: z.enum(["submitted", "in_progress", "completed", "cancelled"]),
  milestone: z.enum(BESPOKE_STAGES),
  note: z.string().trim().max(2000).default(""),
  imageUrl: z
    .union([z.url({ protocol: /^https?$/ }), z.literal("")])
    .default(""),
  estimatedDeliveryDate: z.union([z.iso.date(), z.literal("")]).default(""),
  expectedUpdatedAt: z.iso.datetime(),
});
