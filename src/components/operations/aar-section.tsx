"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  User,
} from "lucide-react";
import { roleHierarchy, UserRole } from "@/types/database";
import type { AfterActionReport } from "@/types/operations";

const AAR_MIN_LEVEL = roleHierarchy[UserRole.instructor] ?? 50;
const REVIEW_ROLES = [
  UserRole.admin,
  UserRole.superAdmin,
  UserRole.developer,
  UserRole.intelligence,
  UserRole.trainingAndDevelopment,
];

const STATUS_STYLES: Record<
  string,
  { text: string; bg: string; border: string; label: string }
> = {
  draft: {
    text: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/40",
    label: "DRAFT",
  },
  submitted: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
    label: "PENDING REVIEW",
  },
  reviewed: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/40",
    label: "REVIEWED",
  },
};

export function AarSection({
  campaignId,
  missionId,
  userRoles = [],
}: {
  campaignId: string;
  missionId?: string;
  userRoles: string[];
}) {
  const [aars, setAars] = useState<AfterActionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [keyOutcomes, setKeyOutcomes] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userLevel = Math.max(0, ...userRoles.map((r) => roleHierarchy[r] || 0));
  const canSubmit = userLevel >= AAR_MIN_LEVEL;
  const canReview = userRoles.some((r) =>
    REVIEW_ROLES.some((allowed) => allowed === r)
  );

  const loadAars = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (campaignId) params.set("campaignId", campaignId);
      if (missionId) params.set("missionId", missionId);

      const res = await fetch(`/api/aar?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAars(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load AARs:", err);
    } finally {
      setLoading(false);
    }
  }, [campaignId, missionId]);

  useEffect(() => {
    void loadAars();
  }, [loadAars]);

  async function handleSubmit() {
    if (!title || !summary) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/aar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          missionId: missionId || null,
          title,
          summary,
          keyOutcomes: keyOutcomes || null,
          lessonsLearned: lessonsLearned || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit AAR");
      }
      // Reset form and reload
      setTitle("");
      setSummary("");
      setKeyOutcomes("");
      setLessonsLearned("");
      setShowForm(false);
      await loadAars();
    } catch (err: any) {
      setError(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReview(aarId: number, status: string) {
    try {
      await fetch(`/api/aar/${aarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setAars((prev) =>
        prev.map((a) => (a.id === aarId ? { ...a, status: status as any } : a))
      );
    } catch (err) {
      console.error("Failed to update AAR status:", err);
    }
  }

  const statusStyle = (s: string) => STATUS_STYLES[s] || STATUS_STYLES.draft;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" />
          <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            After Action Reports
          </h3>
          <Badge
            variant="outline"
            className="text-[9px] font-bold border-zinc-300 dark:border-zinc-700 text-zinc-500"
          >
            {aars.length} {aars.length === 1 ? "Report" : "Reports"}
          </Badge>
        </div>
        {canSubmit && !showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="h-7 text-[10px] font-bold uppercase tracking-wider bg-accent hover:bg-accent/80 text-black"
          >
            <Plus className="h-3 w-3 mr-1" />
            Submit AAR
          </Button>
        )}
      </div>

      {/* Submit Form */}
      {showForm && (
        <Card className="border border-accent/30 bg-white dark:bg-zinc-900/60 rounded-lg">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/60 pb-2 p-4">
            <CardTitle className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2">
              <Send className="h-3.5 w-3.5" />
              New After Action Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-200 font-mono">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Report Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Operation TRIDENT FURY - Phase 2 Debrief"
                className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Executive Summary
              </label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Provide a concise overview of mission execution, objectives achieved, and overall outcome..."
                className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700 text-sm min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Key Outcomes
                </label>
                <Textarea
                  value={keyOutcomes}
                  onChange={(e) => setKeyOutcomes(e.target.value)}
                  placeholder="Objectives met, enemy disposition, captured materials..."
                  className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700 text-sm min-h-[80px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Lessons Learned
                </label>
                <Textarea
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  placeholder="Tactical adjustments, equipment notes, coordination improvements..."
                  className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700 text-sm min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || !title || !summary}
                className="h-8 text-xs bg-accent hover:bg-accent/80 text-black font-bold uppercase tracking-wider"
              >
                {submitting && (
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                )}
                Submit Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AAR List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      ) : aars.length === 0 ? (
        <div className="py-12 text-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/30">
          <FileText className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500 font-mono uppercase tracking-wider">
            No after action reports submitted
          </p>
          {canSubmit && (
            <p className="text-xs text-zinc-400 mt-1">
              Click &quot;Submit AAR&quot; above to create one
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {aars.map((aar) => {
            const style = statusStyle(aar.status);
            const isExpanded = expandedId === aar.id;

            return (
              <div
                key={aar.id}
                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 rounded-lg overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                {/* Row header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : aar.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider truncate">
                        {aar.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-[9px] uppercase font-bold tracking-wider shrink-0 ${style.bg} ${style.text} ${style.border}`}
                      >
                        {style.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <User className="h-2.5 w-2.5" />
                        {aar.submitter_name || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(aar.created_at).toLocaleDateString()}
                      </span>
                      {aar.mission_name && (
                        <span className="text-accent/80 font-medium">
                          {aar.mission_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800/60 px-4 py-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/40">
                    <div>
                      <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        Executive Summary
                      </h5>
                      <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {aar.summary}
                      </p>
                    </div>

                    {aar.key_outcomes && (
                      <div>
                        <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                          Key Outcomes
                        </h5>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {aar.key_outcomes}
                        </p>
                      </div>
                    )}

                    {aar.lessons_learned && (
                      <div>
                        <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                          Lessons Learned
                        </h5>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {aar.lessons_learned}
                        </p>
                      </div>
                    )}

                    {aar.reviewed_by && (
                      <div className="flex items-center gap-2 text-xs text-emerald-500 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Reviewed by {aar.reviewer_name || "Unknown"} on{" "}
                        {aar.reviewed_at
                          ? new Date(aar.reviewed_at).toLocaleDateString()
                          : "—"}
                      </div>
                    )}

                    {/* Review actions for J-2/admin */}
                    {canReview && aar.status === "submitted" && (
                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/60">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-2">
                          Intelligence Review:
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] font-bold uppercase tracking-wider border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                          onClick={() => handleReview(aar.id, "reviewed")}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mark Reviewed
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
