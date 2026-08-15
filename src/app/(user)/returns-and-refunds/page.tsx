import LegalPageView, { getLegalMetadata } from "../LegalPageView";

export const metadata = getLegalMetadata("returns", "/returns-and-refunds");

export default function ReturnAndRefundPage() {
  return <LegalPageView slug="returns" />;
}
