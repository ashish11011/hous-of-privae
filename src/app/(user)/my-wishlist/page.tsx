import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import WishlistClient from "./WishlistClient";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.email) {
    redirect("/auth/login?callbackUrl=/my-wishlist");
  }

  return <WishlistClient />;
}
