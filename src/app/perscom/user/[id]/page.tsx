import Link from "next/link"
import { UserProfile } from "./user-profile.client";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { UserRole } from "@/types/database";
import { AssignmentRecord, Award, PerscomUserResponse, Qualification, Rank } from "@/types/perscomApi";
import { perscom } from "@/lib/perscom/api";

interface UserProfilePageProps {
  params: Promise<{ id: string }>

}
//TODO: Load only what is first seen first so it opens faster then load rest in background.

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;
  const allUsers: PerscomUserResponse[] = await perscom.get.users();
  const allAwards: Award[] = await perscom.get.awards();
  const allRanks: Rank[] = await perscom.get.ranks();
  const allQualifications: Qualification[] = await perscom.get.qualifications();
  const allAssignments: AssignmentRecord[] = await perscom.get.assignments();
  // const allCombatRecords: BaseRecord[] = await getCombatRecords();
  const user = allUsers.find(user => user.id.toString() === id);

  const awardImages = user?.award_records
    ? allAwards
      .filter(award => user.award_records?.some(record => record.award_id === award.id))
      .map(award => ({
        id: award.id,
        imageUrl: award.image?.image_url || null,
        name: award.name,
      }))
    : [];
  const rankImage = user?.rank
    ? {
      id: user.rank.id,
      imageUrl: allRanks.find(rank => rank.id === user.rank?.id)?.image?.image_url || null,
      name: user.rank.name,
    }
    : null;

  const qualificationData = user?.qualification_records
    ? allQualifications
      .filter(qualification => user.qualification_records?.some(record => record.qualification_id === qualification.id))
      .map(qualification => ({
        id: qualification.id,
        name: qualification.name,
        received: new Date(qualification.created_at).toLocaleDateString()
      }))
    : [];
  const rankHistory = user?.rank_records
    ? user.rank_records.map(record => {
      const rank = allRanks.find(r => r.id === record.rank_id);
      return {
        id: record.rank_id,
        recordId: record.id,
        imageUrl: rank?.image?.image_url || null,
        name: rank?.name || `Unknown Rank (ID: ${record.rank_id})`,
        date: new Date(record.created_at).toLocaleDateString(),
        text: record.text || ""
      };
    })
    : [];

  const assignmentHistory = user?.assignment_records
    ? user.assignment_records.map(record => {
      const unit = allAssignments.find(a => a.unit_id === record.unit_id)?.unit ||
        { name: `Unknown Unit (ID: ${record.unit_id})` };
      const position = allAssignments.find(a => a.position_id === record.position_id)?.position ||
        { name: `Unknown Position (ID: ${record.position_id})` };

      return {
        id: record.id,
        unitId: record.unit_id,
        positionId: record.position_id,
        unitName: unit.name,
        positionName: position.name,
        date: new Date(record.created_at).toLocaleDateString(),
        text: record.text || "",
        type: record.type
      };
    })
    : [];
  const combatHistory = user?.combat_records
    ? user.combat_records.map(record => {
      return {
        id: record.id,
        date: new Date(record.created_at).toLocaleDateString(),
        text: record.text || "",
        author: record.author_id,
        documentParsed: record.document_parsed
      };
    })
    : [];



  if (!user) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <Link
            href="/perscom/roster"
            className="text-accent hover:text-accent-darker transition-colors flex items-center"
          >
            ← Back to Roster
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">User not found</h2>
          <p className="mt-2">The requested user profile could not be found.</p>
        </div>
      </div>
    );
  }
  return (
    <ServerRoleGuard allowedRoles={[UserRole.member]}>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <Link
            href="/perscom/roster"
            className="text-accent hover:text-accent-darker transition-colors flex items-center"
          >
            ← Back to Roster
          </Link>
        </div>
        <UserProfile
          user={user}
          awardImages={awardImages}
          rankImage={rankImage}
          qualificationData={qualificationData}
          rankHistory={rankHistory}
          assignmentHistory={assignmentHistory}
          combatHistory={combatHistory}
        />
      </div>
    </ServerRoleGuard>

  )
}

