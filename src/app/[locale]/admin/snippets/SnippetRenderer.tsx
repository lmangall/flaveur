"use client";

import { useState, useRef, useTransition, useMemo, useEffect, useCallback } from "react";
import { AROME_FACTS, FACT_CATEGORIES, type AromeFact, type FactCategory } from "@/constants/arome-facts";
import { Button } from "@/app/[locale]/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/[locale]/components/ui/select";
import { cn } from "@/app/lib/utils";
import {
  Check, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown,
  Copy, Download, Linkedin, Instagram, Sparkles,
  Atom, Leaf, BarChart3, Target, Flame, FlipHorizontal2,
  FlaskConical, Zap, Droplets, Shield, FileCheck,
  Apple, UtensilsCrossed, Factory,
  StickyNote, Pencil, Eye,
  type LucideIcon,
} from "lucide-react";
import { markAsPosted, unmarkAsPosted } from "@/actions/admin/snippets";
import type { SnippetPost } from "@/actions/admin/snippets";
import { FACT_EXPLANATIONS } from "@/constants/snippet-explanations";
import { MarkdownHooks as Markdown } from "react-markdown";

type StyleVariant = "gradient-hue" | "thin-lines" | "minimal" | "bold" | "duotone" | "quote" | "science" | "magazine";

const STYLE_VARIANTS: { value: StyleVariant; label: string }[] = [
  { value: "gradient-hue", label: "Gradient Hue" },
  { value: "thin-lines", label: "Thin Lines" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
  { value: "duotone", label: "Duotone" },
  { value: "quote", label: "Quote" },
  { value: "science", label: "Science" },
  { value: "magazine", label: "Magazine" },
];

interface CardOptions {
  showTags: boolean;
  showMolecule: boolean;
  showBranding: boolean;
  showCategoryIcon: boolean;
}

const CATEGORY_CONTEXT: Record<FactCategory, string> = {
  molecules: "Les molécules aromatiques sont au cœur de la création de saveurs. Chacune possède un profil olfactif unique qui contribue à la complexité des arômes que nous percevons au quotidien.",
  terpenes: "Les terpènes sont des composés naturels produits par les plantes, responsables de leurs arômes caractéristiques. Ils jouent un rôle essentiel en parfumerie et en aromatique.",
  profiles: "Le profil de saveur d'un aliment résulte de l'interaction complexe entre des centaines de molécules volatiles. Comprendre ces profils permet de créer des arômes plus authentiques.",
  thresholds: "Le seuil de perception d'une molécule est la concentration minimale à laquelle elle devient détectable. Cette donnée est cruciale pour doser les arômes avec précision.",
  maillard: "La réaction de Maillard est une transformation chimique entre sucres et acides aminés lors de la cuisson. Elle génère des centaines de composés aromatiques responsables des saveurs grillées et torréfiées.",
  chirality: "La chiralité moléculaire montre que deux molécules miroir peuvent avoir des odeurs totalement différentes. Cette propriété fascine les chimistes et les aromaticiens.",
  formulation: "La formulation aromatique est un art qui combine science et créativité. Le choix des proportions, des solvants et des fixateurs détermine la qualité finale d'un arôme.",
  enhancers: "Les exhausteurs de goût amplifient la perception des saveurs sans apporter leur propre goût. Ils sont largement utilisés dans l'industrie alimentaire pour intensifier les profils gustatifs.",
  solvents: "Les solvants jouent un rôle clé dans la formulation aromatique en permettant la dissolution et la stabilisation des molécules volatiles.",
  stability: "La stabilité des arômes est un défi majeur : chaleur, lumière et pH peuvent altérer les molécules et modifier le profil gustatif d'un produit au fil du temps.",
  regulation: "La réglementation des arômes garantit la sécurité alimentaire. Les organismes comme la FEMA et l'EFSA évaluent chaque substance avant son autorisation.",
  taste: "La perception du goût est un phénomène multisensoriel qui combine l'olfaction, la gustation et même le toucher pour créer notre expérience gustative.",
  cuisine: "La cuisine et l'aromatique partagent les mêmes fondements chimiques. Comprendre les réactions moléculaires permet d'innover et de sublimer les saveurs.",
  industry: "L'industrie aromatique est un secteur en constante évolution, alliant tradition et innovation pour répondre aux attentes des consommateurs du monde entier.",
};

const CATEGORY_HASHTAGS: Record<FactCategory, string[]> = {
  molecules: ["chimie", "moleculesaromatiques", "sciencedesaromes", "chemistry"],
  terpenes: ["terpenes", "plantesaromatiques", "huilesessentielles", "naturalflavors"],
  profiles: ["profildesaveur", "flavorprofile", "sensoryanalysis", "analyseensorielle"],
  thresholds: ["perception", "seuilolfactif", "sensory", "olfaction"],
  maillard: ["maillard", "reactiondemaillard", "cuisson", "browning", "cooking"],
  chirality: ["chiralite", "enantiomeres", "stereochimie", "chirality"],
  formulation: ["formulation", "creationdaromes", "flavordesign", "R&D"],
  enhancers: ["exhausteur", "umami", "flavorenhancer", "gout"],
  solvents: ["solvant", "dissolution", "formulationaromatique"],
  stability: ["stabilite", "conservation", "shelflife", "qualite"],
  regulation: ["reglementation", "FEMA", "securitealimentaire", "foodsafety"],
  taste: ["gout", "perception", "multisensoriel", "tastebuds", "neurogastronomy"],
  cuisine: ["gastronomie", "cuisinemoléculaire", "foodscience", "chef"],
  industry: ["industriearomatique", "innovation", "flavorindustry", "foodtech"],
};

const CATEGORY_ICONS: Record<FactCategory, LucideIcon> = {
  molecules: Atom,
  terpenes: Leaf,
  profiles: BarChart3,
  thresholds: Target,
  maillard: Flame,
  chirality: FlipHorizontal2,
  formulation: FlaskConical,
  enhancers: Zap,
  solvents: Droplets,
  stability: Shield,
  regulation: FileCheck,
  taste: Apple,
  cuisine: UtensilsCrossed,
  industry: Factory,
};

function generateCaption(fact: AromeFact): string {
  const lines = [
    "💡 Le saviez-vous ?",
    "",
    fact.content,
  ];

  // Add fact-specific explanation (fall back to category context)
  const explanation = FACT_EXPLANATIONS[fact.id] || CATEGORY_CONTEXT[fact.category];
  lines.push("", "---", "", explanation);

  if (fact.molecule) {
    lines.push("", `🧪 Molécule : ${fact.molecule}`);
  }

  // Build hashtags: base + category-specific + fact tags
  const baseHashtags = ["oumamie", "aromatique", "flavorist", "sciencedesaromes", "saveurs"];
  const categoryHashtags = CATEGORY_HASHTAGS[fact.category] || [];
  const factTags = fact.tags || [];
  // Deduplicate
  const allHashtags = [...new Set([...baseHashtags, ...categoryHashtags, ...factTags])];
  lines.push("", allHashtags.map((t) => `#${t}`).join(" "));

  return lines.join("\n");
}

interface SnippetRendererProps {
  initialPosts: SnippetPost[];
}

export function SnippetRenderer({ initialPosts }: SnippetRendererProps) {
  const [selectedCategory, setSelectedCategory] = useState<FactCategory | "all">("all");
  const [selectedFactId, setSelectedFactId] = useState<string>(AROME_FACTS[0]?.id || "");
  const [styleVariant, setStyleVariant] = useState<StyleVariant>("gradient-hue");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [posts, setPosts] = useState<SnippetPost[]>(initialPosts);
  const [caption, setCaption] = useState(() => generateCaption(AROME_FACTS[0]));
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const [cardOptions, setCardOptions] = useState<CardOptions>({
    showTags: true,
    showMolecule: true,
    showBranding: true,
    showCategoryIcon: true,
  });

  const toggleCardOption = (key: keyof CardOptions) => {
    setCardOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [notesMode, setNotesMode] = useState<"edit" | "preview">("edit");
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("snippet-admin-notes");
    if (saved) setNotes(saved);
  }, []);

  // Save notes to localStorage (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("snippet-admin-notes", notes);
    }, 500);
    return () => clearTimeout(timeout);
  }, [notes]);

  // Auto-resize notes textarea
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

  const currentFact = AROME_FACTS.find((f) => f.id === selectedFactId);

  // Build a lookup: factId -> Set of platforms
  const postedMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const p of posts) {
      if (!map.has(p.fact_id)) map.set(p.fact_id, new Set());
      map.get(p.fact_id)!.add(p.platform);
    }
    return map;
  }, [posts]);

  // Group facts by category
  const groupedFacts = useMemo(() => {
    const groups: { category: FactCategory; label: string; facts: AromeFact[] }[] = [];
    for (const cat of FACT_CATEGORIES) {
      const facts = AROME_FACTS.filter((f) => f.category === cat.value);
      if (facts.length > 0) {
        if (selectedCategory === "all" || selectedCategory === cat.value) {
          groups.push({ category: cat.value, label: cat.label, facts });
        }
      }
    }
    return groups;
  }, [selectedCategory]);

  const selectFact = (fact: AromeFact) => {
    setSelectedFactId(fact.id);
    setCaption(generateCaption(fact));
    setCopied(false);
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const getCategoryLabel = (category: FactCategory) => {
    return FACT_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const handleTogglePlatform = (factId: string, platform: "linkedin" | "instagram") => {
    const isPosted = postedMap.get(factId)?.has(platform) ?? false;

    // Optimistic update
    setPosts((prev) => {
      if (isPosted) {
        return prev.filter((p) => !(p.fact_id === factId && p.platform === platform));
      } else {
        return [...prev, { id: 0, fact_id: factId, platform, posted_at: new Date().toISOString() }];
      }
    });

    startTransition(async () => {
      if (isPosted) {
        await unmarkAsPosted(factId, platform);
      } else {
        await markAsPosted(factId, platform);
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
      link.download = `oumamie-fact-${currentFact?.id || "snippet"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Left panel - fact list */}
      <div className="w-[420px] shrink-0 flex flex-col gap-3">
        {/* Filters */}
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v as FactCategory | "all"); }}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({AROME_FACTS.length})</SelectItem>
              {FACT_CATEGORIES.map((cat) => {
                const count = AROME_FACTS.filter((f) => f.category === cat.value).length;
                return (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={styleVariant} onValueChange={(v) => setStyleVariant(v as StyleVariant)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STYLE_VARIANTS.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Collapse/Expand all */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              const allCategories = groupedFacts.map((g) => g.category);
              const allCollapsed = allCategories.every((c) => collapsedCategories.has(c));
              if (allCollapsed) {
                setCollapsedCategories(new Set());
              } else {
                setCollapsedCategories(new Set(allCategories));
              }
            }}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {groupedFacts.every((g) => collapsedCategories.has(g.category)) ? (
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

        {/* Scrollable grouped fact list */}
        <div className="flex-1 overflow-y-auto pr-1">
          {groupedFacts.map((group) => {
            const isCollapsed = collapsedCategories.has(group.category);
            const postedCount = group.facts.filter((f) => postedMap.has(f.id)).length;

            return (
              <div key={group.category} className="mb-2">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(group.category)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-muted rounded-md transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  {(() => {
                    const Icon = CATEGORY_ICONS[group.category];
                    return <Icon className="h-3.5 w-3.5 text-pink shrink-0" />;
                  })()}
                  <span className="text-xs font-semibold uppercase tracking-wider text-pink">
                    {group.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {group.facts.length}
                  </span>
                  {postedCount > 0 && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {postedCount} posted
                    </span>
                  )}
                </button>

                {/* Fact items */}
                {!isCollapsed && (
                  <div className="space-y-0.5 ml-2">
                    {group.facts.map((fact) => {
                      const platforms = postedMap.get(fact.id);
                      const isSelected = fact.id === selectedFactId;

                      return (
                        <button
                          key={fact.id}
                          onClick={() => selectFact(fact)}
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg border transition-colors",
                            isSelected
                              ? "border-pink bg-pink-muted"
                              : "border-transparent hover:bg-muted"
                          )}
                        >
                          <p className="text-sm leading-snug">
                            {fact.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {fact.molecule && (
                              <span className="text-xs text-pink font-medium">{fact.molecule}</span>
                            )}
                            {fact.tags && fact.tags.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {fact.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
                              </span>
                            )}
                            {/* Posted indicators */}
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
          {currentFact ? (
            <>
              {/* Content toggles */}
              <div className="w-[540px] flex items-center gap-3 flex-wrap">
                {(
                  [
                    { key: "showTags", label: "Tags" },
                    { key: "showMolecule", label: "Molecule" },
                    { key: "showBranding", label: "Branding" },
                    { key: "showCategoryIcon", label: "Icon" },
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
                <SnippetCard fact={currentFact} variant={styleVariant} getCategoryLabel={getCategoryLabel} options={cardOptions} />
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
                      checked={postedMap.get(currentFact.id)?.has("linkedin") ?? false}
                      onChange={() => handleTogglePlatform(currentFact.id, "linkedin")}
                      disabled={isPending}
                      className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                    />
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">LinkedIn</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={postedMap.get(currentFact.id)?.has("instagram") ?? false}
                      onChange={() => handleTogglePlatform(currentFact.id, "instagram")}
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
              <p className="text-muted-foreground">Select a fact from the left panel.</p>
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
                {/* Edit / Preview toggle */}
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
// SNIPPET CARD VARIANTS
// ============================================

interface SnippetCardProps {
  fact: AromeFact;
  variant: StyleVariant;
  getCategoryLabel: (category: FactCategory) => string;
  options: CardOptions;
}

function SnippetCard({ fact, variant, getCategoryLabel, options }: SnippetCardProps) {
  const baseClasses = "w-full h-full flex flex-col justify-between p-12 relative overflow-hidden";
  const CategoryIcon = CATEGORY_ICONS[fact.category];

  if (variant === "gradient-hue") {
    return (
      <div className={cn(baseClasses, "bg-white")}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-linear-to-br from-pink-200/60 to-pink-400/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-linear-to-tr from-pink-100/50 to-pink-300/20 blur-3xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-linear-to-b from-pink-500 to-pink-400 rounded-full" />
            {options.showCategoryIcon && <CategoryIcon className="w-4 h-4 text-pink-700" />}
            <span className="text-sm font-semibold uppercase tracking-wider text-pink-700">
              {getCategoryLabel(fact.category)}
            </span>
          </div>
          {options.showMolecule && fact.molecule && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/15 border border-pink-500/30">
              <Sparkles className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-bold text-pink-700">{fact.molecule}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <p className="text-2xl leading-relaxed font-semibold text-neutral-900">
            {fact.content}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          {options.showBranding && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <div>
                <p className="font-bold text-neutral-900">Oumamie</p>
                <p className="text-xs text-neutral-600">Le saviez-vous ?</p>
              </div>
            </div>
          )}
          {options.showTags && fact.tags && fact.tags.length > 0 && (
            <div className={cn("flex gap-2", !options.showBranding && "ml-auto")}>
              {fact.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded bg-pink-500/15 text-pink-700 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "thin-lines") {
    return (
      <div className={cn(baseClasses, "bg-white")}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-8 right-8 h-px bg-linear-to-r from-transparent via-pink-400/40 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 h-px bg-linear-to-r from-transparent via-pink-400/40 to-transparent" />
          <div className="absolute top-8 bottom-8 left-8 w-px bg-linear-to-b from-transparent via-pink-400/40 to-transparent" />
          <div className="absolute top-8 bottom-8 right-8 w-px bg-linear-to-b from-transparent via-pink-400/40 to-transparent" />
          <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-pink-500/60" />
          <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-pink-500/60" />
          <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-pink-500/60" />
          <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-pink-500/60" />
        </div>

        <div className="relative z-10 pt-8 space-y-3">
          <div className="flex items-center gap-3">
            {options.showCategoryIcon && <CategoryIcon className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-pink-500">
              {getCategoryLabel(fact.category)}
            </span>
            <div className="flex-1 h-px bg-pink-500/20" />
          </div>
          {options.showMolecule && fact.molecule && (
            <p className="text-lg font-light text-pink-600 tracking-wide">
              {fact.molecule}
            </p>
          )}
        </div>

        <div className="relative z-10 flex-1 flex items-center px-4">
          <p className="text-xl leading-relaxed text-neutral-700 font-light">
            {fact.content}
          </p>
        </div>

        <div className="relative z-10 pb-8 flex items-end justify-between">
          {options.showBranding && (
            <div className="space-y-1">
              <p className="text-2xl font-extralight tracking-[0.3em] text-neutral-800">OUMAMIE</p>
              <div className="w-12 h-0.5 bg-linear-to-r from-pink-500 to-pink-400" />
            </div>
          )}
          <p className={cn("text-xs text-neutral-400 tracking-wider", !options.showBranding && "ml-auto")}>LE SAVIEZ-VOUS ?</p>
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={cn(baseClasses, "bg-neutral-50")}>
        <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-pink-500 via-pink-400 to-pink-300" />

        <div className="relative z-10 pl-6 space-y-2">
          <div className="flex items-center gap-2">
            {options.showCategoryIcon && <CategoryIcon className="w-3.5 h-3.5 text-pink-500" />}
            <span className="text-xs font-medium uppercase tracking-widest text-pink-500">
              {getCategoryLabel(fact.category)}
            </span>
          </div>
          {options.showMolecule && fact.molecule && (
            <p className="text-base text-neutral-500">
              {fact.molecule}
            </p>
          )}
        </div>

        <div className="relative z-10 flex-1 flex items-center pl-6">
          <p className="text-2xl leading-snug text-neutral-800">
            {fact.content}
          </p>
        </div>

        <div className="relative z-10 pl-6 flex items-center justify-between">
          {options.showBranding && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                <span className="text-white font-semibold">O</span>
              </div>
              <span className="font-medium text-neutral-700">oumamie</span>
            </div>
          )}
          <p className={cn("text-xs text-neutral-400", !options.showBranding && "ml-auto")}>@oumamie</p>
        </div>
      </div>
    );
  }

  if (variant === "bold") {
    return (
      <div className={cn(baseClasses, "bg-pink-600")}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-pink-900/30 blur-3xl" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            {options.showCategoryIcon && <CategoryIcon className="w-4 h-4 text-white" />}
            <span className="text-sm font-semibold text-white uppercase tracking-wider">
              {getCategoryLabel(fact.category)}
            </span>
          </div>
          {options.showMolecule && fact.molecule && (
            <p className="text-xl font-bold text-white/90">
              {fact.molecule}
            </p>
          )}
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <p className="text-2xl leading-relaxed font-medium text-white">
            {fact.content}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          {options.showBranding && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <span className="text-pink-600 font-bold text-xl">O</span>
              </div>
              <div>
                <p className="font-bold text-white text-lg">Oumamie</p>
                <p className="text-sm text-white/70">Le saviez-vous ?</p>
              </div>
            </div>
          )}
          {options.showTags && fact.tags && fact.tags.length > 0 && (
            <div className={cn("flex flex-wrap gap-2 justify-end max-w-[200px]", !options.showBranding && "ml-auto")}>
              {fact.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                  #{tag}
                </span>
              ))}
            </div>
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
              {options.showCategoryIcon && <CategoryIcon className="w-4 h-4 text-white/80" />}
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                {getCategoryLabel(fact.category)}
              </span>
            </div>
            {options.showMolecule && fact.molecule && (
              <p className="text-lg font-bold text-white leading-tight">
                {fact.molecule}
              </p>
            )}
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
          <p className="text-xs text-pink-400 uppercase tracking-widest">Le saviez-vous ?</p>
          <p className="text-xl leading-relaxed text-neutral-800 font-medium">
            {fact.content}
          </p>
          {options.showTags && fact.tags && fact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {fact.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded bg-pink-50 text-pink-600 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "quote") {
    return (
      <div className={cn(baseClasses, "bg-white items-center text-center")}>
        <div className="relative z-10 space-y-3 w-full">
          <div className="flex items-center justify-center gap-2">
            {options.showCategoryIcon && <CategoryIcon className="w-3.5 h-3.5 text-pink-400" />}
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-pink-400">
              {getCategoryLabel(fact.category)}
            </span>
          </div>
          {options.showMolecule && fact.molecule && (
            <p className="text-sm text-pink-500 font-medium">
              {fact.molecule}
            </p>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
          <span className="text-7xl font-serif text-pink-300/50 leading-none select-none">&ldquo;</span>
          <p className="text-xl leading-relaxed text-neutral-700 font-light italic -mt-4 max-w-[420px]">
            {fact.content}
          </p>
          <span className="text-7xl font-serif text-pink-300/50 leading-none select-none -mt-2">&rdquo;</span>
        </div>

        <div className="relative z-10 w-full flex items-center justify-between">
          {options.showBranding && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span className="text-sm font-light tracking-widest text-neutral-600 uppercase">Oumamie</span>
            </div>
          )}
          {options.showTags && fact.tags && fact.tags.length > 0 && (
            <div className={cn("flex gap-2", !options.showBranding && "ml-auto")}>
              {fact.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs text-pink-400 font-light">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "science") {
    return (
      <div className={cn(baseClasses, "bg-neutral-900")}>
        {/* Dot grid pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(236,72,153,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            {options.showCategoryIcon && <CategoryIcon className="w-4 h-4 text-pink-400" />}
            <span className="text-xs font-mono uppercase tracking-widest text-pink-400">
              {getCategoryLabel(fact.category)}
            </span>
          </div>
          {options.showMolecule && fact.molecule && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-pink-500/30 bg-pink-500/10">
              <span className="text-sm font-mono text-pink-300">{fact.molecule}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <p className="text-2xl leading-relaxed font-light text-neutral-100">
            {fact.content}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          {options.showBranding && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded border border-pink-500/40 flex items-center justify-center">
                <span className="text-pink-400 font-mono font-bold">O</span>
              </div>
              <div>
                <p className="font-mono text-sm text-neutral-300">oumamie</p>
                <p className="text-xs text-neutral-600 font-mono">lab notes</p>
              </div>
            </div>
          )}
          {options.showTags && fact.tags && fact.tags.length > 0 && (
            <div className={cn("flex gap-2", !options.showBranding && "ml-auto")}>
              {fact.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-400/80 border border-pink-500/20">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Magazine variant (default)
  return (
    <div className={cn(baseClasses, "bg-pink-50")}>
      <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-pink-400 via-pink-500 to-pink-400" />

      <div className="relative z-10 space-y-1">
        <div className="flex items-center gap-2">
          {options.showCategoryIcon && <CategoryIcon className="w-5 h-5 text-pink-600" />}
          <span className="text-3xl font-black uppercase tracking-tight text-pink-600 leading-none">
            {getCategoryLabel(fact.category)}
          </span>
        </div>
        {options.showMolecule && fact.molecule && (
          <p className="text-base font-semibold text-pink-400 tracking-wide uppercase">
            {fact.molecule}
          </p>
        )}
        <div className="w-16 h-1 bg-pink-500 rounded-full mt-2" />
      </div>

      <div className="relative z-10 flex-1 flex items-center">
        <p className="text-2xl leading-snug font-medium text-neutral-800">
          {fact.content}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        {options.showBranding && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-pink-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">O</span>
            </div>
            <div>
              <p className="font-black text-neutral-800 text-sm uppercase tracking-wider">Oumamie</p>
              <p className="text-xs text-pink-400">Le saviez-vous ?</p>
            </div>
          </div>
        )}
        {options.showTags && fact.tags && fact.tags.length > 0 && (
          <div className={cn("flex gap-1.5", !options.showBranding && "ml-auto")}>
            {fact.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-pink-200 text-pink-700 font-semibold">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
