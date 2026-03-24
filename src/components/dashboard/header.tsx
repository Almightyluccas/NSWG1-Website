"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/alerts": "Alert Center",
  "/calendar": "Calendar",
  "/perscom/roster": "Roster",
  "/forms": "Forms",
  "/documents": "Documents",
  "/settings": "Settings",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const title =
    Object.entries(routeTitles).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] || "Dashboard";

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        <h1 className="text-sm font-mono uppercase tracking-widest text-zinc-100">
          {title}
        </h1>
      </div>

      {/* Right: User info */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-mono text-zinc-300 uppercase tracking-wider">
            {session?.user?.name || "OPERATOR"}
          </p>
        </div>
        <div className="h-8 w-8 rounded-sm border border-zinc-700 overflow-hidden bg-zinc-800">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] font-mono text-zinc-500">
              OP
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
