import { getUserByEmail } from "@/lib/auth/getUserTypeFromEmail";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import LoyalityCard from "./card";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.email) {
    redirect("/auth/login?callbackUrl=/loyalty-points");
  }

  const userData = await getUserByEmail(session.email);
  return <LoyalityCard logedinUserData={userData} />;
};

export default Page;
