export const LOYALTY_POINTS_PER_RUPEE_VALUE = 10;
export const LOYALTY_REWARD_SPEND_BLOCK = 100;
export const LOYALTY_REWARD_POINTS_PER_BLOCK = 10;
export const LOYALTY_MAX_REDEMPTION_PERCENT = 20;

// Redeem in whole rupees (10 points) to match the order's integer INR totals.
export function maximumRedeemablePoints(cartValue: number, availablePoints: number) {
  const cart = Math.max(0, Math.floor(Number(cartValue) || 0));
  const available = Math.max(0, Math.floor(Number(availablePoints) || 0));
  return Math.min(
    Math.floor(cart / (100 / LOYALTY_MAX_REDEMPTION_PERCENT)) * LOYALTY_POINTS_PER_RUPEE_VALUE,
    Math.floor(available / LOYALTY_POINTS_PER_RUPEE_VALUE) * LOYALTY_POINTS_PER_RUPEE_VALUE,
  );
}

export function calculateOrderRewardPoints(totalAmountPaid: number) {
  const amount = Math.max(0, Math.floor(Number(totalAmountPaid) || 0));
  return Math.floor(amount / LOYALTY_REWARD_SPEND_BLOCK) * LOYALTY_REWARD_POINTS_PER_BLOCK;
}

export function loyaltyPointsToRupees(points: number) {
  return Number(((Number(points) || 0) / LOYALTY_POINTS_PER_RUPEE_VALUE).toFixed(2));
}
