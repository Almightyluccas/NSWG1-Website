"use server"
import { perscom } from '@/lib/perscom/api'
import { Award, Position, Qualification, Rank, Unit } from "@/types/perscomApi";

export interface UpdateMemberData {
  units: Unit[]
  positions: Position[]
  ranks: Rank[]
  awards: Award[]
  qualifications: Qualification[]
}

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