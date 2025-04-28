import {
  ApplicationData,
  ApplicationSubmission,
  ApplicationSubmissionResponse,
  CreatePerscomUser,
  PaginatedResponse,
  PerscomUserResponse,
} from "@/types/perscomApi";

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
  const response = await fetch(`${process.env.PERSCOM_API_URL}/submissions?include=statuses`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch applications");

  const initialResponse: PaginatedResponse<ApplicationData> = await response.json();
  const lastPage = initialResponse.meta.last_page;

  const pagePromises: Promise<PaginatedResponse<ApplicationData>>[] = [];
  for (let i = 1; i <= lastPage; i++) {
    const pagePromise = fetch(`${process.env.PERSCOM_API_URL}/submissions?page=${i}&include=statuses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PERSCOM_API_KEY}`,
        "Content-Type": "application/json",
      },
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

//TODO: add caching

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

export const getUsers = async (): Promise<PerscomUserResponse[]> => {
  const urlParameters = `include=assignment_records,attachments,award_records,combat_records,fields,position,primary_assignment_records,qualification_records,rank,rank_records,secondary_assignment_records,service_records,specialty,status,unit`
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
      if (!response.ok) throw new Error(`Failed to fetch applications page ${i}`);
      return response.json() as Promise<PaginatedResponse<PerscomUserResponse>>;
    });
    console.log(pagePromise)
    pagePromises.push(pagePromise);
  }

  const pageResponses = await Promise.all(pagePromises);

  const data: PerscomUserResponse[] = [];
  pageResponses.forEach(pageResponse => {
    data.push(...pageResponse.data);
  });
  return data;
};
