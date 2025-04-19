"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {signOut, useSession} from "next-auth/react";

interface UserMenuProps {
  onJoinClickAction: () => void
}

export function UserMenu({ onJoinClickAction }: UserMenuProps) {
  const {data: session} = useSession();


  return (
    <>
      <div className="flex items-center gap-4">
        <Button onClick={onJoinClickAction} className="bg-accent hover:bg-accent-darker text-black hidden md:flex">
          Join Now
        </Button>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image src={session.user?.image || "/placeholder.svg"} alt={session.user?.name || 'empty'} fill className="object-cover" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>
                    {session.user?.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400">
                    {/*{user.roles.map((role) => role.charAt(0).toUpperCase() + role.slice(1)).join(", ")}*/}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              {/*{!hasRole("member") && (*/}
              {/*  <DropdownMenuItem onClick={onJoinClickAction}>*/}
              {/*    <UserPlus className="mr-2 h-4 w-4" />*/}
              {/*    <span>Apply to Join</span>*/}
              {/*  </DropdownMenuItem>*/}
              {/*)}*/}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button variant="outline" className="border-gray-300 dark:border-zinc-700">
              Login with Discord
            </Button>
          </Link>
        )}
      </div>
    </>
  )
}
