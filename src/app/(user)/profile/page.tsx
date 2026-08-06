import { getUserByEmail } from "@/lib/auth/getUserTypeFromEmail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import ContactForm from "./contactForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.email) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  const userData = await getUserByEmail(session.email);
  return <ContactForm userData={userData} />;
}
