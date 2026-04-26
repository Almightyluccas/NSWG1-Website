import { getAuthSession } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { perscom } from "@/lib/perscom/api";
import { createUrlProfilePicture } from "@/app/dashboard/perscom/user/[id]/action";
import { database } from "@/database";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.perscomId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-6">
        <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-sm max-w-lg">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4 uppercase tracking-wider">
            Account Not Linked
          </h2>
          <p className="text-zinc-400 leading-relaxed text-sm mb-6">
            Your Discord account has not been linked to a PERSCOM profile yet.
            Please contact an administrator or designated personnel to complete
            your registration.
          </p>
          <div className="text-xs text-zinc-600 uppercase tracking-widest font-mono">
            ACCESS DENIED - NODE_5.2
          </div>
        </div>
      </div>
    );
  }

  const perscomId = session.user.perscomId;

  const allUsers = await perscom.get.users();
  const allRanks = await perscom.get.ranks();

  const user = allUsers.find((u) => u.id === Number(perscomId));

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-zinc-100">
            Profile Not Found
          </h2>
          <p className="mt-2 text-zinc-400">
            Unable to load your profile data. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  // Resolve profile picture
  const userProfilePicture = await database.get.userProfilePictureByPerscomId(
    user.id
  );
  if (!userProfilePicture?.includes("https")) {
    user.profile_photo_url = await createUrlProfilePicture(userProfilePicture!);
  } else {
    user.profile_photo_url = userProfilePicture!;
  }

  const rankImage = user.rank
    ? {
        id: user.rank.id,
        imageUrl:
          allRanks.find((rank) => rank.id === user.rank?.id)?.image
            ?.image_url || null,
        name: user.rank.name,
      }
    : null;

  return (
    <DashboardContent
      user={user}
      rankImage={rankImage}
      currentUserId={session.user.id!}
    />
  );
}
