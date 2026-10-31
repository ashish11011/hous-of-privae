export const deliveries: string[] = [];
export let failRecipient: string | null = null;
export function failEmailFor(recipient: string | null) { failRecipient = recipient; }
export async function sendOrderConfirmationEmail(_input: unknown, recipient: string) {
  if (recipient === failRecipient) throw new Error("Simulated SES failure");
  deliveries.push(recipient);
}
let session: { id: string; email?: string } | null = null;
export function setTestSession(value: { id: string; email?: string } | null) { session = value; }
export async function getServerSession() { return session; }
export const statusDeliveries: { orderId: string; email: string; status: string }[] = [];
export async function sendOrderStatusEmail(input: { orderId: string; email: string; status: string }) {
  if (failRecipient === "status") throw new Error("Simulated status email failure");
  statusDeliveries.push(input);
}
export const authOptions = {};
export const giftDeliveries: { to: string; code: string }[] = [];
export let failGiftEmail = false;
export function failGiftDelivery(value: boolean) { failGiftEmail = value; }
export async function sendGiftCardEmail(input: { to: string; code: string }) {
  if (failGiftEmail) throw new Error("Simulated gift card email failure");
  giftDeliveries.push(input);
}
export const gatewayPurchases: { amount: number; receipt: string }[] = [];
export let gatewayFailure = false;
export function failGateway(value: boolean) { gatewayFailure = value; }
export default { orders: { async create(input: { amount: number; receipt: string }) {
  if (gatewayFailure) throw new Error("Simulated gateway failure");
  gatewayPurchases.push(input);
  return { id: `order_${input.receipt.replaceAll("-", "")}`, amount: input.amount };
} } };
