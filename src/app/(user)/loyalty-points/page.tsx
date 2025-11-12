import { getUserByEmail } from "@/lib/auth/getUserTypeFromEmail";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import LoyalityCard from "./card";
import Link from "next/link";

const Page = async () => {
  const session = await getServerSession(authOptions);
  let userData;
  if (session) {
    userData = await getUserByEmail(session?.email);
  }

  if (!session) {
    return (
      <div className="text-red-500">
        You must be logged in <Link href="/login">Login</Link>
      </div>
    );
  }

  return <LoyalityCard logedinUserData={userData} />;
};

export default Page;
