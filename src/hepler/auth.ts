import { signOut } from "next-auth/react";

export function Signout() {
  signOut({ callbackUrl: "/auth/login" });
}
