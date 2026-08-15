import LegalPageView, { getLegalMetadata } from "../LegalPageView";

export const metadata = getLegalMetadata("terms", "/terms-and-conditions");

export default function TermsAndConditionsPage() {
  return <LegalPageView slug="terms" />;
}
