import { getAuthSession } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Target,
  GraduationCap,
  Database,
  Plus,
  ChevronRight,
} from "lucide-react";
import { UserRole } from "@/types/database";

export default async function OperationsManagementPage() {
  const session = await getAuthSession();

  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/operations");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          Operations Management
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs font-mono uppercase tracking-wider">
          Admin console for campaigns, missions, and training
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ManageCard
          href="/dashboard/operations/management/campaigns"
          icon={<Target className="h-6 w-6" />}
          title="Campaigns"
          description="Create, edit, and manage tactical campaigns and their missions."
          actions={[
            {
              label: "View All",
              href: "/dashboard/operations/management/campaigns",
            },
            {
              label: "New Campaign",
              href: "/dashboard/operations/management/campaigns/new",
            },
          ]}
        />

        <ManageCard
          href="/dashboard/operations/management/training"
          icon={<GraduationCap className="h-6 w-6" />}
          title="Training"
          description="Schedule and manage training sessions, track attendance."
          actions={[
            {
              label: "View All",
              href: "/dashboard/operations/management/training",
            },
            {
              label: "New Training",
              href: "/dashboard/operations/management/training/new",
            },
          ]}
        />

        <ManageCard
          href="/dashboard/operations/sse"
          icon={<Database className="h-6 w-6" />}
          title="SSE Repository"
          description="View and manage sensitive site exploitation records."
          actions={[
            { label: "Browse SSE", href: "/dashboard/operations/sse" },
            { label: "Upload", href: "/dashboard/operations/sse/upload" },
          ]}
        />
      </div>
    </div>
  );
}

function ManageCard({
  href,
  icon,
  title,
  description,
  actions,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  actions: { label: string; href: string }[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden group hover:border-accent/30 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
      <Link href={href} className="block p-5 space-y-3">
        <div className="text-accent">{icon}</div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>
      </Link>
      <div className="px-5 pb-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-accent border border-zinc-200 dark:border-zinc-800 hover:border-accent/40 transition-all"
          >
            {action.label === "New Campaign" ||
            action.label === "New Training" ||
            action.label === "Upload" ? (
              <Plus className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
