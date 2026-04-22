export type PersonnelGroupKey = "unit" | "role" | "rank";

export type PersonnelGroupConfig<T> = {
  key: PersonnelGroupKey;
  label: string;
  buckets: Array<{
    key: string;
    label: string;
    match: (user: T) => boolean;
  }>;
};

type UserWithPrimaryRole = { primaryRole?: string };

export const UNIT_GROUP: PersonnelGroupConfig<UserWithPrimaryRole> = {
  key: "unit",
  label: "Unit",
  buckets: [
    { key: "member", label: "GENERAL", match: (user) => !user.primaryRole || user.primaryRole === "member" },
    { key: "tacdevron", label: "TACDEVRON", match: (user) => user.primaryRole === "tacdevron" },
    { key: "160th", label: "160TH", match: (user) => user.primaryRole === "160th" },
  ],
};

export const PERSONNEL_GROUPINGS = [UNIT_GROUP];

export function groupPersonnel<T>(
  users: T[],
  config: PersonnelGroupConfig<T>,
): Array<{ key: string; label: string; users: T[] }> {
  const groups = config.buckets.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    users: users.filter((user) => bucket.match(user)),
  }));

  const leftovers = users.filter(
    (user) => !config.buckets.some((bucket) => bucket.match(user)),
  );

  if (leftovers.length > 0) {
    groups.push({ key: "other", label: "OTHER", users: leftovers });
  }

  return groups.filter((group) => group.users.length > 0);
}

export function getUnitLabel(primaryRole?: string): string {
  if (primaryRole === "tacdevron") return "TACDEVRON";
  if (primaryRole === "160th") return "160TH";
  return "GENERAL";
}

