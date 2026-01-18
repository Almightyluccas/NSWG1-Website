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
import type { PerscomClient } from "./PerscomClient";

export class PerscomGet {
  constructor(private client: PerscomClient) { }
  private async fetchPaginated<T>(
    endpoint: string,
    includes?: string[],
    options?: RequestInit
  ): Promise<T[]> {
    try {
      const includeQuery = includes?.length
        ? `?include=${includes.join(",")}`
        : "";
      const timeBucket = Math.floor(Date.now() / (1000 * 1800));
      const cacheBuster = `&_t=${timeBucket}`;

      const response = await this.client.fetch<PaginatedResponse<T>>(
        `${endpoint}${includeQuery}${cacheBuster}`,
        { method: "GET", ...options }
      );

      if (!response?.meta?.last_page) {
        return response.data || [];
      }

      const allPages = await Promise.all(
        Array.from({ length: response.meta.last_page }, (_, i) => i + 1).map(
          async (page) => {
            if (page === 1) return { data: [] };
            const pageParam = includeQuery ? `&page=${page}` : `?page=${page}`;
            return await this.client.fetch<PaginatedResponse<T>>(
              `${endpoint}${includeQuery}${pageParam}${cacheBuster}`,
              { method: "GET", ...options }
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
      "assignment_records",
      "attachments",
      "award_records",
      "combat_records",
      "fields",
      "position",
      "primary_assignment_records",
      "qualification_records",
      "rank",
      "rank_records",
      "secondary_assignment_records",
      "service_records",
      "specialty",
      "status",
      "unit",
    ];
    return this.fetchPaginated<PerscomUserResponse>("/users", includes, {
      next: { revalidate: 1800 },
    });
  }

  async applications(): Promise<ApplicationData[]> {
    return this.fetchPaginated<ApplicationData>("/submissions", ["statuses"], {
      cache: "no-store",
    });
  }

  async ranks(): Promise<Rank[]> {
    return this.fetchPaginated<Rank>("/ranks", ["image"], {
      cache: "no-store",
    });
  }

  async units(): Promise<Unit[]> {
    return this.fetchPaginated<Unit>("/units", [], {
      next: { revalidate: 3600 },
    });
  }

  async positions(): Promise<Position[]> {
    return this.fetchPaginated<Position>("/positions", [], {
      next: { revalidate: 3600 },
    });
  }

  async awards(): Promise<Award[]> {
    return this.fetchPaginated<Award>("/awards", ["image"], {
      cache: "no-store",
    });
  }

  async combatRecords(): Promise<CombatRecord[]> {
    return this.fetchPaginated<CombatRecord>("/combat_records", ["image"], {
      cache: "no-store",
    });
  }

  async assignments(): Promise<AssignmentRecord[]> {
    const includes = [
      "author",
      "position",
      "specialty",
      "status",
      "unit",
      "user",
      "document",
    ];
    return this.fetchPaginated<AssignmentRecord>(
      "/assignment-records",
      includes,
      { cache: "no-store" }
    );
  }

  async qualifications(): Promise<Qualification[]> {
    return this.fetchPaginated<Qualification>("/qualifications", ["image"], {
      cache: "no-store",
    });
  }
}
