import LegalPageView, { getLegalMetadata } from "../LegalPageView";

export const metadata = getLegalMetadata("shipping", "/order-and-shipping");

export default function ShippingAndDeliveryPage() {
  return <LegalPageView slug="shipping" />;
}
