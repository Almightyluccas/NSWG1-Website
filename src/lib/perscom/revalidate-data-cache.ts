import { revalidateTag } from "next/cache";
import { PERSCOM_DATA_TAG } from "@/lib/perscom/cache-tags";

/** Invalidate Next.js Data Cache entries tagged for Perscom list fetches. */
export function revalidatePerscomDataCache(): void {
  revalidateTag(PERSCOM_DATA_TAG);
}
