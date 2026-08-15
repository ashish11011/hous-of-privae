import LegalPageView, { getLegalMetadata } from "../LegalPageView";

export const metadata = getLegalMetadata("privacy", "/privacy-policy");

export default function PrivacyPolicyPage() {
  return <LegalPageView slug="privacy" />;
}
