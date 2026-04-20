import {
  PaginatedResponse,
  PerscomUserResponse,
  Rank,
  Unit,
  Position,
  ApplicationData,
  Award,
  CombatRecord,
  AssignmentRecord,
  Qualification,
} from "@/types/api/perscomApi";
import { PERSCOM_DATA_TAG } from "@/lib/perscom/cache-tags";
import type { PerscomClient } from "./PerscomClient";

/** Laravel-style pagination; higher page size = fewer HTTP round-trips for roster-style loads. */
const PERSCOM_PAGE_SIZE = 100;

/** Default Perscom list cache (Next.js Data Cache / ISR). */
const PERSCOM_DEFAULT_REVALIDATE_SEC = 1800;

/** Enlistment submissions change more often; shorter TTL on `/submissions`. */
const PERSCOM_SUBMISSIONS_REVALIDATE_SEC = 300;

export class PerscomGet {
  constructor(private client: PerscomClient) { }

  private async fetchPaginated<T>(
    endpoint: string,
    includes?: string[],
    options?: RequestInit & { next?: NextFetchRequestConfig }
  ): Promise<T[]> {
    try {
      const timeBucket = Math.floor(Date.now() / (1000 * 1800));

      const buildQuery = (page?: number) => {
        const params = new URLSearchParams();
        if (includes?.length) params.set("include", includes.join(","));
        params.set("per_page", String(PERSCOM_PAGE_SIZE));
        params.set("_t", String(timeBucket));
        if (page != null && page > 1) params.set("page", String(page));
        return `?${params.toString()}`;
      };

      const mergedOptions =
        options ?? {
          cache: "force-cache",
          next: {
            revalidate: PERSCOM_DEFAULT_REVALIDATE_SEC,
            tags: [PERSCOM_DATA_TAG],
          },
        };

      const finalOptions: RequestInit & { next?: NextFetchRequestConfig } = {
        method: "GET",
        ...mergedOptions,
        next: {
          tags: [PERSCOM_DATA_TAG],
          ...mergedOptions.next,
        },
      };

      const response = await this.client.fetch<PaginatedResponse<T>>(
        `${endpoint}${buildQuery()}`,
        finalOptions
      );

      if (!response?.meta?.last_page) {
        return response.data || [];
      }

      const allPages = await Promise.all(
        Array.from({ length: response.meta.last_page }, (_, i) => i + 1).map(
          async (page) => {
            if (page === 1) return { data: [] };
            return await this.client.fetch<PaginatedResponse<T>>(
              `${endpoint}${buildQuery(page)}`,
              finalOptions
            );
          }
        )
      );

      const restOfData = allPages.flatMap((p) => p.data || []);
      return [...(response.data || []), ...restOfData];
    } catch (error) {
      console.error(`Failed to fetch data from ${endpoint}:`, error);
      return [];
    }
  }

  async users(): Promise<PerscomUserResponse[]> {
    const includes = [
      "assignment_records", "attachments", "award_records", "combat_records",
      "fields", "position", "primary_assignment_records", "qualification_records",
      "rank", "rank_records", "secondary_assignment_records", "service_records",
      "specialty", "status", "unit",
    ];
    return this.fetchPaginated<PerscomUserResponse>("/users", includes);
  }

  async applications(): Promise<ApplicationData[]> {
    return this.fetchPaginated<ApplicationData>("/submissions", ["statuses"], {
      cache: "force-cache",
      next: { revalidate: PERSCOM_SUBMISSIONS_REVALIDATE_SEC },
    });
  }

  async ranks(): Promise<Rank[]> {
    return this.fetchPaginated<Rank>("/ranks", ["image"]);
  }

  async units(): Promise<Unit[]> {
    return this.fetchPaginated<Unit>("/units", []);
  }

  async positions(): Promise<Position[]> {
    return this.fetchPaginated<Position>("/positions", []);
  }

  async awards(): Promise<Award[]> {
    return this.fetchPaginated<Award>("/awards", ["image"]);
  }

  async combatRecords(): Promise<CombatRecord[]> {
    return this.fetchPaginated<CombatRecord>("/combat_records", ["image"]);
  }

  async assignments(): Promise<AssignmentRecord[]> {
    const includes = [
      "author", "position", "specialty", "status",
      "unit", "user", "document",
    ];
    return this.fetchPaginated<AssignmentRecord>("/assignment-records", includes);
  }

  async qualifications(): Promise<Qualification[]> {
    return this.fetchPaginated<Qualification>("/qualifications", ["image"]);
  }
}
