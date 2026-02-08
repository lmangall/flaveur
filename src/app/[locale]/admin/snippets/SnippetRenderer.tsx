"use client";

import { useState, useRef, useTransition, useMemo, useEffect, useCallback } from "react";
import {
  KNOWLEDGE_FACTS,
  FACT_CATEGORIES,
  DOMAIN_LABELS,
  type KnowledgeFact,
  type FactCategory,
  type FactDomain,
  type FactDomainFilter,
  getCategoriesForDomain,
} from "@/constants/knowledge-facts";
import { Button } from "@/app/[locale]/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/[locale]/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Check, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown,
  Copy, Download, Linkedin, Instagram, Sparkles,
  Atom, Leaf, BarChart3, Target, Flame, FlipHorizontal2,
  FlaskConical, Zap, Droplets, Shield, FileCheck,
  Apple, UtensilsCrossed, Factory,
  StickyNote, Pencil, Eye,
  Flower2, TestTube, Sparkle, Crown, Beaker, Pipette,
  Dna, Scissors, Lock, Layers, Award, Sprout, Scale,
  TrendingUp, Heart, Gem, Clock, History, Package,
  type LucideIcon,
} from "lucide-react";
import { markAsPosted, unmarkAsPosted } from "@/actions/admin/snippets";
import type { SnippetPost } from "@/actions/admin/snippets";
import { FACT_EXPLANATIONS } from "@/constants/snippet-explanations";
import { MarkdownHooks as Markdown } from "react-markdown";

// For backward compatibility
type AromeFact = KnowledgeFact;

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
  showDomain: boolean;
}

// Domain-specific color classes for card variants
const DOMAIN_COLORS = {
  flavor: {
    primary: "pink-500",
    secondary: "pink-400",
    tertiary: "pink-300",
    light: "pink-50",
    lightBg: "pink-100",
    text: "pink-700",
    textLight: "pink-600",
    accent: "pink-500/15",
    border: "pink-500/30",
    gradient: "from-pink-500 to-pink-600",
    gradientLight: "from-pink-200/60 to-pink-400/30",
    bgSolid: "bg-pink-600",
    bgLight: "bg-pink-50",
    label: "Arôme",
  },
  fragrance: {
    primary: "purple-500",
    secondary: "purple-400",
    tertiary: "purple-300",
    light: "purple-50",
    lightBg: "purple-100",
    text: "purple-700",
    textLight: "purple-600",
    accent: "purple-500/15",
    border: "purple-500/30",
    gradient: "from-purple-500 to-purple-600",
    gradientLight: "from-purple-200/60 to-purple-400/30",
    bgSolid: "bg-purple-600",
    bgLight: "bg-purple-50",
    label: "Parfum",
  },
  cosmetics: {
    primary: "teal-500",
    secondary: "teal-400",
    tertiary: "teal-300",
    light: "teal-50",
    lightBg: "teal-100",
    text: "teal-700",
    textLight: "teal-600",
    accent: "teal-500/15",
    border: "teal-500/30",
    gradient: "from-teal-500 to-teal-600",
    gradientLight: "from-teal-200/60 to-teal-400/30",
    bgSolid: "bg-teal-600",
    bgLight: "bg-teal-50",
    label: "Cosmétique",
  },
} as const;

// Domain-indexed category context
const CATEGORY_CONTEXT: Record<FactDomain, Record<string, string>> = {
  flavor: {
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
  },
  fragrance: {
    molecules: "Les molécules parfumantes sont les briques élémentaires de la parfumerie. Chaque composé possède une signature olfactive unique qui contribue à la complexité d'une fragrance.",
    terpenes: "Les terpènes sont omniprésents en parfumerie naturelle, du limonène des agrumes au linalol de la lavande. Ils forment la base de nombreux accords classiques.",
    "olfactive-families": "Les familles olfactives classent les parfums selon leur caractère dominant : floraux, boisés, orientaux, chyprés, fougères... Chaque famille a ses codes et ses matières emblématiques.",
    accords: "Un accord parfumé est une combinaison harmonieuse de molécules qui crée une nouvelle perception olfactive, plus grande que la somme de ses parties.",
    pyramid: "La pyramide olfactive structure un parfum en notes de tête (fraîches, volatiles), de cœur (le caractère) et de fond (la rémanence).",
    "iconic-perfumes": "Les parfums iconiques ont marqué l'histoire de la parfumerie en introduisant de nouvelles molécules, accords ou concepts qui ont influencé des générations de créateurs.",
    "natural-vs-synthetic": "La parfumerie moderne conjugue naturel et synthétique. Les molécules de synthèse permettent de créer des notes impossibles à obtenir naturellement et de préserver les ressources.",
    extraction: "L'extraction des matières premières naturelles est un art millénaire : distillation, enfleurage, extraction au solvant, CO2 supercritique... Chaque méthode préserve différentes facettes de l'odeur.",
    "raw-materials": "Les matières premières naturelles de qualité sont au cœur de la haute parfumerie. Rose de Grasse, jasmin de Grasse, oud, vétiver d'Haïti... Chaque terroir apporte sa signature unique.",
    history: "L'histoire de la parfumerie est riche de 5000 ans, de l'encens égyptien à la révolution des aldéhydes du XXe siècle, jusqu'aux parfums de niche contemporains.",
    regulation: "La réglementation IFRA encadre l'utilisation des matières premières en parfumerie pour garantir la sécurité des consommateurs tout en préservant la créativité.",
    industry: "L'industrie de la parfumerie fine est dominée par quelques grandes maisons suisses et françaises, mais connaît un renouveau avec les marques de niche.",
  },
  cosmetics: {
    molecules: "Les molécules actives en cosmétique sont sélectionnées pour leur efficacité prouvée sur la peau. Chaque actif cible un mécanisme biologique spécifique.",
    terpenes: "Les terpènes comme le limonène ou le linalol parfument les cosmétiques mais peuvent aussi être irritants. Leur concentration est réglementée.",
    actives: "Les actifs cosmétiques sont les ingrédients fonctionnels d'une formule : hydratants, antioxydants, exfoliants... Leur efficacité dépend du dosage et de la formulation.",
    "cos-formulation": "La formulation cosmétique équilibre efficacité, stabilité, sensorialité et sécurité. Chaque texture (gel, crème, sérum) a ses contraintes techniques.",
    "skin-science": "La science de la peau étudie les mécanismes biologiques de l'épiderme et du derme pour développer des actifs ciblés et des stratégies de soin efficaces.",
    "hair-science": "Le cheveu est une fibre de kératine dont la structure complexe (cuticule, cortex, médulla) détermine sa résistance, sa brillance et sa capacité à retenir l'hydratation.",
    preservation: "La conservation des cosmétiques est essentielle pour la sécurité. Les systèmes conservateurs modernes combinent efficacité antimicrobienne et tolérance cutanée.",
    texture: "La texture d'un cosmétique influence son efficacité et le plaisir d'utilisation. Le 'skin feel' est un critère majeur de choix pour les consommateurs.",
    claims: "Les allégations cosmétiques sont encadrées par la réglementation. Chaque claim doit être justifié par des preuves scientifiques ou des tests consommateurs.",
    "natural-cosmetics": "La cosmétique naturelle privilégie les ingrédients d'origine végétale ou minérale. Les labels (Cosmos, Ecocert) garantissent des critères stricts de formulation.",
    "cos-regulation": "Le Règlement Cosmétiques européen (1223/2009) garantit la sécurité des produits mis sur le marché à travers des obligations strictes de formulation et d'étiquetage.",
    trends: "Les tendances cosmétiques évoluent rapidement : clean beauty, K-beauty, cosmétique personnalisée, biotechnologie... L'innovation est le moteur du secteur.",
    solvents: "Les solvants cosmétiques (propylène glycol, glycérine, huiles) permettent de solubiliser les actifs et d'ajuster la texture des formules.",
    stability: "La stabilité cosmétique concerne à la fois la conservation microbiologique et la stabilité physico-chimique (émulsions, couleur, parfum) sur la durée de vie du produit.",
    industry: "L'industrie cosmétique mondiale est dominée par L'Oréal, Estée Lauder et Unilever, mais connaît un essor des marques indépendantes et 'indie'.",
  },
};

// Domain-indexed hashtags
const CATEGORY_HASHTAGS: Record<FactDomain, Record<string, string[]>> = {
  flavor: {
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
  },
  fragrance: {
    molecules: ["parfumerie", "moleculesparfumantes", "olfaction", "perfumery"],
    terpenes: ["terpenes", "huilesessentielles", "naturalperfumery", "essentialoils"],
    "olfactive-families": ["famillesolfactives", "chypre", "fougere", "oriental", "floral"],
    accords: ["accordparfume", "perfumeaccord", "composition", "creation"],
    pyramid: ["pyramideolfactive", "notesdetete", "notesdecoeur", "notesdefond"],
    "iconic-perfumes": ["parfumsemblematiques", "classiques", "heritage", "perfumehistory"],
    "natural-vs-synthetic": ["naturelvssynthetique", "chimie", "sustainableperfumery"],
    extraction: ["extraction", "distillation", "enfleurage", "CO2"],
    "raw-materials": ["matieresbrutes", "grasse", "naturals", "rawmaterials"],
    history: ["histoiredelaparfumerie", "heritage", "perfumehistory"],
    regulation: ["IFRA", "reglementation", "allergens", "safetyperfumery"],
    industry: ["industrieparfumerie", "grasse", "fragrancehouse", "niche"],
  },
  cosmetics: {
    molecules: ["actifs", "ingredients", "cosmetics", "skincare"],
    terpenes: ["terpenes", "huilesessentielles", "parfumerie", "cosmetiquenaturelle"],
    actives: ["actifs", "skincare", "antiage", "hydratation"],
    "cos-formulation": ["formulation", "emulsion", "texture", "cosmetiquelab"],
    "skin-science": ["peau", "dermatologie", "barrierecultanee", "skinscience"],
    "hair-science": ["cheveux", "keratine", "haircare", "hairscience"],
    preservation: ["conservation", "preservatives", "stabilite", "microbio"],
    texture: ["texture", "sensorialite", "skinfeel", "cosmeticsensory"],
    claims: ["allegations", "claims", "marketing", "efficacite"],
    "natural-cosmetics": ["cosmetiquenaturelle", "bio", "organic", "cleanbeauty"],
    "cos-regulation": ["reglementation", "INCI", "cosmetics", "safety"],
    trends: ["tendances", "innovation", "kbeauty", "cleanbeauty"],
    solvents: ["solvant", "emollient", "texture", "formulation"],
    stability: ["stabilite", "conservation", "formulation", "shelflife"],
    industry: ["industriecosmetique", "beaute", "loreal", "indie"],
  },
};

// Base hashtags per domain
const BASE_HASHTAGS: Record<FactDomain, string[]> = {
  flavor: ["oumamie", "aromatique", "flavorist", "sciencedesaromes", "saveurs"],
  fragrance: ["oumamie", "parfum", "perfumer", "fragrancelovers", "olfaction"],
  cosmetics: ["oumamie", "cosmetique", "skincare", "formulation", "beaute"],
};

// Category icons - includes all domains
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Shared
  molecules: Atom,
  terpenes: Leaf,
  solvents: Droplets,
  stability: Shield,
  regulation: FileCheck,
  industry: Factory,
  // Flavor
  profiles: BarChart3,
  thresholds: Target,
  maillard: Flame,
  chirality: FlipHorizontal2,
  formulation: FlaskConical,
  enhancers: Zap,
  taste: Apple,
  cuisine: UtensilsCrossed,
  // Fragrance
  "olfactive-families": Flower2,
  accords: Sparkle,
  pyramid: Layers,
  "iconic-perfumes": Crown,
  "natural-vs-synthetic": Beaker,
  extraction: Pipette,
  "raw-materials": Package,
  history: History,
  // Cosmetics
  actives: TestTube,
  "cos-formulation": FlaskConical,
  "skin-science": Dna,
  "hair-science": Scissors,
  preservation: Lock,
  texture: Layers,
  claims: Award,
  "natural-cosmetics": Sprout,
  "cos-regulation": Scale,
  trends: TrendingUp,
};

// Domain accent colors
const DOMAIN_ACCENT = {
  flavor: "pink",
  fragrance: "purple",
  cosmetics: "teal",
} as const;

function generateCaption(fact: KnowledgeFact, domain: FactDomain): string {
  const domainEmoji = {
    flavor: "🍓",
    fragrance: "🌸",
    cosmetics: "✨",
  }[domain];

  const lines = [
    `💡 Le saviez-vous ? ${domainEmoji}`,
    "",
    fact.content,
  ];

  // Add fact-specific explanation (fall back to domain-specific category context)
  const domainContext = CATEGORY_CONTEXT[domain];
  const explanation = FACT_EXPLANATIONS[fact.id] || domainContext[fact.category] || "";
  if (explanation) {
    lines.push("", "---", "", explanation);
  }

  if (fact.molecule) {
    lines.push("", `🧪 Molécule : ${fact.molecule}`);
  }

  // Build hashtags: domain base + category-specific + fact tags
  const baseHashtags = BASE_HASHTAGS[domain];
  const domainHashtags = CATEGORY_HASHTAGS[domain];
  const categoryHashtags = domainHashtags[fact.category] || [];
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
  const [selectedDomain, setSelectedDomain] = useState<FactDomain>("flavor");
  const [selectedCategory, setSelectedCategory] = useState<FactCategory | "all">("all");

  // Filter facts by domain
  const domainFacts = useMemo(() => {
    return KNOWLEDGE_FACTS.filter((f) => f.domains.includes(selectedDomain));
  }, [selectedDomain]);

  const [selectedFactId, setSelectedFactId] = useState<string>(domainFacts[0]?.id || "");
  const [styleVariant, setStyleVariant] = useState<StyleVariant>("gradient-hue");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [posts, setPosts] = useState<SnippetPost[]>(initialPosts);
  const [caption, setCaption] = useState(() => generateCaption(domainFacts[0], "flavor"));
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const [cardOptions, setCardOptions] = useState<CardOptions>({
    showTags: true,
    showMolecule: true,
    showBranding: true,
    showCategoryIcon: true,
    showDomain: true,
  });

  // When domain changes, reset category and select first fact
  useEffect(() => {
    setSelectedCategory("all");
    const facts = KNOWLEDGE_FACTS.filter((f) => f.domains.includes(selectedDomain));
    if (facts.length > 0) {
      setSelectedFactId(facts[0].id);
      setCaption(generateCaption(facts[0], selectedDomain));
    }
  }, [selectedDomain]);

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

  const currentFact = domainFacts.find((f) => f.id === selectedFactId);

  // Build a lookup: factId -> Set of platforms
  const postedMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const p of posts) {
      if (!map.has(p.fact_id)) map.set(p.fact_id, new Set());
      map.get(p.fact_id)!.add(p.platform);
    }
    return map;
  }, [posts]);

  // Get categories available for current domain
  const domainCategories = useMemo(() => {
    return getCategoriesForDomain(selectedDomain);
  }, [selectedDomain]);

  // Group facts by category (filtered by domain)
  const groupedFacts = useMemo(() => {
    const groups: { category: FactCategory; label: string; facts: KnowledgeFact[] }[] = [];
    for (const cat of domainCategories) {
      const facts = domainFacts.filter((f) => f.category === cat.value);
      if (facts.length > 0) {
        if (selectedCategory === "all" || selectedCategory === cat.value) {
          groups.push({ category: cat.value as FactCategory, label: cat.label, facts });
        }
      }
    }
    return groups;
  }, [selectedCategory, domainFacts, domainCategories]);

  const selectFact = (fact: KnowledgeFact) => {
    setSelectedFactId(fact.id);
    setCaption(generateCaption(fact, selectedDomain));
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
        {/* Domain tabs */}
        <div className="flex gap-2 border-b pb-3">
          {(["flavor", "fragrance", "cosmetics"] as const).map((domain) => {
            const domainColors = {
              flavor: "bg-pink-500 text-white",
              fragrance: "bg-purple-500 text-white",
              cosmetics: "bg-teal-500 text-white",
            };
            const inactiveColors = {
              flavor: "hover:bg-pink-50 text-pink-600",
              fragrance: "hover:bg-purple-50 text-purple-600",
              cosmetics: "hover:bg-teal-50 text-teal-600",
            };
            const count = KNOWLEDGE_FACTS.filter((f) => f.domains.includes(domain)).length;
            return (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors",
                  selectedDomain === domain
                    ? domainColors[domain]
                    : `bg-muted/50 ${inactiveColors[domain]}`
                )}
              >
                {DOMAIN_LABELS[domain]}
                <span className="ml-1 text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v as FactCategory | "all"); }}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({domainFacts.length})</SelectItem>
              {domainCategories.map((cat) => {
                const count = domainFacts.filter((f) => f.category === cat.value).length;
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
                    const Icon = CATEGORY_ICONS[group.category] || Atom;
                    const iconColor = {
                      flavor: "text-pink-500",
                      fragrance: "text-purple-500",
                      cosmetics: "text-teal-500",
                    }[selectedDomain];
                    return <Icon className={cn("h-3.5 w-3.5 shrink-0", iconColor)} />;
                  })()}
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    {
                      flavor: "text-pink-500",
                      fragrance: "text-purple-500",
                      cosmetics: "text-teal-500",
                    }[selectedDomain]
                  )}>
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
                              ? {
                                  flavor: "border-pink-500 bg-pink-50",
                                  fragrance: "border-purple-500 bg-purple-50",
                                  cosmetics: "border-teal-500 bg-teal-50",
                                }[selectedDomain]
                              : "border-transparent hover:bg-muted"
                          )}
                        >
                          <p className="text-sm leading-snug">
                            {fact.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {fact.molecule && (
                              <span className={cn(
                                "text-xs font-medium",
                                {
                                  flavor: "text-pink-600",
                                  fragrance: "text-purple-600",
                                  cosmetics: "text-teal-600",
                                }[selectedDomain]
                              )}>{fact.molecule}</span>
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
                    { key: "showDomain", label: "Domain" },
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
                <SnippetCard fact={currentFact} variant={styleVariant} getCategoryLabel={getCategoryLabel} options={cardOptions} domain={selectedDomain} />
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
  domain: FactDomain;
}

function SnippetCard({ fact, variant, getCategoryLabel, options, domain }: SnippetCardProps) {
  const baseClasses = "w-full h-full flex flex-col justify-between p-12 relative overflow-hidden";
  const CategoryIcon = CATEGORY_ICONS[fact.category];
  const colors = DOMAIN_COLORS[domain];

  // Logo component for branding (icon-only, no text)
  const Logo = ({ size = 48, className = "" }: { size?: number; className?: string }) => (
    <img
      src="/logo_transparent_bg_tiny.png"
      alt="Oumamie"
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );

  // Domain badge component
  const DomainBadge = ({ className = "" }: { className?: string }) => {
    if (!options.showDomain) return null;
    const domainStyles = {
      flavor: "bg-pink-500 text-white",
      fragrance: "bg-purple-500 text-white",
      cosmetics: "bg-teal-500 text-white",
    };
    return (
      <span className={cn(
        "absolute top-6 right-6 z-20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
        domainStyles[domain],
        className
      )}>
        {colors.label}
      </span>
    );
  };

  // Domain-specific gradient blobs (for gradient-hue variant)
  const gradientBlobs = {
    flavor: {
      topRight: "from-pink-200/60 to-pink-400/30",
      bottomLeft: "from-pink-100/50 to-pink-300/20",
    },
    fragrance: {
      topRight: "from-purple-200/60 to-purple-400/30",
      bottomLeft: "from-purple-100/50 to-purple-300/20",
    },
    cosmetics: {
      topRight: "from-teal-200/60 to-teal-400/30",
      bottomLeft: "from-teal-100/50 to-teal-300/20",
    },
  };

  // Domain-specific colors for text and backgrounds
  const domainTextColors = {
    flavor: "text-pink-700",
    fragrance: "text-purple-700",
    cosmetics: "text-teal-700",
  };
  const domainAccentColors = {
    flavor: "text-pink-600",
    fragrance: "text-purple-600",
    cosmetics: "text-teal-600",
  };
  const domainLightColors = {
    flavor: "text-pink-500",
    fragrance: "text-purple-500",
    cosmetics: "text-teal-500",
  };
  const domainBgAccent = {
    flavor: "bg-pink-500/15 border-pink-500/30",
    fragrance: "bg-purple-500/15 border-purple-500/30",
    cosmetics: "bg-teal-500/15 border-teal-500/30",
  };
  const domainTagBg = {
    flavor: "bg-pink-500/15 text-pink-700",
    fragrance: "bg-purple-500/15 text-purple-700",
    cosmetics: "bg-teal-500/15 text-teal-700",
  };
  const domainGradient = {
    flavor: "from-pink-500 to-pink-600",
    fragrance: "from-purple-500 to-purple-600",
    cosmetics: "from-teal-500 to-teal-600",
  };
  const domainBarGradient = {
    flavor: "from-pink-500 to-pink-400",
    fragrance: "from-purple-500 to-purple-400",
    cosmetics: "from-teal-500 to-teal-400",
  };
  const domainSolidBg = {
    flavor: "bg-pink-600",
    fragrance: "bg-purple-600",
    cosmetics: "bg-teal-600",
  };
  const domainLightBg = {
    flavor: "bg-pink-50",
    fragrance: "bg-purple-50",
    cosmetics: "bg-teal-50",
  };

  if (variant === "gradient-hue") {
    return (
      <div className={cn(baseClasses, "bg-white")}>
        <DomainBadge />
        <div className={cn("absolute top-0 right-0 w-80 h-80 rounded-full bg-linear-to-br blur-3xl", gradientBlobs[domain].topRight)} />
        <div className={cn("absolute bottom-0 left-0 w-64 h-64 rounded-full bg-linear-to-tr blur-3xl", gradientBlobs[domain].bottomLeft)} />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-1 h-6 bg-linear-to-b rounded-full", domainBarGradient[domain])} />
            {options.showCategoryIcon && <CategoryIcon className={cn("w-4 h-4", domainTextColors[domain])} />}
            <span className={cn("text-sm font-semibold uppercase tracking-wider", domainTextColors[domain])}>
              {getCategoryLabel(fact.category)}
            </span>
          </div>
          {options.showMolecule && fact.molecule && (
            <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border", domainBgAccent[domain])}>
              <Sparkles className={cn("w-4 h-4", domainAccentColors[domain])} />
              <span className={cn("text-sm font-bold", domainTextColors[domain])}>{fact.molecule}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <p className="text-2xl leading-relaxed font-semibold text-neutral-900">
            {fact.content}
          </p>
        </div>

        <div className="relative z-10 flex items-center">
          {options.showBranding && (
            <div className="flex items-center gap-3">
              <Logo size={48} />
              <div>
                <p className="font-bold text-neutral-900">Oumamie</p>
                <p className="text-xs text-neutral-600">Le saviez-vous ?</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Domain-specific line colors for thin-lines variant
  const domainLineVia = {
    flavor: "via-pink-400/40",
    fragrance: "via-purple-400/40",
    cosmetics: "via-teal-400/40",
  };
  const domainCornerBorder = {
    flavor: "border-pink-500/60",
    fragrance: "border-purple-500/60",
    cosmetics: "border-teal-500/60",
  };
  const domainLineBg = {
    flavor: "bg-pink-500/20",
    fragrance: "bg-purple-500/20",
    cosmetics: "bg-teal-500/20",
  };

  if (variant === "thin-lines") {
    return (
      <div className={cn(baseClasses, "bg-white")}>
        <DomainBadge />
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn("absolute top-8 left-8 right-8 h-px bg-linear-to-r from-transparent to-transparent", domainLineVia[domain])} />
          <div className={cn("absolute bottom-8 left-8 right-8 h-px bg-linear-to-r from-transparent to-transparent", domainLineVia[domain])} />
          <div className={cn("absolute top-8 bottom-8 left-8 w-px bg-linear-to-b from-transparent to-transparent", domainLineVia[domain])} />
          <div className={cn("absolute top-8 bottom-8 right-8 w-px bg-linear-to-b from-transparent to-transparent", domainLineVia[domain])} />
          <div className={cn("absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2", domainCornerBorder[domain])} />
          <div className={cn("absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2", domainCornerBorder[domain])} />
          <div className={cn("absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2", domainCornerBorder[domain])} />
          <div className={cn("absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2", domainCornerBorder[domain])} />
        </div>

        <div className="relative z-10 pt-8 space-y-3">
          <div className="flex items-center gap-3">
            {options.showCategoryIcon && <CategoryIcon className={cn("w-3.5 h-3.5 shrink-0", domainLightColors[domain])} />}
            <span className={cn("text-xs font-medium uppercase tracking-[0.2em]", domainLightColors[domain])}>
              {getCategoryLabel(fact.category)}
            </span>
            <div className={cn("flex-1 h-px", domainLineBg[domain])} />
          </div>
          {options.showMolecule && fact.molecule && (
            <p className={cn("text-lg font-light tracking-wide", domainAccentColors[domain])}>
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
              <div className={cn("w-12 h-0.5 bg-linear-to-r", domainBarGradient[domain])} />
            </div>
          )}
          <p className={cn("text-xs text-neutral-400 tracking-wider", !options.showBranding && "ml-auto")}>LE SAVIEZ-VOUS ?</p>
        </div>
      </div>
    );
  }

  // Domain-specific vertical bar gradient for minimal variant
  const domainVerticalBar = {
    flavor: "from-pink-500 via-pink-400 to-pink-300",
    fragrance: "from-purple-500 via-purple-400 to-purple-300",
    cosmetics: "from-teal-500 via-teal-400 to-teal-300",
  };
  const domainCircleBg = {
    flavor: "bg-pink-500",
    fragrance: "bg-purple-500",
    cosmetics: "bg-teal-500",
  };

  if (variant === "minimal") {
    return (
      <div className={cn(baseClasses, "bg-neutral-50")}>
        <DomainBadge />
        <div className={cn("absolute top-0 left-0 w-1.5 h-full bg-linear-to-b", domainVerticalBar[domain])} />

        <div className="relative z-10 pl-6 space-y-2">
          <div className="flex items-center gap-2">
            {options.showCategoryIcon && <CategoryIcon className={cn("w-3.5 h-3.5", domainLightColors[domain])} />}
            <span className={cn("text-xs font-medium uppercase tracking-widest", domainLightColors[domain])}>
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

        <div className="relative z-10 pl-6 flex items-center">
          {options.showBranding && (
            <div className="flex items-center gap-2">
              <Logo size={40} />
              <span className="font-medium text-neutral-700">oumamie</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Domain-specific dark blur for bold variant
  const domainDarkBlur = {
    flavor: "bg-pink-900/30",
    fragrance: "bg-purple-900/30",
    cosmetics: "bg-teal-900/30",
  };
  const domainLogoText = {
    flavor: "text-pink-600",
    fragrance: "text-purple-600",
    cosmetics: "text-teal-600",
  };

  if (variant === "bold") {
    return (
      <div className={cn(baseClasses, domainSolidBg[domain])}>
        {options.showDomain && (
          <span className="absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white">
            {colors.label}
          </span>
        )}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className={cn("absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl", domainDarkBlur[domain])} />

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

        <div className="relative z-10 flex items-center">
          {options.showBranding && (
            <div className="flex items-center gap-3">
              <Logo size={56} />
              <div>
                <p className="font-bold text-white text-lg">Oumamie</p>
                <p className="text-sm text-white/70">Le saviez-vous ?</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Domain-specific overlay for duotone variant
  const domainOverlay = {
    flavor: "from-pink-500/30",
    fragrance: "from-purple-500/30",
    cosmetics: "from-teal-500/30",
  };
  const domainSecondaryLight = {
    flavor: "text-pink-400",
    fragrance: "text-purple-400",
    cosmetics: "text-teal-400",
  };
  const domainTagBgLight = {
    flavor: "bg-pink-50 text-pink-600",
    fragrance: "bg-purple-50 text-purple-600",
    cosmetics: "bg-teal-50 text-teal-600",
  };

  if (variant === "duotone") {
    return (
      <div className="w-full h-full flex relative overflow-hidden">
        {options.showDomain && (
          <span className={cn(
            "absolute top-6 right-6 z-20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
            {
              flavor: "bg-pink-500 text-white",
              fragrance: "bg-purple-500 text-white",
              cosmetics: "bg-teal-500 text-white",
            }[domain]
          )}>
            {colors.label}
          </span>
        )}
        {/* Left colored panel */}
        <div className={cn("w-[38%] p-10 flex flex-col justify-between relative", domainSolidBg[domain])}>
          <div className={cn("absolute inset-0 bg-linear-to-b to-transparent", domainOverlay[domain])} />
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
              <Logo size={48} className="mb-2" />
              <p className="text-xs text-white/60 tracking-wider uppercase">Oumamie</p>
            </div>
          )}
        </div>
        {/* Right white panel */}
        <div className="flex-1 bg-white p-10 flex flex-col justify-between">
          <p className={cn("text-xs uppercase tracking-widest", domainSecondaryLight[domain])}>Le saviez-vous ?</p>
          <p className="text-xl leading-relaxed text-neutral-800 font-medium">
            {fact.content}
          </p>
        </div>
      </div>
    );
  }

  // Domain-specific quote mark colors
  const domainQuoteMark = {
    flavor: "text-pink-300/50",
    fragrance: "text-purple-300/50",
    cosmetics: "text-teal-300/50",
  };

  if (variant === "quote") {
    return (
      <div className={cn(baseClasses, "bg-white items-center text-center")}>
        <DomainBadge />
        <div className="relative z-10 space-y-3 w-full">
          <div className="flex items-center justify-center gap-2">
            {options.showCategoryIcon && <CategoryIcon className={cn("w-3.5 h-3.5", domainSecondaryLight[domain])} />}
            <span className={cn("text-xs font-medium uppercase tracking-[0.25em]", domainSecondaryLight[domain])}>
              {getCategoryLabel(fact.category)}
            </span>
          </div>
          {options.showMolecule && fact.molecule && (
            <p className={cn("text-sm font-medium", domainLightColors[domain])}>
              {fact.molecule}
            </p>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
          <span className={cn("text-7xl font-serif leading-none select-none", domainQuoteMark[domain])}>&ldquo;</span>
          <p className="text-xl leading-relaxed text-neutral-700 font-light italic -mt-4 max-w-[420px]">
            {fact.content}
          </p>
          <span className={cn("text-7xl font-serif leading-none select-none -mt-2", domainQuoteMark[domain])}>&rdquo;</span>
        </div>

        <div className="relative z-10 w-full flex items-center">
          {options.showBranding && (
            <div className="flex items-center gap-2">
              <Logo size={32} />
              <span className="text-sm font-light tracking-widest text-neutral-600 uppercase">Oumamie</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Domain-specific dot grid color for science variant
  const domainDotGrid = {
    flavor: "rgba(236,72,153,0.15)", // pink
    fragrance: "rgba(168,85,247,0.15)", // purple
    cosmetics: "rgba(20,184,166,0.15)", // teal
  };
  const domainGlow = {
    flavor: "bg-pink-500/10",
    fragrance: "bg-purple-500/10",
    cosmetics: "bg-teal-500/10",
  };
  const domainScienceBorder = {
    flavor: "border-pink-500/30 bg-pink-500/10",
    fragrance: "border-purple-500/30 bg-purple-500/10",
    cosmetics: "border-teal-500/30 bg-teal-500/10",
  };
  const domainScienceText = {
    flavor: "text-pink-300",
    fragrance: "text-purple-300",
    cosmetics: "text-teal-300",
  };
  const domainLogoBorder = {
    flavor: "border-pink-500/40",
    fragrance: "border-purple-500/40",
    cosmetics: "border-teal-500/40",
  };
  const domainTagScience = {
    flavor: "bg-pink-500/10 text-pink-400/80 border-pink-500/20",
    fragrance: "bg-purple-500/10 text-purple-400/80 border-purple-500/20",
    cosmetics: "bg-teal-500/10 text-teal-400/80 border-teal-500/20",
  };

  if (variant === "science") {
    return (
      <div className={cn(baseClasses, "bg-neutral-900")}>
        {options.showDomain && (
          <span className={cn(
            "absolute top-6 right-6 z-20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
            {
              flavor: "border-pink-500/50 bg-pink-500/20 text-pink-300",
              fragrance: "border-purple-500/50 bg-purple-500/20 text-purple-300",
              cosmetics: "border-teal-500/50 bg-teal-500/20 text-teal-300",
            }[domain]
          )}>
            {colors.label}
          </span>
        )}
        {/* Dot grid pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, ${domainDotGrid[domain]} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }} />
        <div className={cn("absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl", domainGlow[domain])} />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            {options.showCategoryIcon && <CategoryIcon className={cn("w-4 h-4", domainSecondaryLight[domain])} />}
            <span className={cn("text-xs font-mono uppercase tracking-widest", domainSecondaryLight[domain])}>
              {getCategoryLabel(fact.category)}
            </span>
          </div>
          {options.showMolecule && fact.molecule && (
            <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded border", domainScienceBorder[domain])}>
              <span className={cn("text-sm font-mono", domainScienceText[domain])}>{fact.molecule}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <p className="text-2xl leading-relaxed font-light text-neutral-100">
            {fact.content}
          </p>
        </div>

        <div className="relative z-10 flex items-center">
          {options.showBranding && (
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <div>
                <p className="font-mono text-sm text-neutral-300">oumamie</p>
                <p className="text-xs text-neutral-600 font-mono">lab notes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Domain-specific magazine bar gradient
  const domainMagazineBar = {
    flavor: "from-pink-400 via-pink-500 to-pink-400",
    fragrance: "from-purple-400 via-purple-500 to-purple-400",
    cosmetics: "from-teal-400 via-teal-500 to-teal-400",
  };
  const domainMagazineTag = {
    flavor: "bg-pink-200 text-pink-700",
    fragrance: "bg-purple-200 text-purple-700",
    cosmetics: "bg-teal-200 text-teal-700",
  };

  // Magazine variant (default)
  return (
    <div className={cn(baseClasses, domainLightBg[domain])}>
      <DomainBadge />
      <div className={cn("absolute top-0 left-0 right-0 h-2 bg-linear-to-r", domainMagazineBar[domain])} />

      <div className="relative z-10 space-y-1">
        <div className="flex items-center gap-2">
          {options.showCategoryIcon && <CategoryIcon className={cn("w-5 h-5", domainAccentColors[domain])} />}
          <span className={cn("text-3xl font-black uppercase tracking-tight leading-none", domainAccentColors[domain])}>
            {getCategoryLabel(fact.category)}
          </span>
        </div>
        {options.showMolecule && fact.molecule && (
          <p className={cn("text-base font-semibold tracking-wide uppercase", domainSecondaryLight[domain])}>
            {fact.molecule}
          </p>
        )}
        <div className={cn("w-16 h-1 rounded-full mt-2", domainCircleBg[domain])} />
      </div>

      <div className="relative z-10 flex-1 flex items-center">
        <p className="text-2xl leading-snug font-medium text-neutral-800">
          {fact.content}
        </p>
      </div>

      <div className="relative z-10 flex items-center">
        {options.showBranding && (
          <div className="flex items-center gap-2">
            <Logo size={40} />
            <div>
              <p className="font-black text-neutral-800 text-sm uppercase tracking-wider">Oumamie</p>
              <p className={cn("text-xs", domainSecondaryLight[domain])}>Le saviez-vous ?</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
