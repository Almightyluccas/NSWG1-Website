"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Crosshair,
  MapPin,
  Clock,
  ShieldAlert,
  ChevronRight,
  Database,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getClassification,
  getOpStatus,
} from "@/lib/config/operations";
import { type OperationCampaign, type OperationMission } from "@/types/operations";
import { TrainingCenter } from "./training-center";
import { WorldMap } from "@/components/operations/world-map";

type MainTab = "OPERATIONS" | "TRAINING";
type TacticalStep = "CAMPAIGNS" | "MISSIONS";
type OpTab = "CURRENT" | "PAST";

export function OperationsClient() {
  const [mainTab, setMainTab] = useState<MainTab>("OPERATIONS");
  const [tacticalStep, setTacticalStep] = useState<TacticalStep>("CAMPAIGNS");
  const [opTab, setOpTab] = useState<OpTab>("CURRENT");

  const [campaigns, setCampaigns] = useState<OperationCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<OperationCampaign | null>(null);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [missionsError, setMissionsError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        setCampaignsLoading(true);
        const res = await fetch("/api/operations");
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } catch {
        setCampaigns([]);
      } finally {
        setCampaignsLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) return;
    async function loadCampaignDetail() {
      try {
        setMissionsError(null);
        setMissionsLoading(true);
        const res = await fetch(`/api/operations/${selectedCampaignId}`);
        if (!res.ok) throw new Error("Failed to load campaign detail");
        const data = (await res.json()) as OperationCampaign;
        setSelectedCampaign(data);
      } catch {
        setMissionsError("Unable to load missions for this campaign.");
        setSelectedCampaign(null);
      } finally {
        setMissionsLoading(false);
      }
    }
    loadCampaignDetail();
  }, [selectedCampaignId]);

  // Current = active + planning, sorted so active campaigns appear first
  const currentCampaigns = useMemo(
    () =>
      campaigns
        .filter((c) => c.status === "active" || c.status === "planning")
        .sort((a, b) => {
          if (a.status === "active" && b.status !== "active") return -1;
          if (a.status !== "active" && b.status === "active") return 1;
          return 0;
        }),
    [campaigns],
  );

  const pastCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === "completed"),
    [campaigns],
  );

  const displayedCampaigns = opTab === "CURRENT" ? currentCampaigns : pastCampaigns;

  useEffect(() => {
    if (!selectedCampaignId && displayedCampaigns.length > 0) {
      setSelectedCampaignId(displayedCampaigns[0].id);
    }
  }, [displayedCampaigns, selectedCampaignId]);

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    setTacticalStep("MISSIONS");
  };

  if (campaignsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[180px] rounded-xl" />
          <Skeleton className="h-[180px] rounded-xl" />
          <Skeleton className="h-[180px] rounded-xl hidden lg:block" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-0">
        <TabButton
          active={mainTab === "OPERATIONS"}
          onClick={() => { setMainTab("OPERATIONS"); setTacticalStep("CAMPAIGNS"); }}
        >
          Operations
        </TabButton>
        <TabButton
          active={mainTab === "TRAINING"}
          onClick={() => setMainTab("TRAINING")}
        >
          Training
        </TabButton>
        <Link
          href="/dashboard/operations/sse"
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 mb-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-accent border border-zinc-200 dark:border-zinc-800 hover:border-accent/40 bg-white dark:bg-zinc-900/40 transition-all"
        >
          <Database className="h-3.5 w-3.5" />
          SSE Repository
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {mainTab === "OPERATIONS" ? (
        <div className="space-y-5">
          {tacticalStep === "CAMPAIGNS" ? (
            <CampaignsView
              opTab={opTab}
              setOpTab={(t) => {
                setOpTab(t);
                setSelectedCampaign(null);
                setSelectedCampaignId(null);
              }}
              campaigns={displayedCampaigns}
              onSelect={handleSelectCampaign}
            />
          ) : (
            <MissionsView
              campaign={selectedCampaign}
              loading={missionsLoading}
              error={missionsError}
              onBack={() => {
                setTacticalStep("CAMPAIGNS");
                setSelectedCampaign(null);
                setSelectedCampaignId(null);
                setMissionsError(null);
              }}
            />
          )}
        </div>
      ) : (
        <TrainingCenter />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200 ${
        active
          ? "text-accent"
          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent rounded-full shadow-[0_0_8px_rgba(var(--accent),0.6)]" />
      )}
    </button>
  );
}

function CampaignsView({
  opTab,
  setOpTab,
  campaigns,
  onSelect,
}: {
  opTab: OpTab;
  setOpTab: (t: OpTab) => void;
  campaigns: OperationCampaign[];
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <div className="inline-flex items-center bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
        <button
          onClick={() => setOpTab("CURRENT")}
          className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${
            opTab === "CURRENT"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          }`}
        >
          Current Operations
        </button>
        <button
          onClick={() => setOpTab("PAST")}
          className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${
            opTab === "PAST"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          }`}
        >
          Past Operations
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-950/30">
          <ShieldAlert className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-zinc-400 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider">
            No {opTab === "CURRENT" ? "active or upcoming" : "past"} operations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onSelect={() => onSelect(campaign.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function CampaignCard({
  campaign,
  onSelect,
}: {
  campaign: OperationCampaign;
  onSelect: () => void;
}) {
  const clr = getClassification(campaign.minimum_role);
  const statusCfg = getOpStatus(campaign.status);

  // Fallback images from existing project assets – rotated by campaign hash
  const FALLBACK_IMAGES = [
    "/images/tacdev/tacdev-night-boat-raid.png",
    "/images/tacdev/soldiers-looking-sun.png",
    "/images/tacdev/tacdev-4man.png",
    "/images/160th/160th-lil-bird-loaded.png",
    "/images/tacdev/tacdev-boat-night.png",
    "/images/3-troops-walking-lil-bird.png",
    "/images/tacdev/tacdev-night-forest-fire.png",
    "/images/160th/160th-lil-birds-day-loaded.png",
  ];

  const imgIndex = campaign.id
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0) % FALLBACK_IMAGES.length;
  const coverImage = campaign.cover_image_url || FALLBACK_IMAGES[imgIndex];

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 hover:border-accent/40 relative"
    >
      {/* Cover Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={coverImage}
          alt={campaign.codename || campaign.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Status Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {statusCfg.pulse && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
          )}
          <Badge
            variant="outline"
            className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 backdrop-blur-sm bg-black/30 border-white/20 ${statusCfg.text}`}
          >
            {statusCfg.label}
          </Badge>
        </div>

        {/* Classification Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 backdrop-blur-sm ${clr.bg} ${clr.text} ${clr.border}`}
          >
            {clr.label}
          </Badge>
        </div>

        {/* Title overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-bold uppercase tracking-wider leading-tight drop-shadow-lg line-clamp-1">
            {campaign.codename || campaign.name}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {campaign.brief || campaign.description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {campaign.ao && (
            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md font-medium">
              <MapPin className="h-2.5 w-2.5" />
              {campaign.ao}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md font-medium">
            <Clock className="h-2.5 w-2.5" />
            {campaign.start_date}
          </span>
          {(campaign.mission_count ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-md font-bold">
              <Crosshair className="h-2.5 w-2.5" />
              {campaign.mission_count} missions
            </span>
          )}
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-accent transition-colors flex items-center gap-1">
            View missions
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

function MissionsView({
  campaign,
  loading,
  error,
  onBack,
}: {
  campaign: OperationCampaign | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 dark:text-zinc-500 hover:text-accent transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to campaigns
          </button>
          <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            {campaign?.codename || campaign?.name || "Campaign"}
          </h2>
        </div>
        <Link
          href="/dashboard/operations/sse"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-accent border border-zinc-200 dark:border-zinc-800 hover:border-accent/40 transition-all"
        >
          <Database className="h-3.5 w-3.5" />
          Open SSE
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Area Map
              </span>
              <Badge
                variant="outline"
                className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-200 bg-amber-500/10"
              >
                Coming soon
              </Badge>
            </div>
            <div className="relative">
              <div className="opacity-35">
                <WorldMap lat={0} lng={0} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-white/80 dark:bg-black/60 backdrop-blur text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                  Coming soon
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                Mission Cards
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-16 text-zinc-400 gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs uppercase tracking-wider">Loading&hellip;</span>
                </div>
              )}

              {!loading && error && (
                <div className="rounded-xl border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs text-red-600 dark:text-red-200 font-mono">
                  {error}
                </div>
              )}

              {!loading && campaign && <MissionList campaign={campaign} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MissionList({ campaign }: { campaign: OperationCampaign }) {
  const missions = campaign.missions ?? [];

  if (missions.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs uppercase tracking-wider border border-dashed border-zinc-300 dark:border-zinc-700/80 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40">
        No missions are currently configured for this campaign.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} campaign={campaign} />
      ))}
    </div>
  );
}

function MissionCard({
  mission,
  campaign,
}: {
  mission: OperationMission;
  campaign: OperationCampaign;
}) {
  const statusCfg = getOpStatus(
    mission.status === "completed"
      ? "completed"
      : mission.status === "scheduled"
        ? campaign.status
        : "active",
  );

  return (
    <div className="group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-accent/30 bg-zinc-50 dark:bg-zinc-950/50 transition-all duration-200 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20">
      <div className="relative flex">
        <div className={`w-1 ${statusCfg.barColor} shrink-0`} />
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {statusCfg.pulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                )}
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  {mission.name}
                </h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {mission.description}
              </p>
            </div>
            <Link href={`/dashboard/operations/${campaign.id}`}>
              <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-accent transition-colors" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
              {mission.date} @ {mission.time}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
              {mission.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Crosshair className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
              {campaign.mission_type || "Direct Action"}
            </div>
            {mission.max_personnel && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                {mission.max_personnel} max
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-end">
            <Link
              href={`/dashboard/operations/${campaign.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-accent hover:bg-accent/5 transition-all"
            >
              Open campaign
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
