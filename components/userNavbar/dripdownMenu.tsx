"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Signout } from "@/src/hepler/auth";
import {
  CirclePoundSterling,
  Heart,
  ShoppingCart,
  User,
  UserCircle,
  UserIcon,
} from "lucide-react";
import Link from "next/link";

export function NavBarDropdown({ userName }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className=" cursor-pointer rounded-md duration-200 py-1 px-2 flex items-center gap-1.5">
          {/* <Button variant={"outline"}>{userName}</Button> */}

          <UserCircle />
          <p className=" capitalize hidden md:block line-clamp-1">
            {userName?.split(" ")[0] || "You"}
          </p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 mr-2" align="start">
        {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className=" hover:bg-gray-50 py-2.5">
              <User />
              Profile
            </Link>
            {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/orders" className=" hover:bg-gray-50 py-2.5">
              <ShoppingCart />
              Orders
            </Link>
            {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-wishlist" className=" hover:bg-gray-50 py-2.5">
              <Heart />
              <p> My wishlist</p>
            </Link>
            {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/loyalty-points" className=" hover:bg-gray-50 py-2.5">
              <CirclePoundSterling />
              <p>Loyalty Points</p>
            </Link>
            {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            Cart */}
          {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
          {/* </DropdownMenuItem> */}
          {/* <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        {/* <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button onClick={Signout} variant={"destructive"} className=" w-full">
            Log out{" "}
          </Button>

          {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
