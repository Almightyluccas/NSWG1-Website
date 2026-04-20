"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Loader2,
  Plus,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { CampaignForm, type CampaignFormValues } from "@/components/operations/management/campaign-form";
import { MissionForm, type MissionFormValues } from "@/components/operations/management/mission-form";
import { IntelBlockForm } from "@/components/operations/management/intel-block-form";
import { PlanningDocList } from "@/components/operations/management/planning-doc-list";
import { SseAttachmentList } from "@/components/operations/management/sse-attachment-list";

const TEAM_ORDER = ["member", "tacdevron", "160th"];
const TEAM_LABELS: Record<string, string> = {
  member: "GENERAL",
  tacdevron: "TACDEVRON",
  "160th": "160TH",
};

type DbRSVP = {
  id: string;
  mission_id: string;
  user_id: string;
  user_name: string;
  status: "attending" | "not-attending" | "maybe";
  unitRole?: string;
};

type DbAttendance = {
  id: string;
  mission_id: string;
  user_id: string;
  user_name: string;
  status: "present" | "absent" | "late" | "excused";
};

type DbMission = {
  id: string;
  campaign_id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_personnel: number | null;
  status: string;
  rsvps?: DbRSVP[];
  attendance?: DbAttendance[];
};

type DbCampaign = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  missions?: DbMission[];
};

type AttendanceUser = {
  id: string;
  name: string;
  discord_username: string;
  primaryRole: string;
};

export function CampaignManageClient({
  id,
  view = "missions",
}: {
  id: string;
  view?: "campaign" | "missions";
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<DbCampaign | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [missionDialog, setMissionDialog] = useState<
    | { type: "create"; open: true }
    | { type: "edit"; open: true; mission: DbMission }
    | { type: null; open: false }
  >({ type: null, open: false });

  const [deleteMission, setDeleteMission] = useState<DbMission | null>(null);
  const [attendanceMission, setAttendanceMission] = useState<DbMission | null>(
    null,
  );
  const [missionIntelDialog, setMissionIntelDialog] = useState<DbMission | null>(
    null,
  );
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [roleLookup, setRoleLookup] = useState<Record<string, string>>({});
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [attendanceBusy, setAttendanceBusy] = useState<Record<string, string>>(
    {},
  );

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`/api/operations/${id}`);
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as DbCampaign;
      setCampaign(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load campaign.");
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/attendance");
        if (!res.ok) return;
        const data = (await res.json()) as AttendanceUser[];
        const lookup = Array.isArray(data)
          ? data.reduce<Record<string, string>>((acc, user) => {
              acc[user.id] = user.primaryRole || "member";
              return acc;
            }, {})
          : {};
        setRoleLookup(lookup);
      } catch {
        setRoleLookup({});
      }
    })();
  }, []);

  useEffect(() => {
    if (!attendanceMission) return;
    (async () => {
      try {
        const res = await fetch("/api/users/attendance");
        if (!res.ok) return;
        const data = (await res.json()) as AttendanceUser[];
        setUsers(Array.isArray(data) ? data : []);
      } catch {
        setUsers([]);
      }
    })();
  }, [attendanceMission]);

  const getUnitLabel = (role?: string) => {
    if (role === "tacdevron") return "TACDEVRON";
    if (role === "160th") return "160TH";
    return "GENERAL";
  };

  const getRsvpUnitBreakdown = (rsvps: DbRSVP[]) => {
    const grouped = rsvps.reduce<Record<string, number>>((acc, rsvp) => {
      const role = roleLookup[rsvp.user_id] || "member";
      const unit = getUnitLabel(role);
      acc[unit] = (acc[unit] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (roleFilter !== "all") {
      list = list.filter((u) => u.primaryRole === roleFilter);
    }
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.discord_username.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [users, roleFilter, userSearch]);

  const groupedUsers = useMemo(() => {
    const grouped = filteredUsers.reduce<Record<string, AttendanceUser[]>>((acc, user) => {
      const key = TEAM_ORDER.includes(user.primaryRole) ? user.primaryRole : "member";
      if (!acc[key]) acc[key] = [];
      acc[key].push(user);
      return acc;
    }, {});
    return TEAM_ORDER.map((key) => ({
      key,
      label: TEAM_LABELS[key],
      users: grouped[key] ?? [],
    })).filter((group) => group.users.length > 0);
  }, [filteredUsers]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-4">
        <Card className="glass-panel scan-lines border border-zinc-800/80 rounded-sm">
          <CardContent className="p-6 flex items-center gap-2 text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-4">
        <Card className="glass-panel scan-lines border border-zinc-800/80 rounded-sm">
          <CardContent className="p-6 space-y-2">
            <p className="text-sm text-zinc-200 font-semibold">
              Campaign not available
            </p>
            {error && (
              <p className="text-xs text-red-200 font-mono">{error}</p>
            )}
            <Button variant="outline" asChild>
              <Link href="/dashboard/operations/management">Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const missions = campaign.missions ?? [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-sm md:text-base font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.22em]">
            {view === "missions" ? "Mission Management" : "Campaign Management"}
          </h1>
          <p className="text-[11px] text-zinc-400 mt-1">
            {campaign.name} • {missions.length} missions • {campaign.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/operations/management">Back</Link>
          </Button>
          <Button variant={view === "missions" ? "default" : "outline"} asChild>
            <Link href={`/dashboard/operations/management/campaigns/${id}/missions`}>Missions</Link>
          </Button>
          <Button variant={view === "campaign" ? "default" : "outline"} asChild>
            <Link href={`/dashboard/operations/management/campaigns/${id}/campaign`}>Campaign Intel</Link>
          </Button>
          <Button
            className="bg-accent hover:bg-accent-darker text-black"
            onClick={() => setMissionDialog({ type: "create", open: true })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Mission
          </Button>
        </div>
      </div>
      {view === "campaign" && (
        <>
          <CampaignForm
            title="Campaign Details"
            submitLabel="Save Campaign"
            defaultValues={{
              name: campaign.name,
              description: campaign.description,
              startDate: campaign.start_date,
              endDate: campaign.end_date,
            }}
            onSubmit={async (values: CampaignFormValues) => {
              const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
              if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to update campaign.");
              }
              await load();
              router.refresh();
            }}
          />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <IntelBlockForm
              ownerType="campaign"
              ownerId={campaign.id}
              heading="Operational Intel // Campaign-Level"
            />
            <PlanningDocList
              ownerType="campaign"
              ownerId={campaign.id}
              heading="Planning Docs // Campaign-Level"
            />
          </div>

          <SseAttachmentList
            ownerType="campaign"
            ownerId={campaign.id}
            campaignId={campaign.id}
            heading="SSE Returns // Campaign-Level"
          />
        </>
      )}

      {view === "missions" && (
        <Card className="glass-panel scan-lines accent-border-top border border-zinc-800/80 rounded-sm">
        <CardHeader className="border-b border-zinc-800/80 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold text-zinc-300 uppercase tracking-[0.2em]">
            Missions
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-zinc-700">
            {missions.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {missions.length === 0 ? (
            <div className="py-10 text-center text-zinc-500 text-xs font-mono uppercase tracking-[0.22em] border border-dashed border-zinc-700/80 rounded-sm bg-zinc-950/40">
              No missions configured yet.
            </div>
          ) : (
            missions.map((m) => {
              const rsvps = m.rsvps ?? [];
              const attendance = m.attendance ?? [];
              const attending = rsvps.filter((r) => r.status === "attending")
                .length;
              const maybe = rsvps.filter((r) => r.status === "maybe").length;
              const cant = rsvps.filter((r) => r.status === "not-attending")
                .length;

              return (
                <div
                  key={m.id}
                  className="rounded-sm border border-zinc-800/80 bg-zinc-950/50 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-zinc-100 uppercase tracking-[0.18em]">
                        {m.name}
                      </p>
                      <p className="text-[11px] text-zinc-300 mt-1 line-clamp-2">
                        {m.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                        <Badge variant="outline" className="border-zinc-700">
                          {m.date} @ {m.time}
                        </Badge>
                        <Badge variant="outline" className="border-zinc-700">
                          {m.location}
                        </Badge>
                        {m.max_personnel && (
                          <Badge variant="outline" className="border-zinc-700">
                            Max {m.max_personnel}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setAttendanceMission({ ...m, rsvps, attendance })
                        }
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Attendance
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setMissionDialog({ type: "edit", open: true, mission: m })
                        }
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMissionIntelDialog(m)}
                      >
                        Intel &amp; Attachments
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-300 hover:text-red-200"
                        onClick={() => setDeleteMission(m)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400">
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-300 bg-emerald-500/5"
                    >
                      {attending} Attending
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 text-amber-300 bg-amber-500/5"
                    >
                      {maybe} Maybe
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-red-500/30 text-red-300 bg-red-500/5"
                    >
                      {cant} Can&apos;t Attend
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-blue-500/30 text-blue-200 bg-blue-500/5"
                    >
                      {attendance.length} attendance marked
                    </Badge>
                    {getRsvpUnitBreakdown(rsvps).map(([unit, count]) => (
                      <Badge
                        key={`${m.id}-${unit}`}
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 bg-zinc-900/40"
                      >
                        {unit}: {count} RSVP
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
      )}

      <Dialog
        open={missionDialog.open}
        onOpenChange={(open) => !open && setMissionDialog({ type: null, open: false })}
      >
        <DialogContent className="w-[95vw] md:w-[720px] !max-w-none">
          <DialogHeader>
            <DialogTitle>
              {missionDialog.type === "edit" ? "Edit Mission" : "Create Mission"}
            </DialogTitle>
          </DialogHeader>
          <MissionForm
            title="Mission Details"
            submitLabel={missionDialog.type === "edit" ? "Save Mission" : "Create Mission"}
            defaultValues={
              missionDialog.type === "edit"
                ? {
                    campaignId: campaign.id,
                    name: missionDialog.mission.name,
                    description: missionDialog.mission.description,
                    date: missionDialog.mission.date,
                    time: missionDialog.mission.time,
                    location: missionDialog.mission.location,
                    maxPersonnel: missionDialog.mission.max_personnel,
                  }
                : {
                    campaignId: campaign.id,
                    name: "",
                    description: "",
                    date: "",
                    time: "",
                    location: "",
                    maxPersonnel: null,
                  }
            }
            onCancel={() => setMissionDialog({ type: null, open: false })}
            onSubmit={async (values: MissionFormValues) => {
              const payload = {
                campaignId: values.campaignId,
                name: values.name,
                description: values.description,
                date: values.date,
                time: values.time,
                location: values.location,
                maxPersonnel: values.maxPersonnel ?? undefined,
              };

              if (missionDialog.type === "edit") {
                const res = await fetch(`/api/missions/${missionDialog.mission.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(await res.text());
              } else {
                const res = await fetch("/api/missions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(await res.text());
              }

              setMissionDialog({ type: null, open: false });
              await load();
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteMission}
        onOpenChange={(open) => !open && setDeleteMission(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete mission</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the mission and all RSVPs for it. Attendance records will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteMission(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={async () => {
                if (!deleteMission) return;
                const res = await fetch(`/api/missions/${deleteMission.id}`, {
                  method: "DELETE",
                });
                if (!res.ok) throw new Error(await res.text());
                setDeleteMission(null);
                await load();
                router.refresh();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!attendanceMission}
        onOpenChange={(open) => !open && setAttendanceMission(null)}
      >
        <DialogContent className="w-[95vw] md:w-[900px] !max-w-none overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>

          {attendanceMission && (
            <div className="space-y-4">
              <div className="rounded-sm border border-zinc-800/80 bg-zinc-950/50 p-3">
                <p className="text-xs font-bold text-zinc-100 uppercase tracking-[0.18em]">
                  {attendanceMission.name}
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {attendanceMission.date} @ {attendanceMission.time} • {attendanceMission.location}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="userSearch">Search</Label>
                  <Input
                    id="userSearch"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name or Discord…"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="tacdevron">Tacdevron2</SelectItem>
                      <SelectItem value="160th">160th</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-4">
                {groupedUsers.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">
                        {group.label}
                      </p>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 text-zinc-400 text-[10px]"
                      >
                        {group.users.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                      {group.users.map((u) => {
                  const rsvp = (attendanceMission.rsvps ?? []).find(
                    (r) => r.user_id === u.id,
                  );
                  const att = (attendanceMission.attendance ?? []).find(
                    (a) => a.user_id === u.id,
                  );
                  const busy = attendanceBusy[u.id];

                  return (
                    <div
                      key={u.id}
                      className="rounded-sm border border-zinc-800/80 bg-zinc-950/50 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate">
                          {u.name}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {u.discord_username}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-zinc-400">
                          <Badge variant="outline" className="border-zinc-700">
                            {u.primaryRole}
                          </Badge>
                          {rsvp && (
                            <Badge
                              variant="outline"
                              className={
                                rsvp.status === "attending"
                                  ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/5"
                                  : rsvp.status === "maybe"
                                    ? "border-amber-500/30 text-amber-300 bg-amber-500/5"
                                    : "border-red-500/30 text-red-300 bg-red-500/5"
                              }
                            >
                              RSVP: {rsvp.status}
                            </Badge>
                          )}
                          {att && (
                            <Badge variant="outline" className="border-blue-500/30 text-blue-200 bg-blue-500/5">
                              Attendance: {att.status}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === "present"}
                          className="bg-transparent hover:bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                          onClick={async () => {
                            setAttendanceBusy((p) => ({ ...p, [u.id]: "present" }));
                            try {
                              const res = await fetch(
                                `/api/missions/${attendanceMission.id}/attendance`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    userId: u.id,
                                    userName: u.name,
                                    status: "present",
                                  }),
                                },
                              );
                              if (!res.ok) throw new Error(await res.text());
                              await load();
                            } finally {
                              setAttendanceBusy((p) => {
                                const n = { ...p };
                                delete n[u.id];
                                return n;
                              });
                            }
                          }}
                        >
                          {busy === "present" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                          )}
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === "absent"}
                          className="bg-transparent hover:bg-red-500/15 border-red-500/40 text-red-300"
                          onClick={async () => {
                            setAttendanceBusy((p) => ({ ...p, [u.id]: "absent" }));
                            try {
                              const res = await fetch(
                                `/api/missions/${attendanceMission.id}/attendance`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    userId: u.id,
                                    userName: u.name,
                                    status: "absent",
                                  }),
                                },
                              );
                              if (!res.ok) throw new Error(await res.text());
                              await load();
                            } finally {
                              setAttendanceBusy((p) => {
                                const n = { ...p };
                                delete n[u.id];
                                return n;
                              });
                            }
                          }}
                        >
                          {busy === "absent" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1.5" />
                          )}
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === "late"}
                          className="bg-transparent hover:bg-amber-500/15 border-amber-500/40 text-amber-200"
                          onClick={async () => {
                            setAttendanceBusy((p) => ({ ...p, [u.id]: "late" }));
                            try {
                              const res = await fetch(
                                `/api/missions/${attendanceMission.id}/attendance`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    userId: u.id,
                                    userName: u.name,
                                    status: "late",
                                  }),
                                },
                              );
                              if (!res.ok) throw new Error(await res.text());
                              await load();
                            } finally {
                              setAttendanceBusy((p) => {
                                const n = { ...p };
                                delete n[u.id];
                                return n;
                              });
                            }
                          }}
                        >
                          {busy === "late" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-1.5" />
                          )}
                          Late
                        </Button>
                      </div>
                    </div>
                  );
                })}
                    </div>
                  </div>
                ))}

                {groupedUsers.length === 0 && (
                  <div className="py-10 text-center text-zinc-500 text-xs font-mono uppercase tracking-[0.22em] border border-dashed border-zinc-700/80 rounded-sm bg-zinc-950/40">
                    No users match the current filter.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!missionIntelDialog}
        onOpenChange={(open) => !open && setMissionIntelDialog(null)}
      >
        <DialogContent className="w-[95vw] md:w-[980px] !max-w-none overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Mission Intel &amp; Attachments</DialogTitle>
          </DialogHeader>
          {missionIntelDialog && (
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/40 p-3">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.16em]">
                  {missionIntelDialog.name}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {missionIntelDialog.date} @ {missionIntelDialog.time} • {missionIntelDialog.location}
                </p>
              </div>

              <IntelBlockForm
                ownerType="mission"
                ownerId={missionIntelDialog.id}
                heading="Operational Intel // Mission-Level"
              />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <PlanningDocList
                  ownerType="mission"
                  ownerId={missionIntelDialog.id}
                  heading="Planning Docs // Mission-Level"
                />
                <SseAttachmentList
                  ownerType="mission"
                  ownerId={missionIntelDialog.id}
                  campaignId={campaign.id}
                  heading="SSE Returns // Mission-Level"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

