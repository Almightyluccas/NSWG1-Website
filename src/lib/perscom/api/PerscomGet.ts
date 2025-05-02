import {
  PaginatedResponse,
  PerscomUserResponse,
  Rank,
  Unit,
  Position,
  ApplicationData,
  Award, CombatRecord, AssignmentRecord, Qualification
} from '@/types/perscomApi'
import type { PerscomClient } from './PerscomClient'
import { CACHE_DURATION_MS } from './PerscomClient'


export class PerscomGet {
  constructor(
    private client: PerscomClient,
    private cache: Record<string, { data: any; timestamp: number }> = {}
  ) {}

  private isCacheValid(key: string): boolean {
    const entry = this.cache[key]
    if (!entry) return false
    return Date.now() - entry.timestamp < CACHE_DURATION_MS
  }

  private async fetchPaginated<T>(endpoint: string, includes?: string[]): Promise<T[]> {
    try {
      const includeQuery = includes?.length ? `?include=${includes.join(',')}` : ''
      const response = await this.client.fetch<PaginatedResponse<T>>(`${endpoint}${includeQuery}`, { method: 'GET' })

      if (!response?.meta?.last_page) {
        return response.data || []
      }

      const allPages = await Promise.all(
        Array.from({ length: response.meta.last_page }, (_, i) => i + 1).map(async page => {
          try {
            const pageParam = includeQuery ? `&page=${page}` : `?page=${page}`
            return await this.client.fetch<PaginatedResponse<T>>(`${endpoint}${includeQuery}${pageParam}`, { method: 'GET' })
          } catch (error) {
            console.error(`Failed to fetch page ${page} for ${endpoint}:`, error)
            return { data: [] }
          }
        })
      )

      return allPages.flatMap(page => page.data || [])
    } catch (error) {
      console.error(`Failed to fetch data from ${endpoint}:`, error)
      return []
    }
  }

  async users(forceRefresh = false): Promise<PerscomUserResponse[]> {
    if (!forceRefresh && this.isCacheValid('users')) return this.cache.users.data

    const includes = [
      'assignment_records', 'attachments', 'award_records',
      'combat_records', 'fields', 'position', 'primary_assignment_records',
      'qualification_records', 'rank', 'rank_records',
      'secondary_assignment_records', 'service_records', 'specialty',
      'status', 'unit'
    ]

    const data = await this.fetchPaginated<PerscomUserResponse>('/users', includes)
    this.cache.users = { data, timestamp: Date.now() }
    return data
  }

  async applications(forceRefresh = false): Promise<ApplicationData[]> {
    if (!forceRefresh && this.isCacheValid('applications')) return this.cache.applications.data

    const data = await this.fetchPaginated<ApplicationData>('/submissions', ['statuses'])
    this.cache.applications = { data, timestamp: Date.now() }
    return data
  }

  async ranks(forceRefresh = false): Promise<Rank[]> {
    if (!forceRefresh && this.isCacheValid('ranks')) return this.cache.ranks.data

    const data = await this.fetchPaginated<Rank>('/ranks', ['image'])
    this.cache.ranks = { data, timestamp: Date.now() }
    return data
  }

  async units(forceRefresh = false): Promise<Unit[]> {
    if (!forceRefresh && this.isCacheValid('units')) return this.cache.units.data

    const data = await this.fetchPaginated<Unit>('/units')
    this.cache.units = { data, timestamp: Date.now() }
    return data
  }

  async positions(forceRefresh = false): Promise<Position[]> {
    if (!forceRefresh && this.isCacheValid('positions')) return this.cache.positions.data

    const data = await this.fetchPaginated<Position>('/positions')
    this.cache.positions = { data, timestamp: Date.now() }
    return data
  }

  async awards(forceRefresh = false): Promise<Award[]> {
    if (!forceRefresh && this.isCacheValid('awards')) return this.cache.awards.data

    const data = await this.fetchPaginated<Award>('/awards', ['image'])
    this.cache.awards = { data, timestamp: Date.now() }
    return data
  }

  async combatRecords(forceRefresh = false): Promise<CombatRecord[]> {
    if (!forceRefresh && this.isCacheValid('combatRecords')) return this.cache.combatRecords.data

    const data = await this.fetchPaginated<CombatRecord>('/combat_records', ['image'])
    this.cache.combatRecords = { data, timestamp: Date.now() }
    return data
  }

  async assignments(forceRefresh = false): Promise<AssignmentRecord[]> {
    if (!forceRefresh && this.isCacheValid('assignments')) return this.cache.assignments.data

    const includes = [
      "author", "position", "specialty", "status", "unit", "user", "document"
    ]
    const data = await this.fetchPaginated<AssignmentRecord>('/assignment-records', includes)
    this.cache.assignments = { data, timestamp: Date.now() }
    return data
  }

  async qualifications(forceRefresh = false): Promise<Qualification[]> {
    if (!forceRefresh && this.isCacheValid('qualifications')) return this.cache.qualifications.data

    const data = await this.fetchPaginated<Qualification>('/qualifications', ['image'])
    this.cache.qualifications = { data, timestamp: Date.now() }
    return data
  }
}