import { z } from "zod";

export function collectionSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export const collectionInput = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Collection name is required").max(120),
  slug: z.string().trim().min(1, "Slug is required").max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens for the slug"),
  image: z.url({ protocol: /^https?$/ }).max(2048),
  label: z.string().trim().max(120).default(""),
  tagline: z.string().trim().max(240).default(""),
  description: z.string().trim().max(5000).default(""),
  isActive: z.boolean().default(true),
  isComingSoon: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(100000).default(0),
  productPriorities: z.record(z.uuid(), z.number().int().min(1).max(2147483647)).optional(),
  productIds: z.array(z.uuid()).max(2000).transform(ids => [...new Set(ids)]),
});

export type CollectionInput = z.infer<typeof collectionInput>;
