"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Bell, Settings, LogOut, User } from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-[#1a1a1a] bg-[#080808]/90 backdrop-blur-xl px-4">
      <SidebarTrigger className="text-[#A1A1AA] hover:text-[#FAFAFA]" />

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B]" />
        <Input
          placeholder="Search videos, scripts, topics..."
          className="h-9 pl-9 border-[#222] bg-[#111] text-[#FAFAFA] placeholder:text-[#52525B] text-sm focus:border-[#2a2a2a]"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-[#52525B] hover:text-[#FAFAFA] hover:bg-[#161616] relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF0000]" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-[#161616]" />}
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-[#7C3AED] text-white text-xs font-bold">
                DS
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-[#A1A1AA] hidden sm:inline">Dan S.</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 border-[#222] bg-[#111] text-[#FAFAFA]"
          >
            <DropdownMenuItem className="focus:bg-[#161616]" render={<Link href="/settings" />}>
              <User className="mr-2 h-4 w-4 text-[#52525B]" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#161616]" render={<Link href="/settings" />}>
              <Settings className="mr-2 h-4 w-4 text-[#52525B]" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#222]" />
            <DropdownMenuItem className="focus:bg-[#161616] text-[#EF4444]">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
