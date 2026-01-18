"use server";

export async function createUrlProfilePicture(path: string) {
  if (process.env.OCI_PROFILE_PAR_URL) {
    return process.env.OCI_PROFILE_PAR_URL + path;
  } else {
    return path;
  }
}
