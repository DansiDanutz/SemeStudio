"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Search,
  PenTool,
  Palette,
  TrendingUp,
  BarChart3,
  Upload,
  Scissors,
  Settings,
} from "lucide-react";
import { CreditsBadge } from "./CreditsBadge";

const WORKSPACE_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/research", icon: Search, label: "Research" },
  { href: "/scripts", icon: PenTool, label: "Scripts" },
  { href: "/thumbnails", icon: Palette, label: "Thumbnails" },
  { href: "/seo", icon: TrendingUp, label: "SEO" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/upload", icon: Upload, label: "Upload Queue" },
  { href: "/shorts", icon: Scissors, label: "Shorts Factory" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-[#1a1a1a]">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-[#FF0000] flex items-center justify-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-[#FAFAFA] tracking-tight">SemeStudio</span>
        </Link>

        <Select defaultValue="main">
          <SelectTrigger className="h-9 border-[#222] bg-[#111] text-[#FAFAFA] text-sm">
            <SelectValue placeholder="Select channel" />
          </SelectTrigger>
          <SelectContent className="border-[#222] bg-[#111] text-[#FAFAFA]">
            <SelectItem value="main">SemeBitcoin</SelectItem>
            <SelectItem value="second">Tech Reviews</SelectItem>
            <SelectItem value="add">+ Add Channel</SelectItem>
          </SelectContent>
        </Select>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-[#52525B] font-semibold px-3">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {WORKSPACE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className="data-[active=true]:bg-[#161616] data-[active=true]:text-[#FAFAFA] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111]"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        <CreditsBadge remaining={45} total={100} />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/settings" />}
              isActive={pathname.startsWith("/settings")}
              className="data-[active=true]:bg-[#161616] data-[active=true]:text-[#FAFAFA] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111]"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#7C3AED] text-white text-xs font-bold">
              DS
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#FAFAFA] truncate">Dan Semenescu</p>
            <p className="text-xs text-[#52525B] truncate">Pro Plan</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
