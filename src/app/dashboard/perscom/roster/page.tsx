import { RosterTable } from "@/app/dashboard/perscom/roster/roster-table.client";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { UserRole } from "@/types/database";
import { perscom } from "@/lib/perscom/api";
import { PerscomUserResponse, Rank } from "@/types/api/perscomApi";

export default async function RosterPage() {
  const members: PerscomUserResponse[] = await perscom.get.users();
  const ranks: Rank[] = await perscom.get.ranks();

  return (
    <ServerRoleGuard allowedRoles={[UserRole.member]}>
      <div className="w-full">
        <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800/60 pb-6">
          <div className="text-zinc-500 text-[9px] font-mono tracking-widest uppercase mb-2 flex items-center gap-2">
            <span className="text-accent">PERSONNEL DATABASE</span>
            <span className="hidden sm:inline">{"// COMMAND ROSTER"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Personnel Roster
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono tracking-wide mt-2">
            View the complete roster organized by command structure
          </p>
        </div>
        <RosterTable members={members} ranks={ranks} />
      </div>
    </ServerRoleGuard>
  );
}
