import LegalPageView, { getLegalMetadata } from "../LegalPageView";

export const metadata = getLegalMetadata("returns", "/returns");

export default function ReturnsPage() {
  return <LegalPageView slug="returns" />;
}
