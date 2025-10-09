import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import React from "react";

const page = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="text-red-500">
        You must be logged in <Link href="/login">Login</Link>
      </div>
    );
  }

  return (
    <div>
      only admin
      <br />
      {JSON.stringify(session.user)}
      <br />
      {/* <Button onClick={Signout}>Log out</Button> */}
    </div>
  );
};

export default page;
