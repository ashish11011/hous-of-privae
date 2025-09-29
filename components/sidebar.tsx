"use client";
import React from "react";

import {
  BoxesIcon,
  ChartNoAxesGanttIcon,
  ContactIcon,
  Home,
  MailCheckIcon,
  MessageSquareCodeIcon,
  UserRoundIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "./ui/button";

// Menu items.
const items = [
  {
    title: "Products",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: BoxesIcon,
  },
  // {
  //   title: "Users",
  //   url: "/admin/users",
  //   icon: UserRoundIcon,
  // },
  // {
  //   title: "Review",
  //   url: "/admin/review",
  //   icon: MessageSquareCodeIcon,
  // },
  {
    title: "Contacts",
    url: "/admin/contacts",
    icon: ContactIcon,
  },
  {
    title: "Blog",
    url: "/admin/blog",
    icon: ChartNoAxesGanttIcon,
  },
  // {
  //   title: "Subscriptions",
  //   url: "/admin/subscriptions",
  //   icon: MailCheckIcon,
  // },
];

const SidebarAdmin = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant={"destructive"} size={"sm"}>
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarAdmin;
