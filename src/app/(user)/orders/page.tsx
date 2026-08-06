import { Button } from "@/components/ui/button";
import { getUserOrderData } from "@/src/hepler";
import Link from "next/link";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.email) {
    redirect("/auth/login?callbackUrl=/orders");
  }

  const orderData = await getUserOrderData();
  if (!orderData || orderData.length === 0)
    return (
      <div className=" py-32 space-y-3 text-center px-6 text-xl  text-gray-600 capitalize ">
        <p>no order found</p>
        <Link href={"/"}>
          <Button variant={"outline"}>create order</Button>
        </Link>
      </div>
    );
  return <div>page</div>;
};

export default page;
