import {
  PerscomUserResponse,
  CreatePerscomUser,
  CreateApplicationSubmission,
  ApplicationSubmissionResponse
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

export const createApplicationSubmission = async (data: CreateApplicationSubmission): Promise<ApplicationSubmissionResponse> => {
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