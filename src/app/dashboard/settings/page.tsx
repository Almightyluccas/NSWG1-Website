"use server";

import { SettingsClient } from "./settings-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { database } from "@/database";
import { CustomHeroImages } from "@/types/database";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const customHeroImages: CustomHeroImages[] =
    await database.get.userCustomHeroImages(session.user.id!);
  customHeroImages.forEach((image) => {
    if (
      image.url &&
      !image.url.startsWith("http") &&
      process.env.OCI_BACKGROUND_PAR_URL
    ) {
      image.url = process.env.OCI_BACKGROUND_PAR_URL + image.url;
    }
    return image;
  });

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
      <SettingsClient user={session.user} customHeroImages={customHeroImages} />
    </div>
  );
}
