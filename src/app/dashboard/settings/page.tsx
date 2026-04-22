"use server";

import { SettingsClient } from "./settings-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          Settings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Manage your account settings and website preferences
        </p>
      </div>
      <SettingsClient user={session.user} />
    </div>
  );
}
