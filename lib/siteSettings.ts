import { siteSettingsTable } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export type LandingSettings = {
  navbarMessages: string[];
  landingBanners: {
    mobile: string[];
    desktop: string[];
  };
};

export const LANDING_SETTINGS_KEY = "landing_page";

export const DEFAULT_LANDING_SETTINGS: LandingSettings = {
  navbarMessages: [
    "Aarambh Collection · Now Live",
    "Complimentary Shipping Across India",
    "Handcrafted in Jaipur",
  ],
  landingBanners: {
    mobile: [
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Mobile+banner+(1).png",
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Mobile+banner+2+(1).png",
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Mobile+banner3+(1).png",
    ],
    desktop: [
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Desktop+banner+(1).png",
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Desktop+banner+2+(1).png",
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/desktop+banner3+(1).png",
    ],
  },
};

function normalizeStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  return cleaned.length > 0 ? cleaned : fallback;
}

export function normalizeLandingSettings(value: unknown): LandingSettings {
  const settings = value as Partial<LandingSettings> | null | undefined;
  return {
    navbarMessages: normalizeStringArray(
      settings?.navbarMessages,
      DEFAULT_LANDING_SETTINGS.navbarMessages
    ),
    landingBanners: {
      mobile: normalizeStringArray(
        settings?.landingBanners?.mobile,
        DEFAULT_LANDING_SETTINGS.landingBanners.mobile
      ),
      desktop: normalizeStringArray(
        settings?.landingBanners?.desktop,
        DEFAULT_LANDING_SETTINGS.landingBanners.desktop
      ),
    },
  };
}

function isMissingSiteSettingsTable(error: unknown) {
  const err = error as { cause?: { code?: string }; code?: string };
  return err.code === "42P01" || err.cause?.code === "42P01";
}

export async function getLandingSettings() {
  try {
    const row = await db.query.siteSettingsTable.findFirst({
      where: eq(siteSettingsTable.key, LANDING_SETTINGS_KEY),
    });

    return normalizeLandingSettings(row?.value);
  } catch (error) {
    if (!isMissingSiteSettingsTable(error)) {
      console.error("Failed to load landing settings:", error);
    }
    return DEFAULT_LANDING_SETTINGS;
  }
}

export async function upsertLandingSettings(settings: LandingSettings) {
  const value = normalizeLandingSettings(settings);
  const existing = await db.query.siteSettingsTable.findFirst({
    where: eq(siteSettingsTable.key, LANDING_SETTINGS_KEY),
  });

  if (existing) {
    const [updated] = await db
      .update(siteSettingsTable)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteSettingsTable.key, LANDING_SETTINGS_KEY))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(siteSettingsTable)
    .values({ key: LANDING_SETTINGS_KEY, value })
    .returning();
  return created;
}
