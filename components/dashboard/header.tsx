"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, User, LogOut, Settings, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  user: User;
  business: { id: string; name: string };
}

export function DashboardHeader({ user, business }: DashboardHeaderProps) {
  const router = useRouter();
  const firstName = user.user_metadata?.first_name ?? user.email?.split("@")[0] ?? "User";
  const lastName = user.user_metadata?.last_name ?? "";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-16 border-b border-border bg-white dark:bg-gray-900 flex items-center gap-4 px-6 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-xs hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-9 h-9 bg-gray-50 dark:bg-gray-800 border-border/50 focus-visible:ring-brand-500/30 text-sm"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative w-9 h-9">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs gradient-brand text-white">
                {getInitials(firstName, lastName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
              {firstName}
            </span>
            <ChevronsUpDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-0.5">
              <p className="font-semibold text-sm">{firstName} {lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
