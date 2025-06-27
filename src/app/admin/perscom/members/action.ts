"use server"
import { perscom } from '@/lib/perscom/api'
import {
  Award, CreateAssignmentRecord,
  CreateAwardRecord,
  CreateCombatRecord, CreateQualificationRecord,
  CreateRankRecord,
  Position,
  Qualification,
  Rank,
  Unit
} from "@/types/perscomApi";

export interface UpdateMemberData {
  units: Unit[]
  positions: Position[]
  ranks: Rank[]
  awards: Award[]
  qualifications: Qualification[]
}

type UpdateMemberPayload =
  | { type: 'award', data: CreateAwardRecord }
  | { type: 'combat', data: CreateCombatRecord }
  | { type: 'rank', data: CreateRankRecord }
  | { type: 'assignment', data: CreateAssignmentRecord }
  | { type: 'qualification', data: CreateQualificationRecord }
  | { type: 'unit', data: any };

export async function fetchMemberUpdateData(): Promise<UpdateMemberData> {
  try {

    const units: Unit[] = await perscom.get.units()
    const positions: Position[] = await perscom.get.positions()
    const ranks: Rank[] = await perscom.get.ranks()
    const awards: Award[] = await perscom.get.awards()
    const qualifications: Qualification[] = await perscom.get.qualifications()

    return { units, positions, ranks, awards, qualifications }
  } catch (error) {
    console.error('Failed to fetch member update data:', error)
    throw new Error('Failed to fetch required data')
  }
}

export async function updateMember(payload: UpdateMemberPayload): Promise<void> {
  switch (payload.type) {
    case 'award':
      await perscom.post.userAward(payload.data.award);
      break
    case 'combat':
      await perscom.post.userCombatRecord(payload.data.combat);

      break
    case 'rank':
      await perscom.post.userRankRecord(payload.data.rank);

      break
    case 'assignment':
      await perscom.post.userAssignment(payload.data.assignment);

      break
    case 'qualification':
      await perscom.post.userQualification(payload.data.qualification);

      break
    case 'unit':
      //TODO: Implement unit update.

      break
  }



}