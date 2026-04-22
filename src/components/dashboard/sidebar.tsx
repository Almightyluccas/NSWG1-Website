"use client";

import { useState, useEffect } from "react";
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
  ShieldUser,
  Crosshair,
  Menu,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { UserRole } from "@/types/database";

const COLLAPSE_KEY = "sidebar-collapsed";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Operations", href: "/dashboard/operations", icon: Crosshair },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Roster", href: "/dashboard/perscom/roster", icon: Users },
  { label: "Forms", href: "/dashboard/forms", icon: ClipboardList },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
];

function SidebarContent({
  collapsed,
  onCollapseToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onCollapseToggle?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore storage access issues
    }
    try {
      await signOut({ callbackUrl: "/" });
    } catch {
      window.location.href = "/api/auth/signout?callbackUrl=%2F";
    }
  };

  const isAdmin = [UserRole.admin, UserRole.superAdmin, UserRole.instructor].some(
    (role) => session?.user?.roles?.includes(role),
  );

  return (
    <>
      {onCollapseToggle && (
        <button
          onClick={onCollapseToggle}
          className={cn(
            "absolute -right-3 top-7 z-10 h-6 w-6 rounded-full",
            "bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700",
            "hidden md:flex md:items-center md:justify-center",
            "hover:bg-accent/20 hover:border-accent/40 transition-colors"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
          )}
        </button>
      )}

      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center gap-3">
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
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              <span className="text-accent">NSWG</span>1
            </h2>
            <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Operations Hub
            </p>
          </div>
        )}
      </div>

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
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-accent/10 text-accent border-l-2 border-accent"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-accent hover:bg-accent/5 border-l-2 border-transparent hover:border-accent/40"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-accent"
                        : "text-zinc-400 dark:text-zinc-500 group-hover:text-accent"
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

          <li className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800/60">
            <Link
              href="/dashboard/settings"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                pathname === "/dashboard/settings"
                  ? "bg-accent/10 text-accent border-l-2 border-accent"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-accent hover:bg-accent/5 border-l-2 border-transparent hover:border-accent/40"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-accent" />
              {!collapsed && (
                <span className="font-mono text-xs uppercase tracking-widest">
                  Settings
                </span>
              )}
            </Link>
          </li>

          {isAdmin && (
            <>
              <li>
                <Link
                  href="/admin"
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                    pathname === "/admin"
                      ? "bg-accent/10 text-accent border-l-2 border-accent"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-accent hover:bg-accent/5 border-l-2 border-transparent hover:border-accent/40"
                  )}
                  title={collapsed ? "Admin Panel" : undefined}
                >
                  <ShieldUser className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    pathname === "/admin" ? "text-accent" : "text-zinc-400 dark:text-zinc-500 group-hover:text-accent"
                  )} />
                  {!collapsed && (
                    <span className="font-mono text-xs uppercase tracking-widest">
                      Admin Panel
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/operations/management"
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                    pathname.startsWith("/dashboard/operations/management")
                      ? "bg-accent/10 text-accent border-l-2 border-accent"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-accent hover:bg-accent/5 border-l-2 border-transparent hover:border-accent/40"
                  )}
                  title={collapsed ? "Op Management" : undefined}
                >
                  <ClipboardList className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    pathname.startsWith("/dashboard/operations/management") ? "text-accent" : "text-zinc-400 dark:text-zinc-500 group-hover:text-accent"
                  )} />
                  {!collapsed && (
                    <span className="font-mono text-xs uppercase tracking-widest">
                      Op Management
                    </span>
                  )}
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800/80 p-3 relative z-20">
        <div
          className={cn(
            "flex",
            collapsed
              ? "flex-col items-center gap-3"
              : "flex-row items-center gap-3"
          )}
        >
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate uppercase tracking-wider">
                {session?.user?.name || "OPERATOR"}
              </p>
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 truncate">
                {session?.user?.roles?.includes(UserRole.member) ? "MEMBER" : "GUEST"}
              </p>
            </div>
          )}
          <div
            className={cn(
              "flex items-center",
              collapsed ? "flex-col gap-2" : "flex-row gap-2 shrink-0"
            )}
          >
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-500 dark:hover:text-red-400 text-zinc-400 dark:text-zinc-500 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, String(!prev));
      return !prev;
    });
  };

  return (
    <div
      className={cn(
        "relative h-screen hidden md:flex flex-col",
        "bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80",
        "transition-all duration-300 shrink-0",
        collapsed ? "w-[68px]" : "w-56"
      )}
    >
      <SidebarContent
        collapsed={collapsed}
        onCollapseToggle={toggleCollapsed}
      />
    </div>
  );
}

export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 w-56 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors z-10"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>

            <SidebarContent
              collapsed={false}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
