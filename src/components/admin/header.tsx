"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, LogOut, Settings, User, Menu, Bell } from "lucide-react"
import {signOut, useSession} from "next-auth/react";

interface HeaderProps {
  onToggleSidebar?: () => void
}

export function AdminHeader({ onToggleSidebar }: HeaderProps) {
  const { data: session} = useSession();
  const [notifications] = useState(3) // Mock notification count


  return (
    <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 h-16 flex items-center px-6 sticky top-0 z-10">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link href="/" className="flex items-center gap-2 text-accent hover:text-accent-darker transition-colors">
            <Home className="h-5 w-5" />
            <span className="font-medium hidden sm:inline">Return to Main Site</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">New Enlistment Application</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">J. Smith submitted an application</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">10 minutes ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">Leave of Absence Request</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">M. Johnson requested leave</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">1 hour ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">New User Registered</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">T. Williams joined the platform</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">3 hours ago</span>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center font-medium text-accent">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || "/placeholder.svg"} alt={session?.user?.name || "User"} />
                  <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-gray-500 dark:text-zinc-400">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={ () => signOut() } className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
