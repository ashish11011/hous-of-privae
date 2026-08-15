import LegalPageView, { getLegalMetadata } from "../LegalPageView";

export const metadata = getLegalMetadata("privacy", "/privacy");

export default function PrivacyPage() {
  return <LegalPageView slug="privacy" />;
}
