export const deliveries: string[] = [];
export let failRecipient: string | null = null;
export function failEmailFor(recipient: string | null) { failRecipient = recipient; }
export async function sendOrderConfirmationEmail(_input: unknown, recipient: string) {
  if (recipient === failRecipient) throw new Error("Simulated SES failure");
  deliveries.push(recipient);
}
let session: { id: string } | null = null;
export function setTestSession(value: { id: string } | null) { session = value; }
export async function getServerSession() { return session; }
export const statusDeliveries: { orderId: string; email: string; status: string }[] = [];
export async function sendOrderStatusEmail(input: { orderId: string; email: string; status: string }) {
  if (failRecipient === "status") throw new Error("Simulated status email failure");
  statusDeliveries.push(input);
}
export const authOptions = {};
export default { orders: { async create(input: { amount: number; receipt: string }) {
  return { id: `order_${input.receipt.replaceAll("-", "")}`, amount: input.amount };
} } };
