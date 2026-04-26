"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  TrainingForm,
  type TrainingFormValues,
} from "@/components/operations/management/training-form";
import {
  getUnitLabel,
  groupPersonnel,
  UNIT_GROUP,
} from "@/lib/config/personnel-groups";
import { AllowedPersonnelPicker } from "@/components/documents/allowed-personnel-picker";
import { UserRole } from "@/types/database";
import { useDocumentUpload } from "@/lib/documents/useDocumentUpload";

type TrainingRSVP = {
  id: string;
  trainingId: string;
  userId: string;
  userName: string;
  status: "attending" | "not-attending" | "maybe";
};

type TrainingAttendance = {
  id: string;
  trainingId: string;
  userId: string;
  userName: string;
  status: "present" | "absent" | "late" | "excused";
};

type TrainingRecord = {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  instructor?: string;
  max_personnel?: number | null;
  status: string;
  rsvps?: TrainingRSVP[];
  attendance?: TrainingAttendance[];
};

type AttendanceUser = {
  id: string;
  name: string;
  discord_username: string;
  primaryRole: string;
};

type TrainingDocument = {
  id: string;
  name: string;
  description: string;
  docType: string;
  classification: string;
  tags?: string[];
};

export function TrainingManageClient({ id }: { id: string }) {
  const router = useRouter();
  const { uploadDocument, isUploading } = useDocumentUpload();

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<TrainingRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [roleLookup, setRoleLookup] = useState<Record<string, string>>({});
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [attendanceBusy, setAttendanceBusy] = useState<Record<string, string>>(
    {}
  );
  const [allowRoles, setAllowRoles] = useState<string[]>([]);
  const [allowUsers, setAllowUsers] = useState<string[]>([]);
  const [allowlistSaving, setAllowlistSaving] = useState(false);
  const [trainingDocs, setTrainingDocs] = useState<TrainingDocument[]>([]);
  const [repositoryDocs, setRepositoryDocs] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedRepoDoc, setSelectedRepoDoc] = useState<string>("");
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  const loadRecord = async () => {
    try {
      setError(null);
      setLoading(true);
      // No GET /api/training/[id] route; load list and pick.
      const res = await fetch("/api/training");
      if (!res.ok) throw new Error(await res.text());
      const list = (await res.json()) as TrainingRecord[];
      const found = Array.isArray(list) ? list.find((t) => t.id === id) : null;
      if (!found) throw new Error("Training record not found.");
      setRecord(found);
    } catch (e: any) {
      setError(e?.message || "Failed to load training record.");
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
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
    (async () => {
      try {
        const res = await fetch(`/api/training/${id}/allowlist`);
        if (!res.ok) return;
        const data = await res.json();
        setAllowRoles(Array.isArray(data?.roles) ? data.roles : []);
        setAllowUsers(Array.isArray(data?.userIds) ? data.userIds : []);
      } catch {
        setAllowRoles([]);
        setAllowUsers([]);
      }
    })();
  }, [id]);

  const loadTrainingDocs = async () => {
    try {
      const res = await fetch(`/api/training/${id}/docs`);
      if (!res.ok) return;
      const data = await res.json();
      setTrainingDocs(Array.isArray(data) ? data : []);
    } catch {
      setTrainingDocs([]);
    }
  };

  useEffect(() => {
    void loadTrainingDocs();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/documents");
        if (!res.ok) return;
        const data = await res.json();
        const docs = Array.isArray(data)
          ? data.map((doc) => ({
              id: String(doc.id),
              name: String(doc.name ?? `Doc ${doc.id}`),
            }))
          : [];
        setRepositoryDocs(docs);
      } catch {
        setRepositoryDocs([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!attendanceOpen) return;
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
  }, [attendanceOpen]);

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
          u.discord_username.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [users, roleFilter, userSearch]);

  const groupedUsers = useMemo(() => {
    return groupPersonnel(filteredUsers, UNIT_GROUP);
  }, [filteredUsers]);

  const toggleAllowRole = (role: string) => {
    setAllowRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleAllowUser = (userId: string) => {
    setAllowUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((u) => u !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Card className="glass-panel scan-lines border border-zinc-800/80 rounded-sm">
          <CardContent className="p-6 flex items-center gap-2 text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Card className="glass-panel scan-lines border border-zinc-800/80 rounded-sm">
          <CardContent className="p-6 space-y-2">
            <p className="text-sm text-zinc-200 font-semibold">
              Training record not available
            </p>
            {error && <p className="text-xs text-red-200 font-mono">{error}</p>}
            <Button variant="outline" asChild>
              <Link href="/dashboard/operations/management">Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rsvps = record.rsvps ?? [];
  const attendance = record.attendance ?? [];
  const attending = rsvps.filter((r) => r.status === "attending").length;
  const maybe = rsvps.filter((r) => r.status === "maybe").length;
  const cant = rsvps.filter((r) => r.status === "not-attending").length;
  const rsvpUnitBreakdown = rsvps.reduce<Record<string, number>>(
    (acc, rsvp) => {
      const role = roleLookup[rsvp.userId] || "member";
      const unit = getUnitLabel(role);
      acc[unit] = (acc[unit] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-sm md:text-base font-black text-zinc-100 uppercase tracking-[0.22em]">
            Manage Training
          </h1>
          <p className="text-[11px] text-zinc-400 mt-1">
            {record.name} • {record.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/operations/management">Back</Link>
          </Button>
          <Button variant="outline" onClick={() => setAttendanceOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            Attendance
          </Button>
          <Button
            variant="outline"
            className="text-red-300 hover:text-red-200"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <TrainingForm
        title="Training Details"
        submitLabel="Save Training"
        defaultValues={{
          name: record.name,
          description: record.description,
          date: record.date,
          time: record.time,
          location: record.location,
          instructor: record.instructor ?? "",
          maxPersonnel: record.max_personnel ?? null,
        }}
        onSubmit={async (values: TrainingFormValues) => {
          const res = await fetch(`/api/training/${record.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: values.name,
              description: values.description,
              date: values.date,
              time: values.time,
              location: values.location,
              instructor: values.instructor || undefined,
              maxPersonnel: values.maxPersonnel ?? undefined,
            }),
          });
          if (!res.ok) throw new Error(await res.text());
          await loadRecord();
          router.refresh();
        }}
      />

      <Card className="glass-panel scan-lines accent-border-top border border-zinc-800/80 rounded-sm">
        <CardHeader className="border-b border-zinc-800/80 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold text-zinc-300 uppercase tracking-[0.2em]">
            Personnel Signals
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-zinc-700">
            {rsvps.length} RSVPs
          </Badge>
        </CardHeader>
        <CardContent className="p-4 flex flex-wrap gap-2 text-[10px] text-zinc-400">
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
          {Object.entries(rsvpUnitBreakdown)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([unit, count]) => (
              <Badge
                key={`${record.id}-${unit}`}
                variant="outline"
                className="border-zinc-700 text-zinc-300 bg-zinc-900/40"
              >
                {unit}: {count} RSVP
              </Badge>
            ))}
        </CardContent>
      </Card>

      <Card className="glass-panel scan-lines border border-zinc-800/80 rounded-sm">
        <CardHeader className="border-b border-zinc-800/80 pb-3">
          <CardTitle className="text-xs font-bold text-zinc-300 uppercase tracking-[0.2em]">
            Allowed Personnel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <AllowedPersonnelPicker
            roleOptions={Object.values(UserRole)}
            userOptions={users}
            selectedRoles={allowRoles}
            selectedUserIds={allowUsers}
            onToggleRole={toggleAllowRole}
            onToggleUser={toggleAllowUser}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={allowlistSaving}
              onClick={async () => {
                setAllowlistSaving(true);
                try {
                  const res = await fetch(
                    `/api/training/${record.id}/allowlist`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        roles: allowRoles,
                        userIds: allowUsers,
                      }),
                    }
                  );
                  if (!res.ok) throw new Error(await res.text());
                } finally {
                  setAllowlistSaving(false);
                }
              }}
            >
              {allowlistSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Allowlist"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel scan-lines border border-zinc-800/80 rounded-sm">
        <CardHeader className="border-b border-zinc-800/80 pb-3">
          <CardTitle className="text-xs font-bold text-zinc-300 uppercase tracking-[0.2em]">
            Training Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-2">
            <Select value={selectedRepoDoc} onValueChange={setSelectedRepoDoc}>
              <SelectTrigger className="md:w-[320px]">
                <SelectValue placeholder="Select existing document" />
              </SelectTrigger>
              <SelectContent>
                {repositoryDocs.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              disabled={!selectedRepoDoc}
              onClick={async () => {
                const res = await fetch(`/api/training/${record.id}/docs`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ documentId: selectedRepoDoc }),
                });
                if (res.ok) {
                  setSelectedRepoDoc("");
                  await loadTrainingDocs();
                }
              }}
            >
              Attach Existing
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-2 items-center">
            <Input
              type="file"
              onChange={(e) => setNewDocFile(e.target.files?.[0] ?? null)}
              className="md:w-[320px]"
            />
            <Button
              type="button"
              disabled={!newDocFile || isUploading}
              onClick={async () => {
                if (!newDocFile) return;
                const created = await uploadDocument(newDocFile, {
                  name: newDocFile.name,
                  description: `Training ${record.name} document`,
                  classification: "GENERAL",
                  docType: "TRAINING",
                  unit: "NSWG1 HQ",
                  minimumRole: UserRole.member,
                });
                const documentId = created?.item?.id;
                if (documentId) {
                  await fetch(`/api/training/${record.id}/docs`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentId }),
                  });
                  setNewDocFile(null);
                  await loadTrainingDocs();
                }
              }}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Upload New & Attach"
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {trainingDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-sm border border-zinc-800 p-2"
              >
                <div>
                  <p className="text-sm text-zinc-100 font-semibold">
                    {doc.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {doc.docType} • {doc.classification}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const res = await fetch(
                        `/api/documents/${doc.id}/download`
                      );
                      const data = await res.json().catch(() => ({}));
                      if (res.ok && data?.url) {
                        window.open(data.url, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-300 hover:text-red-200"
                    onClick={async () => {
                      const res = await fetch(
                        `/api/training/${record.id}/docs/${doc.id}`,
                        { method: "DELETE" }
                      );
                      if (res.ok) await loadTrainingDocs();
                    }}
                  >
                    Detach
                  </Button>
                </div>
              </div>
            ))}
            {trainingDocs.length === 0 && (
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.18em]">
                No documents attached.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete training session</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the training and all RSVPs for it. Attendance
              records will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={async () => {
                const res = await fetch(`/api/training/${record.id}`, {
                  method: "DELETE",
                });
                if (!res.ok) throw new Error(await res.text());
                router.push("/dashboard/operations/management");
                router.refresh();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
        <DialogContent className="w-[95vw] md:w-[900px] !max-w-none overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-sm border border-zinc-800/80 bg-zinc-950/50 p-3">
              <p className="text-xs font-bold text-zinc-100 uppercase tracking-[0.18em]">
                {record.name}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                {record.date} @ {record.time} • {record.location}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="tUserSearch">Search</Label>
                <Input
                  id="tUserSearch"
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
                      const rsvp = (record.rsvps ?? []).find(
                        (r) => r.userId === u.id
                      );
                      const att = (record.attendance ?? []).find(
                        (a) => a.userId === u.id
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
                              <Badge
                                variant="outline"
                                className="border-zinc-700"
                              >
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
                                <Badge
                                  variant="outline"
                                  className="border-blue-500/30 text-blue-200 bg-blue-500/5"
                                >
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
                                setAttendanceBusy((p) => ({
                                  ...p,
                                  [u.id]: "present",
                                }));
                                try {
                                  const res = await fetch(
                                    `/api/training/${record.id}/attendance`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        userId: u.id,
                                        userName: u.name,
                                        status: "present",
                                      }),
                                    }
                                  );
                                  if (!res.ok)
                                    throw new Error(await res.text());
                                  await loadRecord();
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
                                setAttendanceBusy((p) => ({
                                  ...p,
                                  [u.id]: "absent",
                                }));
                                try {
                                  const res = await fetch(
                                    `/api/training/${record.id}/attendance`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        userId: u.id,
                                        userName: u.name,
                                        status: "absent",
                                      }),
                                    }
                                  );
                                  if (!res.ok)
                                    throw new Error(await res.text());
                                  await loadRecord();
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
                                setAttendanceBusy((p) => ({
                                  ...p,
                                  [u.id]: "late",
                                }));
                                try {
                                  const res = await fetch(
                                    `/api/training/${record.id}/attendance`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        userId: u.id,
                                        userName: u.name,
                                        status: "late",
                                      }),
                                    }
                                  );
                                  if (!res.ok)
                                    throw new Error(await res.text());
                                  await loadRecord();
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
