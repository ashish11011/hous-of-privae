import { getUserByEmail } from "@/lib/auth/getUserTypeFromEmail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import ContactForm from "./contactForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  let userData;
  if (session) {
    userData = await getUserByEmail(session?.email);
  }

  return <ContactForm userData={userData} />;
}
