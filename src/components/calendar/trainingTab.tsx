"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  CalendarIcon,
  MapPin,
  Users,
  Clock,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Search,
  Loader2,
  Trash2,
  Filter,
  X,
} from "lucide-react";
import {
  getTrainingRecords,
  createTrainingRecord,
  createOrUpdateTrainingRSVP,
  markTrainingAttendance,
  updateTrainingRecord,
  deleteTrainingRecord,
  getUsersForAttendance,
} from "@/app/calendar/action";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecurringTrainingManager } from "./recurring-training-manager";
import { toast } from "sonner";

const TRAINING_PER_PAGE = 5;

interface TrainingRecord {
  id: string;
  name: string;
  description: string;
  date: string; // Always yyyy-mm-dd format
  time: string;
  location: string;
  instructor?: string;
  max_personnel?: number;
  status: string;
  created_by: string;
  created_at: string;
  rsvps: TrainingRSVP[];
  attendance: TrainingAttendance[];
}

interface TrainingRSVP {
  id: string;
  trainingId: string;
  userId: string;
  userName: string;
  status: "attending" | "not-attending" | "maybe";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface TrainingAttendance {
  id: string;
  trainingId: string;
  userId: string;
  userName: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
  markedBy: string;
  markedAt: string;
}

interface User {
  id: string;
  name: string;
  discord_username: string;
  role: string[];
  primaryRole: string;
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  sortOrder: "newest" | "oldest" | "upcoming";
  eventType: "all" | "upcoming" | "past";
}

function CreateTrainingModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      instructor: formData.get("instructor") as string,
      maxPersonnel:
        Number.parseInt(formData.get("maxPersonnel") as string) || 40,
    };

    await onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Training Session</DialogTitle>
          <DialogDescription>
            Schedule a new training session for personnel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Training Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" required />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" required />
            </div>
            <div>
              <Label htmlFor="instructor">Instructor (Optional)</Label>
              <Input id="instructor" name="instructor" />
            </div>
            <div>
              <Label htmlFor="maxPersonnel">Max Personnel (Optional)</Label>
              <Input id="maxPersonnel" name="maxPersonnel" type="number" />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Training"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTrainingModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  training,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  training: TrainingRecord | null;
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!training) return;

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      instructor: formData.get("instructor") as string,
      maxPersonnel:
        Number.parseInt(formData.get("maxPersonnel") as string) || undefined,
    };

    await onSubmit(data);
  };

  if (!training) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Training Session</DialogTitle>
          <DialogDescription>
            Update the training session details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Training Name</Label>
              <Input
                id="editName"
                name="name"
                defaultValue={training.name}
                required
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                name="description"
                defaultValue={training.description}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDate">Date</Label>
                <Input
                  id="editDate"
                  name="date"
                  type="date"
                  defaultValue={training.date}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editTime">Time</Label>
                <Input
                  id="editTime"
                  name="time"
                  type="time"
                  defaultValue={training.time}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editLocation">Location</Label>
              <Input
                id="editLocation"
                name="location"
                defaultValue={training.location}
                required
              />
            </div>
            <div>
              <Label htmlFor="editInstructor">Instructor (Optional)</Label>
              <Input
                id="editInstructor"
                name="instructor"
                defaultValue={training.instructor}
              />
            </div>
            <div>
              <Label htmlFor="editMaxPersonnel">Max Personnel (Optional)</Label>
              <Input
                id="editMaxPersonnel"
                name="maxPersonnel"
                type="number"
                defaultValue={training.max_personnel}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Training"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTrainingModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  training,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  training: TrainingRecord | null;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Training</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{training?.name}"? This will also
            delete all RSVPs for this training session. Attendance records will
            be preserved. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Training"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function TrainingTab() {
  const { data: session } = useSession();
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsedTraining, setCollapsedTraining] = useState<Set<string>>(
    new Set()
  );
  const [users, setUsers] = useState<User[]>([]);
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
    attendance: false,
  });
  const [selectedTraining, setSelectedTraining] =
    useState<TrainingRecord | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    creating: false,
    updating: false,
    deleting: false,
  });
  const [rsvpLoadingStates, setRsvpLoadingStates] = useState<
    Record<string, string>
  >({});
  const [attendanceLoadingStates, setAttendanceLoadingStates] = useState<
    Record<string, string>
  >({});
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [localAttendance, setLocalAttendance] = useState<TrainingAttendance[]>(
    []
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: "",
    dateTo: "",
    sortOrder: "upcoming",
    eventType: "upcoming",
  });

  const isAdmin = session?.user?.roles.includes("admin");

  useEffect(() => {
    loadTrainingRecords();
    if (isAdmin) {
      loadUsers();
    }
  }, [session, isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, roleFilter, searchTerm]);

  useEffect(() => {
    if (selectedTraining) {
      setLocalAttendance([...selectedTraining.attendance]);
    }
  }, [selectedTraining]);

  const loadUsers = async () => {
    try {
      const usersData = await getUsersForAttendance();
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.primaryRole === roleFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.discord_username.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      if (a.primaryRole !== b.primaryRole) {
        const roleOrder = { tacdevron: 0, "160th": 1, member: 2 };
        return (
          roleOrder[a.primaryRole as keyof typeof roleOrder] -
          roleOrder[b.primaryRole as keyof typeof roleOrder]
        );
      }
      return a.name.localeCompare(b.name);
    });

    setFilteredUsers(filtered);
  };

  const loadTrainingRecords = async (preserveState = false) => {
    try {
      setLoading(!preserveState);
      const trainingData = await getTrainingRecords();
      setTrainingRecords(trainingData || []);
    } catch (error) {
      console.error("Failed to load training records:", error);
      setTrainingRecords([]);
    } finally {
      if (!preserveState) setLoading(false);
    }
  };

  const filteredAndSortedTraining = useMemo(() => {
    let filtered = [...trainingRecords];
    const today = new Date().toISOString().split("T")[0];

    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter((training) => {
        const trainingDate = training.date;

        if (filters.dateFrom && trainingDate < filters.dateFrom) return false;
        if (filters.dateTo && trainingDate > filters.dateTo) return false;

        return true;
      });
    }

    if (filters.eventType !== "all") {
      filtered = filtered.filter((training) => {
        const trainingDate = training.date;
        const isUpcoming = trainingDate >= today;
        const isPast = trainingDate < today;

        if (filters.eventType === "upcoming") return isUpcoming;
        if (filters.eventType === "past") return isPast;

        return true;
      });
    }

    filtered.sort((a, b) => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayTimestamp = startOfToday.getTime();

      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();

      if (filters.sortOrder === "upcoming") {
        const aIsUpcoming = aDate >= todayTimestamp;
        const bIsUpcoming = bDate >= todayTimestamp;

        if (aIsUpcoming && !bIsUpcoming) return -1;
        if (!aIsUpcoming && bIsUpcoming) return 1;

        return aDate - bDate;
      } else if (filters.sortOrder === "newest") {
        return bDate - aDate;
      } else {
        return aDate - bDate;
      }
    });

    return filtered;
  }, [trainingRecords, filters]);

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      sortOrder: "upcoming",
      eventType: "upcoming",
    });
  };

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.sortOrder !== "upcoming" ||
    filters.eventType !== "upcoming";

  const openModal = (type: keyof typeof modals, training?: TrainingRecord) => {
    if (training) setSelectedTraining(training);
    setModals((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    if (type !== "attendance") {
      setSelectedTraining(null);
    }
    if (type === "attendance") {
      setSearchTerm("");
      setRoleFilter("all");
      setLocalAttendance([]);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[Number.parseInt(month) - 1]} ${Number.parseInt(day)}, ${year}`;
  };

  const handleCreateTraining = async (data: any) => {
    setLoadingStates((prev) => ({ ...prev, creating: true }));

    try {
      await createTrainingRecord({
        name: data.name,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        instructor: data.instructor || undefined,
        maxPersonnel: data.maxPersonnel,
      });

      closeModal("create");
      await loadTrainingRecords(true);

      toast.success("Training Created", {
        description: `Training session "${data.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Failed to create training:", error);
      toast.error("Error", {
        description: "Failed to create training session. Please try again.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, creating: false }));
    }
  };

  const handleUpdateTraining = async (data: any) => {
    if (!selectedTraining) return;

    setLoadingStates((prev) => ({ ...prev, updating: true }));

    try {
      await updateTrainingRecord(selectedTraining.id, {
        name: data.name,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        instructor: data.instructor || undefined,
        maxPersonnel: data.maxPersonnel,
      });

      closeModal("edit");
      await loadTrainingRecords(true);

      toast.success("Training Updated", {
        description: `Training session "${data.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error("Failed to update training:", error);
      toast.error("Error", {
        description: "Failed to update training session. Please try again.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, updating: false }));
    }
  };

  const handleDeleteTraining = async () => {
    if (!selectedTraining) return;

    setLoadingStates((prev) => ({ ...prev, deleting: true }));

    try {
      await deleteTrainingRecord(selectedTraining.id);
      closeModal("delete");
      await loadTrainingRecords(true);

      toast.success("Training Deleted", {
        description: `Training session "${selectedTraining.name}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete training:", error);
      toast.error("Error", {
        description: "Failed to delete training session. Please try again.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, deleting: false }));
    }
  };

  const handleRSVP = async (
    training: TrainingRecord,
    status: "attending" | "not-attending" | "maybe"
  ) => {
    if (!session?.user) return;

    const loadingKey = training.id;
    setRsvpLoadingStates((prev) => ({ ...prev, [loadingKey]: status }));

    try {
      await createOrUpdateTrainingRSVP({
        trainingId: training.id,
        status,
      });

      await loadTrainingRecords(true);
    } catch (error) {
      console.error("Failed to update RSVP:", error);
      toast.error("Error", {
        description: "Failed to update RSVP. Please try again.",
      });
    } finally {
      setRsvpLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[loadingKey];
        return newState;
      });
    }
  };

  const handleMarkAttendance = async (
    training: TrainingRecord,
    userId: string,
    userName: string,
    status: "present" | "absent" | "late" | "excused"
  ) => {
    if (!session?.user) return;

    const loadingKey = userId;
    setAttendanceLoadingStates((prev) => ({ ...prev, [loadingKey]: status }));

    try {
      await markTrainingAttendance({
        trainingId: training.id,
        userId,
        userName,
        status,
      });

      const attendanceId = `tatt-${training.id}-${userId}`;
      const newAttendance: TrainingAttendance = {
        id: attendanceId,
        trainingId: training.id,
        userId,
        userName,
        status,
        notes: "",
        markedBy: session.user.id!,
        markedAt: new Date().toISOString(),
      };

      setLocalAttendance((prev) => {
        const filtered = prev.filter((att) => att.userId !== userId);
        return [...filtered, newAttendance];
      });

      setTrainingRecords((prevRecords) =>
        prevRecords.map((record) => {
          if (record.id === training.id) {
            const updatedAttendance = record.attendance.filter(
              (att) => att.userId !== userId
            );
            return {
              ...record,
              attendance: [...updatedAttendance, newAttendance],
            };
          }
          return record;
        })
      );
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      toast.error("Error", {
        description: "Failed to mark attendance. Please try again.",
      });
    } finally {
      setAttendanceLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[loadingKey];
        return newState;
      });
    }
  };

  const toggleTrainingCollapse = (trainingId: string) => {
    const newCollapsed = new Set(collapsedTraining);
    if (newCollapsed.has(trainingId)) {
      newCollapsed.delete(trainingId);
    } else {
      newCollapsed.add(trainingId);
    }
    setCollapsedTraining(newCollapsed);
  };

  const getUserRSVP = (training: TrainingRecord): TrainingRSVP | undefined => {
    return training.rsvps.find((rsvp) => rsvp.userId === session?.user?.id);
  };

  const getUserAttendance = (
    training: TrainingRecord
  ): TrainingAttendance | undefined => {
    return training.attendance.find((att) => att.userId === session?.user?.id);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-500", text: "Scheduled" },
      "in-progress": { color: "bg-yellow-500", text: "In Progress" },
      completed: { color: "bg-green-500", text: "Completed" },
      cancelled: { color: "bg-red-500", text: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-500",
      text: status,
    };

    return (
      <Badge className={`${config.color} text-white`}>{config.text}</Badge>
    );
  };

  const getRSVPIcon = (status: string) => {
    switch (status) {
      case "attending":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "not-attending":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "maybe":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "tacdevron":
        return "bg-red-500 text-white";
      case "160th":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const totalPages = Math.ceil(
    filteredAndSortedTraining.length / TRAINING_PER_PAGE
  );
  const startIndex = (currentPage - 1) * TRAINING_PER_PAGE;
  const endIndex = startIndex + TRAINING_PER_PAGE;
  const paginatedTraining = filteredAndSortedTraining.slice(
    startIndex,
    endIndex
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-6">
        {isAdmin && (
          <Card className="theme-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                  <div className="h-4 w-64 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                </div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
        </div>

        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="theme-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-6 w-64 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                    <div className="h-4 w-96 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 border-gray-200 dark:border-zinc-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-8 w-20 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="mb-8">
          <RecurringTrainingManager />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Training Records</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredAndSortedTraining.length)} of{" "}
            {filteredAndSortedTraining.length} training sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? "border-accent text-accent" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                !
              </Badge>
            )}
          </Button>
          {isAdmin && (
            <Button
              className="bg-accent hover:bg-accent/90 text-black"
              onClick={() => openModal("create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Training
            </Button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <Card className="theme-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Filter Training Sessions
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: any) =>
                    setFilters((prev) => ({ ...prev, sortOrder: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming First</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={filters.eventType}
                  onValueChange={(value: any) =>
                    setFilters((prev) => ({ ...prev, eventType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming Only</SelectItem>
                    <SelectItem value="past">Past Only</SelectItem>
                    <SelectItem value="all">All Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {paginatedTraining.map((training) => {
          const isCollapsed = collapsedTraining.has(training.id);
          const rsvpLoading = rsvpLoadingStates[training.id];

          return (
            <Card key={training.id} className="theme-card">
              <Collapsible>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-accent" />
                          {training.name}
                          {getStatusBadge(training.status)}
                        </CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTrainingCollapse(training.id)}
                            className="ml-auto bg-transparent"
                          >
                            {isCollapsed ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CardDescription>{training.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDateForDisplay(training.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {training.time}
                        </span>
                        {training.instructor && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {training.instructor}
                          </span>
                        )}
                        <span>{training.rsvps.length} RSVPs</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal("edit", training)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal("delete", training)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 border-gray-200 dark:border-zinc-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4 text-accent" />
                                {formatDateForDisplay(training.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-accent" />
                                {training.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-accent" />
                                {training.location}
                              </div>
                              {training.max_personnel && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-accent" />
                                  {
                                    training.rsvps.filter(
                                      (r) => r.status === "attending"
                                    ).length
                                  }
                                  /{training.max_personnel}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const userRSVP = getUserRSVP(training);
                              const userAttendance =
                                getUserAttendance(training);
                              return (
                                <>
                                  {userRSVP && getRSVPIcon(userRSVP.status)}
                                  {userAttendance && (
                                    <Badge
                                      variant={
                                        userAttendance.status === "present"
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {userAttendance.status}
                                    </Badge>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                          {(() => {
                            const userAttendance = getUserAttendance(training);
                            const userRSVP = getUserRSVP(training);

                            if (
                              !userAttendance &&
                              (training.status === "scheduled" ||
                                training.status === "in-progress")
                            ) {
                              return (
                                <>
                                  <Button
                                    size="sm"
                                    variant={
                                      userRSVP?.status === "attending"
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      handleRSVP(training, "attending")
                                    }
                                    disabled={rsvpLoading === "attending"}
                                    className={
                                      userRSVP?.status === "attending"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-transparent"
                                    }
                                  >
                                    {rsvpLoading === "attending" ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Attending
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      userRSVP?.status === "maybe"
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      handleRSVP(training, "maybe")
                                    }
                                    disabled={rsvpLoading === "maybe"}
                                    className={
                                      userRSVP?.status === "maybe"
                                        ? "bg-yellow-500 hover:bg-yellow-600"
                                        : "bg-transparent"
                                    }
                                  >
                                    {rsvpLoading === "maybe" ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Maybe
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      userRSVP?.status === "not-attending"
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      handleRSVP(training, "not-attending")
                                    }
                                    disabled={rsvpLoading === "not-attending"}
                                    className={
                                      userRSVP?.status === "not-attending"
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-transparent"
                                    }
                                  >
                                    {rsvpLoading === "not-attending" ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Can't Attend
                                  </Button>
                                </>
                              );
                            }
                            return null;
                          })()}

                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openModal("attendance", training)}
                              className="bg-transparent"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Mark Attendance
                            </Button>
                          )}
                        </div>

                        {training.rsvps.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="font-medium text-sm">
                              Personnel Status:
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {(() => {
                                const attendingRSVPs = training.rsvps.filter(
                                  (r) => r.status === "attending"
                                );
                                if (attendingRSVPs.length > 0) {
                                  return (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium">
                                          Attending ({attendingRSVPs.length})
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        {attendingRSVPs.map((rsvp) => {
                                          const attendance =
                                            training.attendance.find(
                                              (a) => a.userId === rsvp.userId
                                            );
                                          return (
                                            <div
                                              key={rsvp.id}
                                              className="flex items-center justify-between text-sm"
                                            >
                                              <span>{rsvp.userName}</span>
                                              {attendance && (
                                                <Badge
                                                  variant="outline"
                                                  className={
                                                    attendance.status ===
                                                    "present"
                                                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                      : attendance.status ===
                                                          "absent"
                                                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                                                        : attendance.status ===
                                                            "late"
                                                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                                  }
                                                >
                                                  {attendance.status}
                                                </Badge>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              {(() => {
                                const maybeRSVPs = training.rsvps.filter(
                                  (r) => r.status === "maybe"
                                );
                                if (maybeRSVPs.length > 0) {
                                  return (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm font-medium">
                                          Maybe ({maybeRSVPs.length})
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        {maybeRSVPs.map((rsvp) => (
                                          <div
                                            key={rsvp.id}
                                            className="text-sm"
                                          >
                                            {rsvp.userName}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              {(() => {
                                const notAttendingRSVPs = training.rsvps.filter(
                                  (r) => r.status === "not-attending"
                                );
                                if (notAttendingRSVPs.length > 0) {
                                  return (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-medium">
                                          Can't Attend (
                                          {notAttendingRSVPs.length})
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        {notAttendingRSVPs.map((rsvp) => (
                                          <div
                                            key={rsvp.id}
                                            className="text-sm"
                                          >
                                            {rsvp.userName}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => goToPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    goToPage(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {filteredAndSortedTraining.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            No Training Sessions Found
          </h3>
          <p>
            {hasActiveFilters
              ? "No training sessions match your current filters. Try adjusting your search criteria."
              : isAdmin
                ? "Create your first training session to start tracking attendance."
                : "You haven't been assigned to any training sessions yet."}
          </p>
        </div>
      )}

      {/* Modals */}
      <CreateTrainingModal
        isOpen={modals.create}
        onClose={() => closeModal("create")}
        onSubmit={handleCreateTraining}
        isLoading={loadingStates.creating}
      />

      <EditTrainingModal
        isOpen={modals.edit}
        onClose={() => closeModal("edit")}
        onSubmit={handleUpdateTraining}
        isLoading={loadingStates.updating}
        training={selectedTraining}
      />

      <DeleteTrainingModal
        isOpen={modals.delete}
        onClose={() => closeModal("delete")}
        onConfirm={handleDeleteTraining}
        isLoading={loadingStates.deleting}
        training={selectedTraining}
      />

      {/* Attendance Modal */}
      <Dialog
        open={modals.attendance}
        onOpenChange={(open) => !open && closeModal("attendance")}
      >
        <DialogContent className="w-[90vw] md:w-[70vw] !max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Mark Attendance - {selectedTraining?.name}
            </DialogTitle>
            <DialogDescription>
              Mark attendance for personnel. Showing all eligible users with
              their current status.
            </DialogDescription>
          </DialogHeader>

          {selectedTraining && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="tacdevron">Tacdevron2</SelectItem>
                      <SelectItem value="160th">160th</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>RSVP Status</TableHead>
                      <TableHead>Attendance Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const rsvp = selectedTraining.rsvps.find(
                        (r) => r.userId === user.id
                      );
                      const attendance = localAttendance.find(
                        (a) => a.userId === user.id
                      );
                      const attendanceLoading =
                        attendanceLoadingStates[user.id];

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getRoleBadgeColor(user.primaryRole)}
                            >
                              {user.primaryRole === "tacdevron"
                                ? "Tacdevron2"
                                : user.primaryRole === "160th"
                                  ? "160th"
                                  : "Member"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {rsvp ? (
                              <div className="flex items-center gap-2">
                                {getRSVPIcon(rsvp.status)}
                                <span className="capitalize">
                                  {rsvp.status.replace("-", " ")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500">No RSVP</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {attendance ? (
                              <Badge
                                variant={
                                  attendance.status === "present"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  attendance.status === "present"
                                    ? "bg-green-500 text-white"
                                    : attendance.status === "absent"
                                      ? "bg-red-500 text-white"
                                      : attendance.status === "late"
                                        ? "bg-yellow-500 text-white"
                                        : "bg-blue-500 text-white"
                                }
                              >
                                {attendance.status}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">Not marked</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={
                                  attendance?.status === "present"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handleMarkAttendance(
                                    selectedTraining,
                                    user.id,
                                    user.name,
                                    "present"
                                  )
                                }
                                disabled={attendanceLoading === "present"}
                                className={
                                  attendance?.status === "present"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : ""
                                }
                              >
                                {attendanceLoading === "present" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Present"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  attendance?.status === "absent"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handleMarkAttendance(
                                    selectedTraining,
                                    user.id,
                                    user.name,
                                    "absent"
                                  )
                                }
                                disabled={attendanceLoading === "absent"}
                                className={
                                  attendance?.status === "absent"
                                    ? "bg-red-500 hover:bg-red-600"
                                    : ""
                                }
                              >
                                {attendanceLoading === "absent" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Absent"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  attendance?.status === "late"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handleMarkAttendance(
                                    selectedTraining,
                                    user.id,
                                    user.name,
                                    "late"
                                  )
                                }
                                disabled={attendanceLoading === "late"}
                                className={
                                  attendance?.status === "late"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : ""
                                }
                              >
                                {attendanceLoading === "late" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Late"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  attendance?.status === "excused"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handleMarkAttendance(
                                    selectedTraining,
                                    user.id,
                                    user.name,
                                    "excused"
                                  )
                                }
                                disabled={attendanceLoading === "excused"}
                                className={
                                  attendance?.status === "excused"
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : ""
                                }
                              >
                                {attendanceLoading === "excused" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Excused"
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found matching your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
