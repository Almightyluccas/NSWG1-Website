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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { toast } from "sonner";
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
  Search,
  Loader2,
  Trash2,
  Filter,
  X,
} from "lucide-react";
import {
  getCampaigns,
  createCampaign,
  createMission,
  createOrUpdateMissionRSVP,
  markMissionAttendance,
  updateCampaign,
  deleteCampaign,
  updateMission,
  deleteMission,
  getUsersForAttendance,
} from "@/app/calendar/action";

const CAMPAIGNS_PER_PAGE = 5;

interface Campaign {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string;
  created_at: string;
  missions: Mission[];
}

interface Mission {
  id: string;
  campaign_id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_personnel?: number;
  status: string;
  created_by: string;
  created_at: string;
  rsvps: RSVP[];
  attendance: AttendanceRecord[];
}

interface RSVP {
  id: string;
  missionId: string;
  userId: string;
  userName: string;
  status: "attending" | "not-attending" | "maybe";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceRecord {
  id: string;
  missionId: string;
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

function CreateCampaignModal({
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
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    await onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Create a new campaign to organize multiple missions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent-darker text-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Campaign"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditCampaignModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  campaign,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  campaign: Campaign | null;
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!campaign) return;

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    await onSubmit(data);
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>Update the campaign details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Campaign Name</Label>
              <Input
                id="editName"
                name="name"
                defaultValue={campaign.name}
                required
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                name="description"
                defaultValue={campaign.description}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartDate">Start Date</Label>
                <Input
                  id="editStartDate"
                  name="startDate"
                  type="date"
                  defaultValue={campaign.start_date}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editEndDate">End Date</Label>
                <Input
                  id="editEndDate"
                  name="endDate"
                  type="date"
                  defaultValue={campaign.end_date}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent-darker text-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Campaign"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCampaignModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  campaign,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  campaign: Campaign | null;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{campaign?.name}"? This will also
            delete all missions and RSVPs associated with this campaign.
            Attendance records will be preserved. This action cannot be undone.
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
              "Delete Campaign"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CreateMissionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  campaign,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  campaign: Campaign | null;
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!campaign) return;

    const formData = new FormData(e.currentTarget);

    const data = {
      campaignId: campaign.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      maxPersonnel:
        Number.parseInt(formData.get("maxPersonnel") as string) || 40,
    };

    await onSubmit(data);
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Mission</DialogTitle>
          <DialogDescription>
            Add a new mission to {campaign.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="missionName">Mission Name</Label>
              <Input id="missionName" name="name" required />
            </div>
            <div>
              <Label htmlFor="missionDescription">Description</Label>
              <Textarea id="missionDescription" name="description" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="missionDate">Date</Label>
                <Input id="missionDate" name="date" type="date" required />
              </div>
              <div>
                <Label htmlFor="missionTime">Time</Label>
                <Input id="missionTime" name="time" type="time" required />
              </div>
            </div>
            <div>
              <Label htmlFor="missionLocation">Location</Label>
              <Input id="missionLocation" name="location" required />
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
              className="bg-accent hover:bg-accent-darker text-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Mission"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditMissionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  mission,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  mission: Mission | null;
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mission) return;

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      maxPersonnel:
        Number.parseInt(formData.get("maxPersonnel") as string) || undefined,
    };

    await onSubmit(data);
  };

  if (!mission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Mission</DialogTitle>
          <DialogDescription>Update the mission details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editMissionName">Mission Name</Label>
              <Input
                id="editMissionName"
                name="name"
                defaultValue={mission.name}
                required
              />
            </div>
            <div>
              <Label htmlFor="editMissionDescription">Description</Label>
              <Textarea
                id="editMissionDescription"
                name="description"
                defaultValue={mission.description}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editMissionDate">Date</Label>
                <Input
                  id="editMissionDate"
                  name="date"
                  type="date"
                  defaultValue={mission.date}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editMissionTime">Time</Label>
                <Input
                  id="editMissionTime"
                  name="time"
                  type="time"
                  defaultValue={mission.time}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editMissionLocation">Location</Label>
              <Input
                id="editMissionLocation"
                name="location"
                defaultValue={mission.location}
                required
              />
            </div>
            <div>
              <Label htmlFor="editMaxPersonnel">Max Personnel (Optional)</Label>
              <Input
                id="editMaxPersonnel"
                name="maxPersonnel"
                type="number"
                defaultValue={mission.max_personnel}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent-darker text-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Mission"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteMissionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  mission,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  mission: Mission | null;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Mission</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{mission?.name}"? This will also
            delete all RSVPs for this mission. Attendance records will be
            preserved. This action cannot be undone.
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
              "Delete Mission"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CampaignsTab() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsedCampaigns, setCollapsedCampaigns] = useState<Set<string>>(
    new Set()
  );
  const [collapsedMissions, setCollapsedMissions] = useState<Set<string>>(
    new Set()
  );
  const [modals, setModals] = useState({
    createCampaign: false,
    editCampaign: false,
    deleteCampaign: false,
    createMission: false,
    editMission: false,
    deleteMission: false,
    attendance: false,
  });
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    creatingCampaign: false,
    updatingCampaign: false,
    deletingCampaign: false,
    creatingMission: false,
    updatingMission: false,
    deletingMission: false,
  });
  const [rsvpLoadingStates, setRsvpLoadingStates] = useState<
    Record<string, string>
  >({});
  const [attendanceLoadingStates, setAttendanceLoadingStates] = useState<
    Record<string, string>
  >({});
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [localAttendance, setLocalAttendance] = useState<AttendanceRecord[]>(
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
    loadCampaigns();
    if (isAdmin) {
      loadUsers();
    }
  }, [session, isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, roleFilter, searchTerm]);

  useEffect(() => {
    if (selectedMission) {
      setLocalAttendance([...selectedMission.attendance]);
    }
  }, [selectedMission]);

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

  const loadCampaigns = async (preserveState = false) => {
    try {
      setLoading(!preserveState);
      const campaignData = await getCampaigns();
      let campaignToDisplay = campaignData;

      if (!isAdmin)
        campaignToDisplay = campaignData.filter(
          (campaign) => campaign.status !== "planning"
        );
      setCampaigns(campaignToDisplay);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    } finally {
      if (!preserveState) setLoading(false);
    }
  };

  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = [...campaigns];
    const today = new Date().toISOString().split("T")[0];

    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter((campaign) => {
        const campaignStartDate = campaign.start_date;
        const campaignEndDate = campaign.end_date;

        if (filters.dateFrom && campaignEndDate < filters.dateFrom)
          return false;
        if (filters.dateTo && campaignStartDate > filters.dateTo) return false;

        return true;
      });
    }

    if (filters.eventType !== "all") {
      filtered = filtered.filter((campaign) => {
        const campaignEndDate = campaign.end_date;
        const isUpcoming = campaignEndDate >= today;
        const isPast = campaignEndDate < today;

        if (filters.eventType === "upcoming") return isUpcoming;
        if (filters.eventType === "past") return isPast;

        return true;
      });
    }

    filtered.sort((a, b) => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayTimestamp = startOfToday.getTime();

      const aDate = new Date(a.start_date).getTime();
      const bDate = new Date(b.start_date).getTime();

      if (filters.sortOrder === "upcoming") {
        const aIsUpcoming = new Date(a.end_date).getTime() >= todayTimestamp;
        const bIsUpcoming = new Date(b.end_date).getTime() >= todayTimestamp;

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
  }, [campaigns, filters]);

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

  const openModal = (type: keyof typeof modals, item?: Campaign | Mission) => {
    switch (type) {
      case "editCampaign":
      case "deleteCampaign":
        setSelectedCampaign(item as Campaign);
        break;
      case "createMission":
        setSelectedCampaign(item as Campaign);
        break;
      case "editMission":
      case "deleteMission":
      case "attendance":
        setSelectedMission(item as Mission);
        break;
    }
    setModals((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    if (type.includes("Campaign")) setSelectedCampaign(null);
    if (type.includes("Mission")) setSelectedMission(null);
    if (type === "attendance") {
      setSelectedMission(null);
      setSearchTerm("");
      setRoleFilter("all");
      setLocalAttendance([]);
    }
  };

  const handleCreateCampaign = async (data: any) => {
    setLoadingStates((prev) => ({ ...prev, creatingCampaign: true }));

    try {
      await createCampaign({
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      closeModal("createCampaign");
      await loadCampaigns(true);

      toast.success("Campaign Created", {
        description: `Campaign "${data.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error("Error", {
        description: "Failed to create campaign. Please try again.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, creatingCampaign: false }));
    }
  };

  const handleUpdateCampaign = async (data: any) => {
    if (!selectedCampaign) return;

    setLoadingStates((prev) => ({ ...prev, updatingCampaign: true }));

    try {
      await updateCampaign(selectedCampaign.id, {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      closeModal("editCampaign");
      await loadCampaigns(true);

      toast.success("Campaign Updated", {
        description: `Campaign "${data.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error("Failed to update campaign:", error);
      toast.error("Error", {
        description: "Failed to update campaign. Please try again.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, updatingCampaign: false }));
    }
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;

    setLoadingStates((prev) => ({ ...prev, deletingCampaign: true }));

    try {
      await deleteCampaign(selectedCampaign.id);
      closeModal("deleteCampaign");
      await loadCampaigns(true);

      toast.success("Campaign Deleted", {
        description: `Campaign "${selectedCampaign.name}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error("Error", {
        description: "Failed to delete campaign. Please try again.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, deletingCampaign: false }));
    }
  };

  const handleCreateMission = async (data: any) => {
    setLoadingStates((prev) => ({ ...prev, creatingMission: true }));

    try {
      await createMission({
        campaignId: data.campaignId,
        name: data.name,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        maxPersonnel: data.maxPersonnel,
      });

      closeModal("createMission");
      await loadCampaigns(true);

      toast.success("Mission Created", {
        description: `Mission "${data.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Failed to create mission:", error);
      toast.error("Error", {
        description: "Failed to create mission. Please try again.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, creatingMission: false }));
    }
  };

  const handleUpdateMission = async (data: any) => {
    if (!selectedMission) return;

    setLoadingStates((prev) => ({ ...prev, updatingMission: true }));

    try {
      await updateMission(selectedMission.id, {
        name: data.name,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        maxPersonnel: data.maxPersonnel,
      });

      closeModal("editMission");
      await loadCampaigns(true);

      toast.success("Mission Updated", {
        description: `Mission "${data.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error("Failed to update mission:", error);
      toast.error("Error", {
        description: "Failed to update mission. Please try again.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, updatingMission: false }));
    }
  };

  const handleDeleteMission = async () => {
    if (!selectedMission) return;

    setLoadingStates((prev) => ({ ...prev, deletingMission: true }));

    try {
      await deleteMission(selectedMission.id);
      closeModal("deleteMission");
      await loadCampaigns(true);

      toast.success("Mission Deleted", {
        description: `Mission "${selectedMission.name}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete mission:", error);
      toast.error("Error", {
        description: "Failed to delete mission. Please try again.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, deletingMission: false }));
    }
  };

  const handleRSVP = async (
    mission: Mission,
    status: "attending" | "not-attending" | "maybe"
  ) => {
    if (!session?.user) return;

    const loadingKey = mission.id;
    setRsvpLoadingStates((prev) => ({ ...prev, [loadingKey]: status }));

    try {
      await createOrUpdateMissionRSVP({
        missionId: mission.id,
        status,
      });

      await loadCampaigns(true);
    } catch (error) {
      console.error("Failed to update RSVP:", error);
    } finally {
      setRsvpLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[loadingKey];
        return newState;
      });
    }
  };

  const handleMarkAttendance = async (
    mission: Mission,
    userId: string,
    userName: string,
    status: "present" | "absent" | "late" | "excused"
  ) => {
    if (!session?.user) return;

    const loadingKey = userId;
    setAttendanceLoadingStates((prev) => ({ ...prev, [loadingKey]: status }));

    try {
      await markMissionAttendance({
        missionId: mission.id,
        userId,
        userName,
        status,
      });

      const attendanceId = `att-${mission.id}-${userId}`;
      const newAttendance: AttendanceRecord = {
        id: attendanceId,
        missionId: mission.id,
        userId: userId,
        userName: userName,
        status: status,
        notes: "",
        markedBy: session.user.id!,
        markedAt: new Date().toISOString(),
      };

      setLocalAttendance((prev) => {
        const filtered = prev.filter((att) => att.userId !== userId);
        return [...filtered, newAttendance];
      });

      setCampaigns((prevCampaigns) =>
        prevCampaigns.map((campaign) => ({
          ...campaign,
          missions: campaign.missions.map((m) => {
            if (m.id === mission.id) {
              const updatedAttendance = m.attendance.filter(
                (att) => att.userId !== userId
              );
              return {
                ...m,
                attendance: [...updatedAttendance, newAttendance],
              };
            }
            return m;
          }),
        }))
      );
    } catch (error) {
      console.error("Failed to mark attendance:", error);
    } finally {
      setAttendanceLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[loadingKey];
        return newState;
      });
    }
  };

  const toggleCampaignCollapse = (campaignId: string) => {
    const newCollapsed = new Set(collapsedCampaigns);
    if (newCollapsed.has(campaignId)) {
      newCollapsed.delete(campaignId);
    } else {
      newCollapsed.add(campaignId);
    }
    setCollapsedCampaigns(newCollapsed);
  };

  const toggleMissionCollapse = (missionId: string) => {
    const newCollapsed = new Set(collapsedMissions);
    if (newCollapsed.has(missionId)) {
      newCollapsed.delete(missionId);
    } else {
      newCollapsed.add(missionId);
    }
    setCollapsedMissions(newCollapsed);
  };

  const getUserRSVP = (mission: Mission): RSVP | undefined => {
    return mission.rsvps.find((rsvp) => rsvp.userId === session?.user?.id);
  };

  const getUserAttendance = (
    mission: Mission
  ): AttendanceRecord | undefined => {
    return mission.attendance.find((att) => att.userId === session?.user?.id);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { color: "bg-blue-500", text: "Planning" },
      active: { color: "bg-green-500", text: "Active" },
      completed: { color: "bg-gray-500", text: "Completed" },
      scheduled: { color: "bg-blue-500", text: "Scheduled" },
      "in-progress": { color: "bg-yellow-500", text: "In Progress" },
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
    filteredAndSortedCampaigns.length / CAMPAIGNS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * CAMPAIGNS_PER_PAGE;
  const endIndex = startIndex + CAMPAIGNS_PER_PAGE;
  const paginatedCampaigns = filteredAndSortedCampaigns.slice(
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
                  <div className="flex gap-2 ml-4">
                    <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="h-8 w-28 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div
                      key={j}
                      className="border rounded-lg p-4 border-gray-200 dark:border-zinc-700"
                    >
                      <div className="h-5 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                      <div className="h-4 w-full bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-4" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, k) => (
                          <div
                            key={k}
                            className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campaigns</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredAndSortedCampaigns.length)} of{" "}
            {filteredAndSortedCampaigns.length} campaigns
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
              className="bg-accent hover:bg-accent-darker text-black"
              onClick={() => openModal("createCampaign")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <Card className="theme-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Filter Campaigns</CardTitle>
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
        {paginatedCampaigns.map((campaign) => {
          const isCollapsed = collapsedCampaigns.has(campaign.id);

          return (
            <Card key={campaign.id} className="theme-card">
              <Collapsible>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="flex items-center gap-2">
                          {campaign.name}
                          {getStatusBadge(campaign.status)}
                        </CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCampaignCollapse(campaign.id)}
                            className="ml-auto"
                          >
                            {isCollapsed ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CardDescription>{campaign.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {campaign.start_date} - {campaign.end_date}
                        </span>
                        <span>{campaign.missions.length} missions</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal("editCampaign", campaign)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal("deleteCampaign", campaign)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal("createMission", campaign)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Mission
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      {campaign.missions.map((mission) => {
                        const userRSVP = getUserRSVP(mission);
                        const userAttendance = getUserAttendance(mission);
                        const attendingRSVPs = mission.rsvps.filter(
                          (r) => r.status === "attending"
                        );
                        const maybeRSVPs = mission.rsvps.filter(
                          (r) => r.status === "maybe"
                        );
                        const notAttendingRSVPs = mission.rsvps.filter(
                          (r) => r.status === "not-attending"
                        );
                        const isMissionCollapsed = collapsedMissions.has(
                          mission.id
                        );
                        const rsvpLoading = rsvpLoadingStates[mission.id];

                        return (
                          <div
                            key={mission.id}
                            className="border rounded-lg p-4 border-gray-200 dark:border-zinc-700"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    {mission.name}
                                    {getStatusBadge(mission.status)}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      toggleMissionCollapse(mission.id)
                                    }
                                  >
                                    {isMissionCollapsed ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">
                                  {mission.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
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
                                {isAdmin && (
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        openModal("editMission", mission)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        openModal("deleteMission", mission)
                                      }
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {!isMissionCollapsed && (
                              <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4 text-accent" />
                                    {mission.date}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-accent" />
                                    {mission.time}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-accent" />
                                    {mission.location}
                                  </div>
                                  {mission.max_personnel && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4 text-accent" />
                                      {attendingRSVPs.length}/
                                      {mission.max_personnel}
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 mb-4">
                                  {!userAttendance &&
                                    (mission.status === "scheduled" ||
                                      mission.status === "in-progress") && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant={
                                            userRSVP?.status === "attending"
                                              ? "default"
                                              : "outline"
                                          }
                                          onClick={() =>
                                            handleRSVP(mission, "attending")
                                          }
                                          disabled={rsvpLoading === "attending"}
                                          className={
                                            userRSVP?.status === "attending"
                                              ? "bg-green-500 hover:bg-green-600"
                                              : ""
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
                                            handleRSVP(mission, "maybe")
                                          }
                                          disabled={rsvpLoading === "maybe"}
                                          className={
                                            userRSVP?.status === "maybe"
                                              ? "bg-yellow-500 hover:bg-yellow-600"
                                              : ""
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
                                            handleRSVP(mission, "not-attending")
                                          }
                                          disabled={
                                            rsvpLoading === "not-attending"
                                          }
                                          className={
                                            userRSVP?.status === "not-attending"
                                              ? "bg-red-500 hover:bg-red-600"
                                              : ""
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
                                    )}

                                  {isAdmin && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        openModal("attendance", mission)
                                      }
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Mark Attendance
                                    </Button>
                                  )}
                                </div>

                                {mission.rsvps.length > 0 && (
                                  <div className="space-y-3">
                                    <h5 className="font-medium text-sm">
                                      Personnel Status:
                                    </h5>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {attendingRSVPs.length > 0 && (
                                        <div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium">
                                              Attending ({attendingRSVPs.length}
                                              )
                                            </span>
                                          </div>
                                          <div className="space-y-1">
                                            {attendingRSVPs.map((rsvp) => {
                                              const attendance =
                                                mission.attendance.find(
                                                  (a) =>
                                                    a.userId === rsvp.userId
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
                                      )}

                                      {maybeRSVPs.length > 0 && (
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
                                      )}

                                      {notAttendingRSVPs.length > 0 && (
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
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}

                      {campaign.missions.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No missions scheduled for this campaign yet.</p>
                        </div>
                      )}
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

      {filteredAndSortedCampaigns.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
          <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Campaigns Found</h3>
          <p>
            {hasActiveFilters
              ? "No campaigns match your current filters. Try adjusting your search criteria."
              : isAdmin
                ? "Create your first campaign to start organizing missions."
                : "You haven't been assigned to any campaigns yet."}
          </p>
        </div>
      )}

      {/* Modals */}
      <CreateCampaignModal
        isOpen={modals.createCampaign}
        onClose={() => closeModal("createCampaign")}
        onSubmit={handleCreateCampaign}
        isLoading={loadingStates.creatingCampaign}
      />

      <EditCampaignModal
        isOpen={modals.editCampaign}
        onClose={() => closeModal("editCampaign")}
        onSubmit={handleUpdateCampaign}
        isLoading={loadingStates.updatingCampaign}
        campaign={selectedCampaign}
      />

      <DeleteCampaignModal
        isOpen={modals.deleteCampaign}
        onClose={() => closeModal("deleteCampaign")}
        onConfirm={handleDeleteCampaign}
        isLoading={loadingStates.deletingCampaign}
        campaign={selectedCampaign}
      />

      <CreateMissionModal
        isOpen={modals.createMission}
        onClose={() => closeModal("createMission")}
        onSubmit={handleCreateMission}
        isLoading={loadingStates.creatingMission}
        campaign={selectedCampaign}
      />

      <EditMissionModal
        isOpen={modals.editMission}
        onClose={() => closeModal("editMission")}
        onSubmit={handleUpdateMission}
        isLoading={loadingStates.updatingMission}
        mission={selectedMission}
      />

      <DeleteMissionModal
        isOpen={modals.deleteMission}
        onClose={() => closeModal("deleteMission")}
        onConfirm={handleDeleteMission}
        isLoading={loadingStates.deletingMission}
        mission={selectedMission}
      />

      {/* Attendance Modal */}
      <Dialog
        open={modals.attendance}
        onOpenChange={(open) => !open && closeModal("attendance")}
      >
        <DialogContent className="w-[90vw] md:w-[70vw] !max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark Attendance - {selectedMission?.name}</DialogTitle>
            <DialogDescription>
              Mark attendance for personnel. Showing all eligible users with
              their current status.
            </DialogDescription>
          </DialogHeader>

          {selectedMission && (
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
                      const rsvp = selectedMission.rsvps.find(
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
                                    selectedMission,
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
                                    selectedMission,
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
                                    selectedMission,
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
                                    selectedMission,
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
