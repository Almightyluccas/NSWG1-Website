"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, UserPlus, ShieldUser, ChevronDown } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { UserRole } from "@/types/database";

interface UserMenuProps {
  onJoinClickAction: () => void;
}

export function UserMenu({ onJoinClickAction }: UserMenuProps) {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    sessionStorage.clear();

    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {(!session || session?.user?.roles.includes(UserRole.guest)) && (
          <Button
            onClick={onJoinClickAction}
            className="bg-accent hover:bg-accent-darker text-black hidden md:flex"
          >
            Join Now
          </Button>
        )}

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-transparent hover:border-zinc-700/60 hover:bg-zinc-800/50 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-accent">
                <span className="font-mono text-xs text-zinc-300 uppercase tracking-widest">
                  {session.user?.name || "UNKNOWN_USER"}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{session.user?.name}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link
                href={`/dashboard/perscom/user/${session.user.perscomId}`}
                className="w-full"
              >
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>

              {[
                UserRole.admin,
                UserRole.superAdmin,
                UserRole.instructor,
              ].some((role) => session.user.roles.includes(role)) && (
                <Link href="/admin" className="w-full">
                  <DropdownMenuItem>
                    <ShieldUser className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                </Link>
              )}
              <Link href="/dashboard/settings" className="w-full">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              {session.user.roles.includes(UserRole.guest) && (
                <DropdownMenuItem onClick={onJoinClickAction}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Apply to Join</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              className="border-gray-300 dark:border-zinc-700"
            >
              Login with Discord
            </Button>
          </Link>
        )}
      </div>
    </>
  );
}
