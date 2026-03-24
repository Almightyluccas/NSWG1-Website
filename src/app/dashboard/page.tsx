import { getAuthSession } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import {
  AssignmentRecord,
  Award,
  PerscomUserResponse,
  Qualification,
  Rank,
} from "@/types/api/perscomApi";
import { perscom } from "@/lib/perscom/api";
import { database } from "@/database";
import { createUrlProfilePicture } from "@/app/perscom/user/[id]/action";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.perscomId) {
    redirect("/login");
  }

  const perscomId = session.user.perscomId;

  const allUsers: PerscomUserResponse[] = await perscom.get.users();
  const allAwards: Award[] = await perscom.get.awards();
  const allRanks: Rank[] = await perscom.get.ranks();
  const allQualifications: Qualification[] = await perscom.get.qualifications();
  const allAssignments: AssignmentRecord[] = await perscom.get.assignments();

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
    user.profile_photo_url = await createUrlProfilePicture(
      userProfilePicture!
    );
  } else {
    user.profile_photo_url = userProfilePicture!;
  }

  // Build data
  const awardImages = user.award_records
    ? allAwards
        .filter((award) =>
          user.award_records?.some((record) => record.award_id === award.id)
        )
        .map((award) => ({
          id: award.id,
          imageUrl: award.image?.image_url || null,
          name: award.name,
        }))
    : [];

  const rankImage = user.rank
    ? {
        id: user.rank.id,
        imageUrl:
          allRanks.find((rank) => rank.id === user.rank?.id)?.image
            ?.image_url || null,
        name: user.rank.name,
      }
    : null;

  const qualificationData = user.qualification_records
    ? allQualifications
        .filter((q) =>
          user.qualification_records?.some(
            (record) => record.qualification_id === q.id
          )
        )
        .map((q) => ({
          id: q.id,
          name: q.name,
          received: new Date(q.created_at).toLocaleDateString(),
        }))
    : [];

  const rankHistory = user.rank_records
    ? user.rank_records.map((record) => {
        const rank = allRanks.find((r) => r.id === record.rank_id);
        return {
          id: record.rank_id,
          recordId: record.id,
          imageUrl: rank?.image?.image_url || null,
          name: rank?.name || `Unknown Rank (ID: ${record.rank_id})`,
          date: new Date(record.created_at).toLocaleDateString(),
          text: record.text || "",
        };
      })
    : [];

  const assignmentHistory = user.assignment_records
    ? user.assignment_records.map((record) => {
        const unit = allAssignments.find((a) => a.unit_id === record.unit_id)
          ?.unit || { name: `Unknown Unit (ID: ${record.unit_id})` };
        const position = allAssignments.find(
          (a) => a.position_id === record.position_id
        )?.position || {
          name: `Unknown Position (ID: ${record.position_id})`,
        };
        return {
          id: record.id,
          unitId: record.unit_id,
          positionId: record.position_id,
          unitName: unit.name,
          positionName: position.name,
          date: new Date(record.created_at).toLocaleDateString(),
          text: record.text || "",
          type: record.type,
        };
      })
    : [];

  const combatHistory = user.combat_records
    ? user.combat_records.map((record) => ({
        id: record.id,
        date: new Date(record.created_at).toLocaleDateString(),
        text: record.text || "",
        author: record.author_id,
        documentParsed: record.document_parsed,
      }))
    : [];

  return (
    <DashboardContent
      user={user}
      awardImages={awardImages}
      rankImage={rankImage}
      qualificationData={qualificationData}
      rankHistory={rankHistory}
      assignmentHistory={assignmentHistory}
      combatHistory={combatHistory}
    />
  );
}
