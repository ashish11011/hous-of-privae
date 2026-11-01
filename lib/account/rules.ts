export const CIRCLE_TIERS = [
  {
    key: "muse",
    name: "Muse",
    minSpend: 0,
    spendLabel: "₹0 – ₹49,999",
    multiplier: 1,
    perks: [
      "Privae Circle access",
      "Complimentary standard shipping",
      "Collection news",
      "Member updates",
    ],
  },
  {
    key: "eclat",
    name: "Eclat",
    minSpend: 50000,
    spendLabel: "₹50,000 – ₹1,00,000",
    multiplier: 1.25,
    perks: [
      "All Muse privileges",
      "Private previews before public release",
      "Priority atelier appointments",
      "One annual fit refinement session",
      "Personalised birthday accessory",
    ],
  },
  {
    key: "lumiere",
    name: "Lumiere",
    minSpend: 100001,
    spendLabel: "₹1,00,001 – ₹2,00,000",
    multiplier: 1.5,
    perks: [
      "All Eclat privileges",
      "Seasonal one-to-one wardrobe consultation",
      "Private collection appointments",
      "Fit refinement on Privae garments",
      "2.5% bonus Circle Points at every additional ₹50,000 milestone",
    ],
  },
  {
    key: "royale",
    name: "Royale",
    minSpend: 200001,
    spendLabel: "₹2,00,001 and above",
    multiplier: 2,
    perks: [
      "All Lumiere service privileges",
      "A named atelier concierge",
      "Private trunk shows and couture previews",
      "Annual personal wardrobe review",
      "Priority reservations and express delivery",
      "5% bonus Circle Points at every additional ₹50,000 milestone, replacing the Lumiere bonus",
    ],
  },
] as const;
export type CircleTierKey = (typeof CIRCLE_TIERS)[number]["key"];
export function tierFromSpend(spend: number) {
  return (
    [...CIRCLE_TIERS].reverse().find((tier) => spend >= tier.minSpend) ??
    CIRCLE_TIERS[0]
  );
}
export function circleProgress(spend: number) {
  const current = tierFromSpend(spend);
  const next = CIRCLE_TIERS.find((tier) => tier.minSpend > spend) ?? null;
  return {
    current,
    next,
    percent: next
      ? Math.min(
          100,
          Math.max(
            0,
            ((spend - current.minSpend) / (next.minSpend - current.minSpend)) *
              100,
          ),
        )
      : 100,
    remaining: next ? next.minSpend - spend : 0,
  };
}
export function circleMaximumPoints(eligibleAmount: number, balance: number) {
  const maximum =
    Math.floor(
      Math.min(Math.max(0, balance), Math.max(0, eligibleAmount) * 2) / 100,
    ) * 100;
  return maximum >= 1000 ? maximum : 0;
}
export function circleRewardPoints(amount: number, tier: CircleTierKey) {
  return Math.floor(
    Math.max(0, amount) *
      CIRCLE_TIERS.find((row) => row.key === tier)!.multiplier,
  );
}
export function addCircleMonths(date: Date, months: number) {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  result.setUTCDate(
    Math.min(
      day,
      new Date(
        Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
      ).getUTCDate(),
    ),
  );
  return result;
}
export const BESPOKE_STAGES = [
  "received",
  "consultation",
  "design_approved",
  "fabric_sourced",
  "cutting",
  "stitching",
  "embroidery",
  "quality_check",
  "dispatched",
  "delivered",
] as const;
export const BESPOKE_LABELS: Record<(typeof BESPOKE_STAGES)[number], string> = {
  received: "Request Received",
  consultation: "Consultation Held",
  design_approved: "Design Approved",
  fabric_sourced: "Fabric Sourced",
  cutting: "Cutting in Progress",
  stitching: "Stitching in Progress",
  embroidery: "Embroidery in Progress",
  quality_check: "Quality Check",
  dispatched: "Dispatched",
  delivered: "Delivered",
};
export const MEASUREMENT_FIELDS = [
  "bust",
  "waist",
  "hips",
  "shoulder",
  "sleeveLength",
  "kurtaLength",
  "inseam",
  "height",
] as const;
