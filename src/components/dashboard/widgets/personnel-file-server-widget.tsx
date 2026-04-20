import { perscom } from "@/lib/perscom/api";
import { PersonnelFileWidget } from "./personnel-file-widget";
import { Award, Qualification, Rank, AssignmentRecord, PerscomUserResponse } from "@/types/api/perscomApi";

export default async function PersonnelFileServerWidget({ user }: { user: PerscomUserResponse }) {
  const allAwards: Award[] = await perscom.get.awards();
  const allQualifications: Qualification[] = await perscom.get.qualifications();
  const allRanks: Rank[] = await perscom.get.ranks();
  const allAssignments: AssignmentRecord[] = await perscom.get.assignments();

  const awardImages = user.award_records
    ? allAwards
        .filter((award) =>
          user.award_records?.some((record) => record.award_id === award.id)
        )
        .map((award) => ({
          id: award.id,
          imageUrl: award.image?.image_url || null,
          name: award.name,
          order: award.order,
        }))
    : [];

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
    <PersonnelFileWidget
      awardRecords={user.award_records || []}
      awardImages={awardImages}
      qualificationRecords={user.qualification_records || []}
      qualificationData={qualificationData}
      rankHistory={rankHistory}
      assignmentHistory={assignmentHistory}
      combatHistory={combatHistory}
    />
  );
}
