"use client";

import { useState, useRef, useTransition, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/app/[locale]/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/[locale]/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Check, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown,
  Copy, Download, Linkedin, Instagram,
  Briefcase, Clock, GraduationCap, FileText, Laptop, Timer,
  MapPin, StickyNote, Pencil, Eye,
  type LucideIcon,
} from "lucide-react";
import { markJobAsPosted, unmarkJobAsPosted } from "@/actions/admin/job-social";
import type { JobSocialPost } from "@/actions/admin/job-social";
import {
  generateDailyPost,
  generateSpotlight,
  generateStory,
  generateAnnouncement,
  type JobPost,
  type Platform,
  type PostFormat,
  POST_FORMATS,
} from "@/constants/social-posts";
import { EMPLOYMENT_TYPE_OPTIONS } from "@/constants/job";
import { MarkdownHooks as Markdown } from "react-markdown";

// --- Types ---

type StyleVariant = "professional" | "bold-pink" | "duotone" | "minimal" | "dark" | "card" | "announcement";

const STYLE_VARIANTS: { value: StyleVariant; label: string }[] = [
  { value: "announcement", label: "New Job!" },
  { value: "professional", label: "Professional" },
  { value: "bold-pink", label: "Bold Pink" },
  { value: "duotone", label: "Duotone" },
  { value: "minimal", label: "Minimal" },
  { value: "dark", label: "Dark" },
  { value: "card", label: "Card" },
];

interface CardOptions {
  showSalary: boolean;
  showRequirements: boolean;
  showBranding: boolean;
  showLocation: boolean;
}

// Job offer type from DB (inferred from getActiveJobOffers)
interface JobOffer {
  id: string;
  title: string;
  description: string;
  company_name: string | null;
  location: string;
  employment_type: string | null;
  experience_level: string | null;
  salary: string | null;
  requirements: unknown;
  tags: unknown;
  industry: string;
  source_url: string;
  through_recruiter: boolean;
  [key: string]: unknown;
}

const EMPLOYMENT_TYPE_ICONS: Record<string, LucideIcon> = {
  "CDI": Briefcase,
  "Full-time": Briefcase,
  "CDD": Clock,
  "Part-time": Clock,
  "Alternance": GraduationCap,
  "Internship": GraduationCap,
  "Contract": FileText,
  "Freelance": Laptop,
  "Interim": Timer,
};

function formatExperienceShort(level: string | null): string {
  if (!level) return "";
  const map: Record<string, string> = {
    "0-2": "0-2 ans",
    "3-5": "3-5 ans",
    "6-10": "6-10 ans",
    "10+": "10+ ans",
  };
  return map[level] ?? level;
}

function toJobPost(job: JobOffer): JobPost {
  return {
    id: job.id,
    title: job.title,
    company_name: job.company_name,
    location: job.location,
    employment_type: job.employment_type,
    experience_level: job.experience_level,
    salary: job.salary,
    requirements: Array.isArray(job.requirements) ? job.requirements as string[] : null,
    tags: Array.isArray(job.tags) ? job.tags as string[] : null,
    industry: job.industry,
    source_url: job.source_url,
    description: job.description,
    through_recruiter: job.through_recruiter,
  };
}

function generateCaption(job: JobOffer, format: PostFormat, platform: Platform): string {
  const jobPost = toJobPost(job);
  switch (format) {
    case "daily":
      return generateDailyPost(jobPost, platform);
    case "announcement":
      return generateAnnouncement(jobPost, platform);
    case "spotlight":
      return generateSpotlight([jobPost], job.industry, platform);
    case "story":
      return generateStory(jobPost);
    case "weekly":
      return generateDailyPost(jobPost, platform);
    default:
      return generateDailyPost(jobPost, platform);
  }
}

// --- Component ---

interface JobSocialRendererProps {
  initialJobs: JobOffer[];
  initialPosts: JobSocialPost[];
}

export function JobSocialRenderer({ initialJobs, initialPosts }: JobSocialRendererProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobs[0]?.id || "");
  const [styleVariant, setStyleVariant] = useState<StyleVariant>("professional");
  const [postFormat, setPostFormat] = useState<PostFormat>("daily");
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [posts, setPosts] = useState<JobSocialPost[]>(initialPosts);
  const [caption, setCaption] = useState(() =>
    initialJobs[0] ? generateCaption(initialJobs[0], "daily", "linkedin") : ""
  );
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const [cardOptions, setCardOptions] = useState<CardOptions>({
    showSalary: true,
    showRequirements: true,
    showBranding: true,
    showLocation: true,
  });

  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [notesMode, setNotesMode] = useState<"edit" | "preview">("edit");
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("job-social-admin-notes");
    if (saved) setNotes(saved);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("job-social-admin-notes", notes);
    }, 500);
    return () => clearTimeout(timeout);
  }, [notes]);

  const autoResizeNotes = useCallback(() => {
    const el = notesRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    if (showNotes && notesMode === "edit") autoResizeNotes();
  }, [notes, showNotes, notesMode, autoResizeNotes]);

  const autoResizeCaption = useCallback(() => {
    const el = captionRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    autoResizeCaption();
  }, [caption, autoResizeCaption]);

  const currentJob = initialJobs.find((j) => j.id === selectedJobId);

  const postedMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const p of posts) {
      if (!map.has(p.job_offer_id)) map.set(p.job_offer_id, new Set());
      map.get(p.job_offer_id)!.add(p.platform);
    }
    return map;
  }, [posts]);

  // Group jobs by employment_type
  const groupedJobs = useMemo(() => {
    const groups: { type: string; label: string; jobs: JobOffer[] }[] = [];
    const typeMap = new Map<string, JobOffer[]>();

    for (const job of initialJobs) {
      const type = job.employment_type ?? "Other";
      const group = typeMap.get(type) ?? [];
      group.push(job);
      typeMap.set(type, group);
    }

    // Sort by EMPLOYMENT_TYPE_OPTIONS order
    const typeOrder: string[] = EMPLOYMENT_TYPE_OPTIONS.map((o) => o.value);
    const sortedTypes = [...typeMap.keys()].sort((a, b) => {
      const ai = typeOrder.indexOf(a);
      const bi = typeOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    for (const type of sortedTypes) {
      const jobs = typeMap.get(type)!;
      const opt = EMPLOYMENT_TYPE_OPTIONS.find((o) => o.value === type);
      groups.push({ type, label: opt?.label ?? type, jobs });
    }

    return groups;
  }, [initialJobs]);

  const selectJob = (job: JobOffer) => {
    setSelectedJobId(job.id);
    setCaption(generateCaption(job, postFormat, platform));
    setCopied(false);
  };

  const toggleGroup = (type: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const toggleCardOption = (key: keyof CardOptions) => {
    setCardOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTogglePlatform = (jobId: string, p: "linkedin" | "instagram") => {
    const isPosted = postedMap.get(jobId)?.has(p) ?? false;

    setPosts((prev) => {
      if (isPosted) {
        return prev.filter((x) => !(x.job_offer_id === jobId && x.platform === p));
      } else {
        return [...prev, { id: 0, job_offer_id: jobId, platform: p, posted_at: new Date().toISOString() }];
      }
    });

    startTransition(async () => {
      if (isPosted) {
        await unmarkJobAsPosted(jobId, p);
      } else {
        await markJobAsPosted(jobId, p);
      }
    });
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsImage = async () => {
    if (!cardRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      const company = currentJob?.company_name?.replace(/\s+/g, "-").toLowerCase() ?? "job";
      link.download = `oumamie-job-${company}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  // Regenerate caption when format or platform changes
  const handleFormatChange = (f: PostFormat) => {
    setPostFormat(f);
    if (currentJob) setCaption(generateCaption(currentJob, f, platform));
  };

  const handlePlatformChange = (p: Platform) => {
    setPlatform(p);
    if (currentJob) setCaption(generateCaption(currentJob, postFormat, p));
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Left panel - job list */}
      <div className="w-[380px] shrink-0 flex flex-col gap-3">
        {/* Style + format selectors */}
        <div className="flex gap-2">
          <Select value={styleVariant} onValueChange={(v) => setStyleVariant(v as StyleVariant)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STYLE_VARIANTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={postFormat} onValueChange={(v) => handleFormatChange(v as PostFormat)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POST_FORMATS.filter((f) => f.value !== "weekly").map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Collapse/Expand all */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              const allTypes = groupedJobs.map((g) => g.type);
              const allCollapsed = allTypes.every((t) => collapsedGroups.has(t));
              if (allCollapsed) {
                setCollapsedGroups(new Set());
              } else {
                setCollapsedGroups(new Set(allTypes));
              }
            }}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {groupedJobs.every((g) => collapsedGroups.has(g.type)) ? (
              <>
                <ChevronsUpDown className="h-3.5 w-3.5" />
                Expand all
              </>
            ) : (
              <>
                <ChevronsDownUp className="h-3.5 w-3.5" />
                Collapse all
              </>
            )}
          </button>
        </div>

        {/* Scrollable grouped job list */}
        <div className="flex-1 overflow-y-auto pr-1">
          {groupedJobs.map((group) => {
            const isCollapsed = collapsedGroups.has(group.type);
            const postedCount = group.jobs.filter((j) => postedMap.has(j.id)).length;
            const Icon = EMPLOYMENT_TYPE_ICONS[group.type] ?? Briefcase;

            return (
              <div key={group.type} className="mb-2">
                <button
                  onClick={() => toggleGroup(group.type)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-muted rounded-md transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <Icon className="h-3.5 w-3.5 text-pink shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-pink">
                    {group.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {group.jobs.length}
                  </span>
                  {postedCount > 0 && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {postedCount} posted
                    </span>
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 ml-2">
                    {group.jobs.map((job) => {
                      const platforms = postedMap.get(job.id);
                      const isSelected = job.id === selectedJobId;

                      return (
                        <button
                          key={job.id}
                          onClick={() => selectJob(job)}
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg border transition-colors",
                            isSelected
                              ? "border-pink bg-pink-muted"
                              : "border-transparent hover:bg-muted"
                          )}
                        >
                          <p className="text-sm font-medium leading-snug">
                            {job.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-pink font-medium">
                              {job.company_name ?? "Confidentiel"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {job.location}
                            </span>
                            <span className="ml-auto flex items-center gap-1">
                              {platforms?.has("linkedin") && (
                                <Linkedin className="h-3 w-3 text-blue-600" />
                              )}
                              {platforms?.has("instagram") && (
                                <Instagram className="h-3 w-3 text-pink" />
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel - preview + post tools */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-4">
          {currentJob ? (
            <>
              {/* Card toggles */}
              <div className="w-[540px] flex items-center gap-3 flex-wrap">
                {(
                  [
                    { key: "showSalary", label: "Salary" },
                    { key: "showRequirements", label: "Requirements" },
                    { key: "showBranding", label: "Branding" },
                    { key: "showLocation", label: "Location" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleCardOption(key)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border transition-colors",
                      cardOptions[key]
                        ? "bg-pink text-white border-pink"
                        : "bg-transparent text-muted-foreground border-border hover:border-pink/50"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Preview card */}
              <div
                ref={cardRef}
                className="w-[540px] h-[540px] overflow-hidden rounded-lg shadow-lg shrink-0"
                style={{ aspectRatio: "1/1" }}
              >
                <JobCard job={currentJob} variant={styleVariant} options={cardOptions} />
              </div>

              {/* Actions row */}
              <div className="w-[540px] flex items-center justify-between">
                <p className="text-xs text-muted-foreground">1080x1080 at 2x</p>
                <Button size="sm" onClick={downloadAsImage}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
              </div>

              {/* Post content section */}
              <div className="w-[540px] space-y-3">
                {/* Platform selector */}
                <div className="flex gap-2">
                  {(["linkedin", "instagram", "x"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePlatformChange(p)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border transition-colors capitalize",
                        platform === p
                          ? "bg-pink text-white border-pink"
                          : "bg-transparent text-muted-foreground border-border hover:border-pink/50"
                      )}
                    >
                      {p === "x" ? "X (Twitter)" : p === "linkedin" ? "LinkedIn" : "Instagram"}
                    </button>
                  ))}
                </div>

                {/* Caption */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Caption</label>
                  <textarea
                    ref={captionRef}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink/50"
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">{caption.length} chars</span>
                    <Button size="sm" variant="outline" onClick={copyCaption}>
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy caption
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Platform checkboxes */}
                <div className="flex items-center gap-4 pt-2 pb-4">
                  <span className="text-sm font-medium">Posted to:</span>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={postedMap.get(currentJob.id)?.has("linkedin") ?? false}
                      onChange={() => handleTogglePlatform(currentJob.id, "linkedin")}
                      disabled={isPending}
                      className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                    />
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">LinkedIn</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={postedMap.get(currentJob.id)?.has("instagram") ?? false}
                      onChange={() => handleTogglePlatform(currentJob.id, "instagram")}
                      disabled={isPending}
                      className="h-4 w-4 rounded border-gray-300 accent-pink-500"
                    />
                    <Instagram className="h-4 w-4 text-pink" />
                    <span className="text-sm">Instagram</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className="w-[540px] h-[540px] flex items-center justify-center border border-dashed rounded-lg">
              <p className="text-muted-foreground">Select a job from the left panel.</p>
            </div>
          )}

          {/* Notes section */}
          <div className="w-[540px] border-t pt-4 mt-2">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <StickyNote className="h-4 w-4" />
              <span>Content Notes</span>
              {showNotes ? (
                <ChevronDown className="h-3.5 w-3.5 ml-auto" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              )}
            </button>

            {showNotes && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setNotesMode("edit")}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1",
                      notesMode === "edit"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => setNotesMode("preview")}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1",
                      notesMode === "preview"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                  <span className="text-xs text-muted-foreground ml-auto">auto-saved</span>
                </div>

                {notesMode === "edit" ? (
                  <textarea
                    ref={notesRef}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write content ideas, upcoming posts, topics to cover..."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink/50 min-h-[120px]"
                  />
                ) : (
                  <div className="rounded-lg border bg-background px-4 py-3 prose prose-sm prose-neutral dark:prose-invert max-w-none min-h-[120px] [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_p]:text-sm [&_li]:text-sm [&_ul]:my-1 [&_ol]:my-1">
                    {notes.trim() ? (
                      <Markdown>{notes}</Markdown>
                    ) : (
                      <p className="text-muted-foreground italic">No notes yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// JOB CARD VARIANTS
// ============================================

interface JobCardProps {
  job: JobOffer;
  variant: StyleVariant;
  options: CardOptions;
}

function JobCard({ job, variant, options }: JobCardProps) {
  const company = job.company_name ?? "Entreprise confidentielle";
  const reqs = Array.isArray(job.requirements) ? (job.requirements as string[]).slice(0, 3) : [];
  const type = job.employment_type ?? "";
  const exp = formatExperienceShort(job.experience_level);
  const TypeIcon = EMPLOYMENT_TYPE_ICONS[type] ?? Briefcase;
  const baseClasses = "w-full h-full flex flex-col justify-between p-12 relative overflow-hidden";

  if (variant === "announcement") {
    return (
      <div className={cn(baseClasses, "bg-white")}>
        {/* Top accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-emerald-400 via-emerald-500 to-teal-500" />
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-teal-50/50 blur-3xl" />

        {/* Header: badge + location */}
        <div className="relative z-10 space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider">Nouvelle offre</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200">
              <TypeIcon className="w-3 h-3 text-neutral-600" />
              <span className="text-xs font-semibold text-neutral-700">{type}</span>
            </div>
            {options.showLocation && (
              <div className="flex items-center gap-1 text-neutral-500">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{job.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-3">
          <p className="text-[1.65rem] leading-snug font-bold text-neutral-900">{job.title}</p>
          <p className="text-lg text-emerald-600 font-semibold">{company}</p>
          <div className="flex flex-wrap items-center gap-2">
            {options.showSalary && job.salary && (
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                {job.salary}
              </span>
            )}
            {exp && (
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                {exp}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 space-y-3">
          {options.showRequirements && reqs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {reqs.map((r, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-md bg-neutral-50 text-neutral-600 border border-neutral-200">
                  {r}
                </span>
              ))}
            </div>
          )}
          {options.showBranding && (
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-800">Oumamie</p>
                  <p className="text-[10px] text-neutral-400">Plateforme emploi aromaticiens</p>
                </div>
              </div>
              <span className="text-xs text-emerald-500 font-semibold">Connexion requise</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "professional") {
    return (
      <div className={cn(baseClasses, "bg-white")}>
        <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-pink-500 via-pink-400 to-pink-300" />

        <div className="relative z-10 pl-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20">
            <TypeIcon className="w-3.5 h-3.5 text-pink-600" />
            <span className="text-xs font-semibold text-pink-700 uppercase tracking-wider">{type}</span>
          </div>
          {options.showLocation && (
            <div className="flex items-center gap-1.5 text-neutral-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">{job.location}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center pl-6 space-y-2">
          <p className="text-2xl leading-snug font-bold text-neutral-900">{job.title}</p>
          <p className="text-lg text-pink-600 font-medium">{company}</p>
          {options.showSalary && job.salary && (
            <p className="text-sm text-neutral-600">{job.salary}</p>
          )}
          {exp && <p className="text-sm text-neutral-500">{exp}</p>}
        </div>

        <div className="relative z-10 pl-6 space-y-3">
          {options.showRequirements && reqs.length > 0 && (
            <div className="space-y-1">
              {reqs.map((r, i) => (
                <p key={i} className="text-xs text-neutral-600">• {r}</p>
              ))}
            </div>
          )}
          {options.showBranding && (
            <div className="flex items-center gap-2 pt-2">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                <span className="text-white font-semibold">O</span>
              </div>
              <span className="font-medium text-neutral-700 text-sm">oumamie</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "bold-pink") {
    return (
      <div className={cn(baseClasses, "bg-pink-600")}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-pink-900/30 blur-3xl" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <TypeIcon className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white uppercase tracking-wider">{type}</span>
          </div>
          {options.showLocation && (
            <div className="flex items-center gap-1.5 text-white/80">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">{job.location}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-2">
          <p className="text-2xl leading-snug font-bold text-white">{job.title}</p>
          <p className="text-xl text-white/90 font-medium">{company}</p>
          {options.showSalary && job.salary && (
            <div className="inline-flex self-start px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-sm text-white font-medium">{job.salary}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 flex items-center justify-between">
          {options.showBranding && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <span className="text-pink-600 font-bold text-xl">O</span>
              </div>
              <div>
                <p className="font-bold text-white text-lg">Oumamie</p>
                <p className="text-sm text-white/70">#FlavorJobs</p>
              </div>
            </div>
          )}
          {exp && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">{exp}</span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "duotone") {
    return (
      <div className="w-full h-full flex relative overflow-hidden">
        {/* Left pink panel */}
        <div className="w-[38%] bg-pink-600 p-10 flex flex-col justify-between relative">
          <div className="absolute inset-0 bg-linear-to-b from-pink-500/30 to-transparent" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-white/80" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">{type}</span>
            </div>
            <p className="text-lg font-bold text-white leading-tight">{company}</p>
          </div>
          {options.showBranding && (
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <p className="text-xs text-white/60 tracking-wider uppercase">Oumamie</p>
            </div>
          )}
        </div>
        {/* Right white panel */}
        <div className="flex-1 bg-white p-10 flex flex-col justify-between">
          {options.showLocation && (
            <div className="flex items-center gap-1.5 text-pink-400">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-widest">{job.location}</span>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xl leading-snug text-neutral-800 font-bold">{job.title}</p>
            {options.showSalary && job.salary && (
              <p className="text-sm text-pink-600 font-medium">{job.salary}</p>
            )}
            {exp && <p className="text-sm text-neutral-500">{exp}</p>}
          </div>
          {options.showRequirements && reqs.length > 0 && (
            <div className="space-y-1">
              {reqs.map((r, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded bg-pink-50 text-pink-600 font-medium inline-block mr-1 mb-1">
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={cn(baseClasses, "bg-neutral-50")}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-400 via-pink-500 to-pink-400" />

        <div className="relative z-10 space-y-2 pt-4">
          <div className="flex items-center gap-2">
            <TypeIcon className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-xs font-medium uppercase tracking-widest text-pink-500">{type}</span>
          </div>
          {options.showLocation && (
            <p className="text-sm text-neutral-500">{job.location}</p>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-2">
          <p className="text-2xl leading-snug text-neutral-800 font-semibold">{job.title}</p>
          <p className="text-base text-neutral-500">{company}</p>
          {options.showSalary && job.salary && (
            <p className="text-sm text-neutral-600">{job.salary}</p>
          )}
        </div>

        <div className="relative z-10 flex items-center justify-between">
          {options.showBranding && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                <span className="text-white font-semibold">O</span>
              </div>
              <span className="font-medium text-neutral-700 text-sm">oumamie</span>
            </div>
          )}
          <p className={cn("text-xs text-neutral-400", !options.showBranding && "ml-auto")}>@oumamie</p>
        </div>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div className={cn(baseClasses, "bg-neutral-900")}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(236,72,153,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-pink-500/30 bg-pink-500/10">
            <TypeIcon className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-mono text-pink-300 uppercase tracking-wider">{type}</span>
          </div>
          {options.showLocation && (
            <div className="flex items-center gap-1.5 text-neutral-400">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm font-mono">{job.location}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-2">
          <p className="text-2xl leading-snug font-medium text-neutral-100">{job.title}</p>
          <p className="text-lg text-pink-400">{company}</p>
          {options.showSalary && job.salary && (
            <span className="text-sm font-mono text-pink-300/80">{job.salary}</span>
          )}
          {exp && <span className="text-sm font-mono text-neutral-500">{exp}</span>}
        </div>

        <div className="relative z-10 flex items-center justify-between">
          {options.showBranding && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded border border-pink-500/40 flex items-center justify-center">
                <span className="text-pink-400 font-mono font-bold">O</span>
              </div>
              <div>
                <p className="font-mono text-sm text-neutral-300">oumamie</p>
                <p className="text-xs text-neutral-600 font-mono">#FlavorJobs</p>
              </div>
            </div>
          )}
          {options.showRequirements && reqs.length > 0 && (
            <div className={cn("flex flex-wrap gap-1 justify-end max-w-[220px]", !options.showBranding && "ml-auto")}>
              {reqs.map((r, i) => (
                <span key={i} className="text-xs font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-400/80 border border-pink-500/20">
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={cn(baseClasses, "bg-white")}>
      <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-pink-400 via-pink-500 to-pink-400" />

      <div className="relative z-10 flex items-center justify-between pt-2">
        <p className="text-sm font-semibold text-neutral-800">{company}</p>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10">
          <TypeIcon className="w-3 h-3 text-pink-600" />
          <span className="text-xs font-semibold text-pink-700">{type}</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center space-y-3">
        <p className="text-2xl leading-snug font-bold text-neutral-900">{job.title}</p>
        <div className="h-px bg-neutral-200" />
        <div className="grid grid-cols-2 gap-2 text-sm">
          {options.showLocation && (
            <div className="flex items-center gap-1.5 text-neutral-600">
              <MapPin className="w-3.5 h-3.5 text-pink-500" />
              <span>{job.location}</span>
            </div>
          )}
          {options.showSalary && job.salary && (
            <p className="text-neutral-600">{job.salary}</p>
          )}
          {exp && <p className="text-neutral-500">{exp}</p>}
        </div>
      </div>

      {options.showRequirements && reqs.length > 0 && (
        <div className="relative z-10 space-y-1 pb-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Profil</p>
          {reqs.map((r, i) => (
            <p key={i} className="text-xs text-neutral-600">• {r}</p>
          ))}
        </div>
      )}

      {options.showBranding && (
        <div className="relative z-10 flex items-center gap-2 pt-2 border-t border-neutral-100">
          <div className="w-7 h-7 rounded bg-pink-600 flex items-center justify-center">
            <span className="text-white font-black text-xs">O</span>
          </div>
          <div>
            <p className="font-black text-neutral-800 text-xs uppercase tracking-wider">Oumamie</p>
            <p className="text-xs text-pink-400">#FlavorJobs</p>
          </div>
        </div>
      )}
    </div>
  );
}
