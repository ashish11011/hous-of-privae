import LegalPageView, { getLegalMetadata } from "../LegalPageView";

export const metadata = getLegalMetadata("terms", "/terms");

export default function TermsPage() {
  return <LegalPageView slug="terms" />;
}
