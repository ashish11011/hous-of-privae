export const LOYALTY_POINTS_PER_RUPEE_VALUE = 10;
export const LOYALTY_REWARD_SPEND_BLOCK = 100;
export const LOYALTY_REWARD_POINTS_PER_BLOCK = 10;

export function calculateOrderRewardPoints(totalAmountPaid: number) {
  const amount = Math.max(0, Math.floor(Number(totalAmountPaid) || 0));
  return Math.floor(amount / LOYALTY_REWARD_SPEND_BLOCK) * LOYALTY_REWARD_POINTS_PER_BLOCK;
}

export function loyaltyPointsToRupees(points: number) {
  return Number(((Number(points) || 0) / LOYALTY_POINTS_PER_RUPEE_VALUE).toFixed(2));
}
