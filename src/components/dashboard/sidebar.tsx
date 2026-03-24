"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  ShieldUser,
  Crosshair,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Operations", href: "/operations", icon: Crosshair },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Roster", href: "/perscom/roster", icon: Users },
  { label: "Forms", href: "/forms", icon: ClipboardList },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    sessionStorage.clear();
    await signOut({ callbackUrl: "/" });
  };

  const isAdmin = ["admin", "superAdmin", "instructor"].some((role) =>
    session?.user?.roles?.includes(role)
  );

  return (
    <div
      className={cn(
        "relative h-screen flex flex-col bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 shrink-0",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 z-10 h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-accent/20 hover:border-accent/40 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-zinc-400" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-zinc-400" />
        )}
      </button>

      {/* Logo / Branding */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center gap-3">
        <div className="w-9 h-9 shrink-0">
          <Image
            src="/images/nswg1-emblem.png"
            alt="NSWG1"
            width={36}
            height={36}
            className="object-contain"
          />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
              <span className="text-accent">NSWG</span>1
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Operations Hub
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-accent/10 text-accent border-l-2 border-accent"
                      : "text-zinc-400 hover:text-accent hover:bg-accent/5 border-l-2 border-transparent hover:border-accent/40"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-accent"
                        : "text-zinc-500 group-hover:text-accent"
                    )}
                  />
                  {!collapsed && (
                    <span className="font-mono text-xs uppercase tracking-widest">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}

          {/* Settings */}
          <li className="pt-4 mt-4 border-t border-zinc-800/60">
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                pathname === "/settings"
                  ? "bg-accent/10 text-accent border-l-2 border-accent"
                  : "text-zinc-400 hover:text-accent hover:bg-accent/5 border-l-2 border-transparent hover:border-accent/40"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-accent" />
              {!collapsed && (
                <span className="font-mono text-xs uppercase tracking-widest">
                  Settings
                </span>
              )}
            </Link>
          </li>

          {/* Admin Link (conditionally shown) */}
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  "text-zinc-400 hover:text-accent hover:bg-accent/5 border-l-2 border-transparent hover:border-accent/40"
                )}
                title={collapsed ? "Admin Panel" : undefined}
              >
                <ShieldUser className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-accent" />
                {!collapsed && (
                  <span className="font-mono text-xs uppercase tracking-widest">
                    Admin Panel
                  </span>
                )}
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="border-t border-zinc-800/80 p-3">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-zinc-300 truncate uppercase tracking-wider">
                {session?.user?.name || "OPERATOR"}
              </p>
              <p className="text-[10px] font-mono text-zinc-600 truncate">
                {session?.user?.roles?.includes("member") ? "MEMBER" : "GUEST"}
              </p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="p-2 rounded-sm hover:bg-red-950/40 hover:text-red-400 text-zinc-500 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
