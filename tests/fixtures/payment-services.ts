export const deliveries: string[] = [];
export let failRecipient: string | null = null;
export function failEmailFor(recipient: string | null) { failRecipient = recipient; }
export async function sendOrderConfirmationEmail(_input: unknown, recipient: string) {
  if (recipient === failRecipient) throw new Error("Simulated SES failure");
  deliveries.push(recipient);
}
export async function getServerSession() { return null; }
export const authOptions = {};
export default { orders: { async create(input: { amount: number; receipt: string }) {
  return { id: `order_${input.receipt.replaceAll("-", "")}`, amount: input.amount };
} } };
