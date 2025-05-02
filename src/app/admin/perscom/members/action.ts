'use server'

import { perscom } from "@/lib/perscom/api";

export async function fetchMemberUpdateData() {
  try {
    const [units, positions, ranks, awards] = await Promise.all([
      perscom.get.units(),
      perscom.get.positions(),
      perscom.get.ranks(),
      perscom.get.awards()
    ])

    return {
      units: units,
      positions: positions,
      ranks: ranks,
      awards: awards
    }
  } catch (error) {
    console.error('Failed to fetch member update data:', error)
    throw new Error('Failed to fetch required data')
  }
}