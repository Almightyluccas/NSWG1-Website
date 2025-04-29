import {
  ApplicationData,
  ApplicationSubmission,
  ApplicationSubmissionResponse,
  AssignmentRecord,
  Award,
  CombatRecord,
  CreatePerscomUser,
  PaginatedResponse,
  PerscomUserResponse,
  Qualification,
  Rank
} from "@/types/perscomApi";

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
type CacheKey = 'users' | 'ranks' | 'awards' | 'combatRecords' | 'assignments' | 'qualifications';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheTypes {
  users: PerscomUserResponse[];
  ranks: Rank[];
  awards: Award[];
  combatRecords: CombatRecord[];
  assignments: AssignmentRecord[];
  qualifications: Qualification[];
}

const CACHE: {
  [K in CacheKey]?: CacheEntry<CacheTypes[K]>;
} = {};

export const createPerscomUser = async (data: CreatePerscomUser): Promise<PerscomUserResponse> => {
  const response = await fetch(`${process.env.PERSCOM_API_URL}/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create user");
  }
  return response.json();
}

export const createApplicationSubmission = async (data: ApplicationSubmission): Promise<ApplicationSubmissionResponse> => {
  const response = await fetch(`${process.env.PERSCOM_API_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create application submission");
  }

  return response.json();
}

export const getApplications = async (): Promise<ApplicationData[]> => {
  const timestamp = Date.now();

  const response = await fetch(`${process.env.PERSCOM_API_URL}/submissions?include=statuses&_t=${timestamp}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (!response.ok) throw new Error("Failed to fetch applications");

  const initialResponse: PaginatedResponse<ApplicationData> = await response.json();
  const lastPage = initialResponse.meta.last_page;

  const pagePromises: Promise<PaginatedResponse<ApplicationData>>[] = [];
  for (let i = 1; i <= lastPage; i++) {
    const pagePromise = fetch(`${process.env.PERSCOM_API_URL}/submissions?page=${i}&include=statuses&_t=${timestamp}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
        "Content-Type": "application/json",
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    }).then(response => {
      if (!response.ok) throw new Error(`Failed to fetch applications page ${i}`);
      return response.json() as Promise<PaginatedResponse<ApplicationData>>;
    });
    pagePromises.push(pagePromise);
  }

  const pageResponses = await Promise.all(pagePromises);

  const data: ApplicationData[] = [];
  pageResponses.forEach(pageResponse => {
    data.push(...pageResponse.data);
  });

  return data;
};

export const changeSubmissionStatus = async (applicationId: number, status: 'Denied' | 'Accepted'): Promise<void> => {
  const statusId = status === 'Denied' ? 8 : 7;
  console.log(statusId)
  const response = await fetch(`${process.env.PERSCOM_API_URL}/submissions/${applicationId}/statuses/attach`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resources: {
        [statusId] : {}
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to change submission status", response.status, errorData);
    throw new Error(`Failed to change submission status for: ${response.status} - ${JSON.stringify(errorData)}`);
  }
};

export const changeUserApprovedBoolean = async (approved: boolean, perscomId: number, name: string, email: string): Promise<void> => {
  const response = await fetch(`${process.env.PERSCOM_API_URL}/users/${perscomId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({name: name, email: email, approved: approved}),
  });
  if (!response.ok) throw new Error("Failed to change user approved status");

}

export const getUsers = async (forceRefresh: boolean = false): Promise<PerscomUserResponse[]> => {
  if (!forceRefresh && isCacheValid(CACHE.users)) {
    return CACHE.users!.data;
  }

  const urlParameters = `include=assignment_records,attachments,award_records,combat_records,fields,position,primary_assignment_records,qualification_records,rank,rank_records,secondary_assignment_records,service_records,specialty,status,unit`;
  const response = await fetch(`${process.env.PERSCOM_API_URL}/users?${urlParameters}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch users");

  const initialResponse: PaginatedResponse<PerscomUserResponse> = await response.json();
  const lastPage = initialResponse.meta.last_page;

  const pagePromises: Promise<PaginatedResponse<PerscomUserResponse>>[] = [];
  for (let i = 1; i <= lastPage; i++) {
    const pagePromise = fetch(`${process.env.PERSCOM_API_URL}/users?page=${i}&${urlParameters}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
        "Content-Type": "application/json",
      },
    }).then(response => {
      if (!response.ok) throw new Error(`Failed to fetch users page ${i}`);
      return response.json() as Promise<PaginatedResponse<PerscomUserResponse>>;
    });
    pagePromises.push(pagePromise);
  }

  const pageResponses = await Promise.all(pagePromises);

  const data: PerscomUserResponse[] = [];
  pageResponses.forEach(pageResponse => {
    data.push(...pageResponse.data);
  });

  CACHE.users = {
    data,
    timestamp: Date.now()
  };

  return data;
};

export const getRanks = async (forceRefresh: boolean = false): Promise<Rank[]> => {
  if (!forceRefresh && isCacheValid(CACHE.ranks)) {
    return CACHE.ranks!.data;
  }

  const response = await fetch(`${process.env.PERSCOM_API_URL}/ranks?include=image`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch Ranks");

  const initialResponse: PaginatedResponse<Rank> = await response.json();
  const lastPage = initialResponse.meta.last_page;

  const pagePromises: Promise<PaginatedResponse<Rank>>[] = [];
  for (let i = 1; i <= lastPage; i++) {
    const pagePromise = fetch(`${process.env.PERSCOM_API_URL}/ranks?page=${i}&include=image`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
        "Content-Type": "application/json",
      },
    }).then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ranks page ${i}`);
      return response.json() as Promise<PaginatedResponse<Rank>>;
    });
    pagePromises.push(pagePromise);
  }

  const pageResponses = await Promise.all(pagePromises);

  const data: Rank[] = [];
  pageResponses.forEach(pageResponse => {
    data.push(...pageResponse.data);
  });

  CACHE.ranks = {
    data,
    timestamp: Date.now()
  };

  return data;
};

export const getAwards = async (forceRefresh: boolean = false): Promise<Award[]> => {
  if (!forceRefresh && isCacheValid(CACHE.awards)) {
    return CACHE.awards!.data;
  }

  const response = await fetch(`${process.env.PERSCOM_API_URL}/awards?include=image`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch Ranks");

  const initialResponse: PaginatedResponse<Award> = await response.json();
  const lastPage = initialResponse.meta.last_page;

  const pagePromises: Promise<PaginatedResponse<Award>>[] = [];
  for (let i = 1; i <= lastPage; i++) {
    const pagePromise = fetch(`${process.env.PERSCOM_API_URL}/awards?page=${i}&include=image`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
        "Content-Type": "application/json",
      },
    }).then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ranks page ${i}`);
      return response.json() as Promise<PaginatedResponse<Award>>;
    });
    pagePromises.push(pagePromise);
  }

  const pageResponses = await Promise.all(pagePromises);

  const data: Award[] = [];
  pageResponses.forEach(pageResponse => {
    data.push(...pageResponse.data);
  });

  CACHE.awards = {
    data,
    timestamp: Date.now()
  };

  return data;
}

//TODO: test to see if I need to really cache combat records, qualifictiaons and assingments.

export const getCombatRecords = async (forceRefresh: boolean = false): Promise<CombatRecord[]> => {
  if (!forceRefresh && isCacheValid(CACHE.combatRecords)) {
    return CACHE.combatRecords!.data;
  }

  const response = await fetch(`${process.env.PERSCOM_API_URL}/awards?include=image`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch Ranks");

  const initialResponse: PaginatedResponse<CombatRecord> = await response.json();
  const lastPage = initialResponse.meta.last_page;

  const pagePromises: Promise<PaginatedResponse<CombatRecord>>[] = [];
  for (let i = 1; i <= lastPage; i++) {
    const pagePromise = fetch(`${process.env.PERSCOM_API_URL}/awards?page=${i}&include=image`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
        "Content-Type": "application/json",
      },
    }).then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ranks page ${i}`);
      return response.json() as Promise<PaginatedResponse<CombatRecord>>;
    });
    pagePromises.push(pagePromise);
  }

  const pageResponses = await Promise.all(pagePromises);

  const data: CombatRecord[] = [];
  pageResponses.forEach(pageResponse => {
    data.push(...pageResponse.data);
  });

  CACHE.combatRecords = {
    data,
    timestamp: Date.now()
  };

  return data;
}

export const getAssignments = async (forceRefresh: boolean = false ): Promise<AssignmentRecord[]> => {
  if (!forceRefresh && isCacheValid(CACHE.assignments)) {
    return CACHE.assignments!.data;
  }

  const response = await fetch(`${process.env.PERSCOM_API_URL}/assignment-records?include=author,position,specialty,status,unit,user,document`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch Ranks");

  const initialResponse: PaginatedResponse<AssignmentRecord> = await response.json();
  const lastPage = initialResponse.meta.last_page;

  const pagePromises: Promise<PaginatedResponse<AssignmentRecord>>[] = [];
  for (let i = 1; i <= lastPage; i++) {
    const pagePromise = fetch(`${process.env.PERSCOM_API_URL}/assignment-records?page=${i}&include=author,position,specialty,status,unit,user,document`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
        "Content-Type": "application/json",
      },
    }).then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ranks page ${i}`);
      return response.json() as Promise<PaginatedResponse<AssignmentRecord>>;
    });
    pagePromises.push(pagePromise);
  }

  const pageResponses = await Promise.all(pagePromises);

  const data: AssignmentRecord[] = [];
  pageResponses.forEach(pageResponse => {
    data.push(...pageResponse.data);
  });

  CACHE.assignments = {
    data,
    timestamp: Date.now()
  };

  return data;
}

export const getQualifications = async ( forceRefresh: boolean = false ): Promise<Qualification[]> => {
  if (!forceRefresh && isCacheValid(CACHE.qualifications)) {
    return CACHE.qualifications!.data;
  }

  const response = await fetch(`${process.env.PERSCOM_API_URL}/qualifications?include=image`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch Ranks");

  const initialResponse: PaginatedResponse<Qualification> = await response.json();
  const lastPage = initialResponse.meta.last_page;

  const pagePromises: Promise<PaginatedResponse<Qualification>>[] = [];
  for (let i = 1; i <= lastPage; i++) {
    const pagePromise = fetch(`${process.env.PERSCOM_API_URL}/qualifications?page=${i}&include=image`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
        "Content-Type": "application/json",
      },
    }).then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ranks page ${i}`);
      return response.json() as Promise<PaginatedResponse<Qualification>>;
    });
    pagePromises.push(pagePromise);
  }

  const pageResponses = await Promise.all(pagePromises);

  const data: Qualification[] = [];
  pageResponses.forEach(pageResponse => {
    data.push(...pageResponse.data);
  });

  CACHE.qualifications = {
    data,
    timestamp: Date.now()
  };

  return data;
}

const fetchFunctions: {
  [K in CacheKey]: (forceRefresh: boolean) => Promise<CacheTypes[K]>;
} = {
  users: getUsers,
  ranks: getRanks,
  awards: getAwards,
  combatRecords: () => Promise.reject("Not implemented"),
  assignments: () => Promise.reject("Not implemented"),
  qualifications: () => Promise.reject("Not implemented")
};

const isCacheValid = <T>(cacheEntry: CacheEntry<T> | undefined): boolean => {
  if (!cacheEntry) return false;
  const now = Date.now();
  return now - cacheEntry.timestamp < CACHE_DURATION_MS;
};

export const refreshCache = async (cacheKey?: CacheKey | CacheKey[]): Promise<void> => {
  if (!cacheKey) {
    await Promise.all(Object.entries(fetchFunctions)
      .filter(([, fn]) => fn.toString() !== "() => Promise.reject(\"Not implemented\")")
      .map(([key]) => fetchFunctions[key as CacheKey](true)));
    return;
  }

  if (Array.isArray(cacheKey)) {
    await Promise.all(cacheKey.map(key => {
      if (fetchFunctions[key]) {
        return fetchFunctions[key](true);
      }
      console.warn(`Cache function not implemented for key: ${key}`);
      return Promise.resolve();
    }));
    return;
  }

  if (fetchFunctions[cacheKey]) {
    await fetchFunctions[cacheKey](true);
  } else {
    console.warn(`Unknown cache key: ${cacheKey}`);
  }
};