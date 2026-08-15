import LegalPageView, { getLegalMetadata } from "../LegalPageView";

export const metadata = getLegalMetadata("shipping", "/shipping");

export default function ShippingPage() {
  return <LegalPageView slug="shipping" />;
}
