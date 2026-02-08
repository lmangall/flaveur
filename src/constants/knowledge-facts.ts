// Multi-domain knowledge facts for flavor, fragrance, and cosmetics
// Usage: Display random facts during onboarding, loading states, or as tips

// ============================================
// DOMAIN TYPES
// ============================================
export type FactDomain = "flavor" | "fragrance" | "cosmetics";
export type FactDomainFilter = FactDomain | "all";

export const DOMAIN_LABELS: Record<FactDomain, string> = {
  flavor: "Arômes",
  fragrance: "Parfumerie",
  cosmetics: "Cosmétique",
};

export const DOMAIN_COLORS: Record<FactDomain, string> = {
  flavor: "pink",
  fragrance: "purple",
  cosmetics: "teal",
};

// ============================================
// CATEGORY DEFINITIONS BY DOMAIN
// ============================================

// Flavor categories (existing)
export const FLAVOR_CATEGORIES = [
  { value: "molecules", label: "Molécules" },
  { value: "terpenes", label: "Terpènes" },
  { value: "profiles", label: "Profils de saveurs" },
  { value: "thresholds", label: "Seuils de perception" },
  { value: "maillard", label: "Réaction de Maillard" },
  { value: "chirality", label: "Chiralité" },
  { value: "formulation", label: "Formulation" },
  { value: "enhancers", label: "Exhausteurs" },
  { value: "solvents", label: "Solvants" },
  { value: "stability", label: "Stabilité" },
  { value: "regulation", label: "Réglementation" },
  { value: "taste", label: "Goût & perception" },
  { value: "cuisine", label: "Cuisine" },
  { value: "industry", label: "Industrie" },
] as const;

// Fragrance categories
export const FRAGRANCE_CATEGORIES = [
  { value: "molecules", label: "Molécules" },
  { value: "terpenes", label: "Terpènes" },
  { value: "olfactive-families", label: "Familles olfactives" },
  { value: "accords", label: "Accords" },
  { value: "pyramid", label: "Pyramide olfactive" },
  { value: "iconic-perfumes", label: "Parfums iconiques" },
  { value: "natural-vs-synthetic", label: "Naturel vs Synthétique" },
  { value: "extraction", label: "Extraction" },
  { value: "raw-materials", label: "Matières premières" },
  { value: "history", label: "Histoire" },
  { value: "regulation", label: "Réglementation" },
  { value: "industry", label: "Industrie" },
] as const;

// Cosmetics categories
export const COSMETICS_CATEGORIES = [
  { value: "actives", label: "Actifs" },
  { value: "cos-formulation", label: "Formulation" },
  { value: "skin-science", label: "Science de la peau" },
  { value: "hair-science", label: "Science du cheveu" },
  { value: "preservation", label: "Conservation" },
  { value: "texture", label: "Texture" },
  { value: "claims", label: "Allégations" },
  { value: "natural-cosmetics", label: "Cosmétique naturelle" },
  { value: "cos-regulation", label: "Réglementation" },
  { value: "trends", label: "Tendances" },
] as const;

// Combined categories for type inference
export const FACT_CATEGORIES = [
  ...FLAVOR_CATEGORIES,
  ...FRAGRANCE_CATEGORIES.filter(c => !FLAVOR_CATEGORIES.some(fc => fc.value === c.value)),
  ...COSMETICS_CATEGORIES,
] as const;

export type FactCategory = (typeof FACT_CATEGORIES)[number]["value"];

// ============================================
// KNOWLEDGE FACT INTERFACE
// ============================================
export interface KnowledgeFact {
  id: string;
  content: string;
  category: FactCategory;
  molecule?: string;
  tags?: string[];
  domains: FactDomain[];
}

// Legacy alias for backward compatibility
export type AromeFact = KnowledgeFact;

// ============================================
// KNOWLEDGE FACTS
// ============================================
export const KNOWLEDGE_FACTS: KnowledgeFact[] = [
  // ============================================
  // MOLECULES - Aldehydes (flavor + fragrance)
  // ============================================
  {
    id: "ald-001",
    content:
      "L'acétaldéhyde apporte des notes éthérées et de pomme verte, couramment utilisé dans les arômes de fruits et d'alcool.",
    category: "molecules",
    molecule: "Acetaldehyde",
    tags: ["aldehyde", "fruity", "apple"],
    domains: ["flavor"],
  },
  {
    id: "ald-002",
    content:
      "L'hexanal est responsable de l'odeur d'herbe fraîchement coupée dans les arômes verts.",
    category: "molecules",
    molecule: "Hexanal",
    tags: ["aldehyde", "green", "grass"],
    domains: ["flavor"],
  },
  {
    id: "ald-003",
    content:
      "Le (E)-2-hexénal donne la note caractéristique de feuille de tomate verte.",
    category: "molecules",
    molecule: "(E)-2-Hexenal",
    tags: ["aldehyde", "green", "tomato"],
    domains: ["flavor"],
  },
  {
    id: "ald-004",
    content:
      "L'octanal apporte une note aldéhydique citronnée et légèrement grasse aux agrumes.",
    category: "molecules",
    molecule: "Octanal",
    tags: ["aldehyde", "citrus"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ald-005",
    content: "Le nonanal possède un profil floral cireux rappelant la rose.",
    category: "molecules",
    molecule: "Nonanal",
    tags: ["aldehyde", "floral", "waxy"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ald-006",
    content:
      "Le décanal est la molécule clé de l'écorce d'orange avec sa note cireuse caractéristique.",
    category: "molecules",
    molecule: "Decanal",
    tags: ["aldehyde", "citrus", "orange"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ald-007",
    content:
      "Le benzaldéhyde est responsable de l'odeur d'amande amère et de cerise dans les fruits à noyau.",
    category: "molecules",
    molecule: "Benzaldehyde",
    tags: ["aldehyde", "almond", "cherry"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ald-008",
    content:
      "Le cinnamaldéhyde est le composé principal de l'arôme de cannelle.",
    category: "molecules",
    molecule: "Cinnamaldehyde",
    tags: ["aldehyde", "spice", "cinnamon"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ald-009",
    content:
      "La vanilline représente 1 à 2% du poids sec d'une gousse de vanille.",
    category: "molecules",
    molecule: "Vanillin",
    tags: ["aldehyde", "vanilla", "sweet"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ald-010",
    content:
      "Le 2,4-décadiénal apporte une note grasse de friture, typique des snacks et arômes chicken.",
    category: "molecules",
    molecule: "2,4-Decadienal",
    tags: ["aldehyde", "fatty", "fried"],
    domains: ["flavor"],
  },

  // ============================================
  // MOLECULES - Esters (flavor + fragrance)
  // ============================================
  {
    id: "est-001",
    content:
      "L'acétate d'éthyle est un ester fruité utilisé comme base dans de nombreux arômes de fruits.",
    category: "molecules",
    molecule: "Ethyl acetate",
    tags: ["ester", "fruity"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "est-002",
    content:
      "L'acétate d'isoamyle est la molécule signature de l'arôme banane et bonbon.",
    category: "molecules",
    molecule: "Isoamyl acetate",
    tags: ["ester", "banana", "candy"],
    domains: ["flavor"],
  },
  {
    id: "est-003",
    content:
      "L'acétate de benzyle combine des notes de jasmin et de fruité.",
    category: "molecules",
    molecule: "Benzyl acetate",
    tags: ["ester", "floral", "jasmine"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "est-004",
    content:
      "Le butyrate d'éthyle apporte une note d'ananas caractéristique aux arômes tropicaux.",
    category: "molecules",
    molecule: "Ethyl butyrate",
    tags: ["ester", "pineapple", "tropical"],
    domains: ["flavor"],
  },
  {
    id: "est-005",
    content:
      "L'hexanoate d'éthyle contribue aux notes de pomme et d'ananas.",
    category: "molecules",
    molecule: "Ethyl hexanoate",
    tags: ["ester", "apple", "pineapple"],
    domains: ["flavor"],
  },
  {
    id: "est-006",
    content:
      "L'acétate de cis-3-hexényle donne une note verte de banane pas mûre.",
    category: "molecules",
    molecule: "cis-3-Hexenyl acetate",
    tags: ["ester", "green", "unripe"],
    domains: ["flavor"],
  },
  {
    id: "est-007",
    content:
      "L'anthranilate de méthyle est responsable de l'arôme caractéristique du raisin Concord.",
    category: "molecules",
    molecule: "Methyl anthranilate",
    tags: ["ester", "grape", "floral"],
    domains: ["flavor"],
  },
  {
    id: "est-008",
    content:
      "Le salicylate de méthyle donne la note wintergreen (menthe des champs) reconnaissable.",
    category: "molecules",
    molecule: "Methyl salicylate",
    tags: ["ester", "wintergreen", "minty"],
    domains: ["flavor", "fragrance"],
  },

  // ============================================
  // MOLECULES - Lactones (flavor + fragrance)
  // ============================================
  {
    id: "lac-001",
    content:
      "La γ-décalactone est la molécule emblématique de l'arôme pêche.",
    category: "molecules",
    molecule: "gamma-Decalactone",
    tags: ["lactone", "peach", "fruity"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "lac-002",
    content:
      "La γ-undécalactone apporte une note pêche crémeuse aux produits laitiers.",
    category: "molecules",
    molecule: "gamma-Undecalactone",
    tags: ["lactone", "peach", "creamy"],
    domains: ["flavor"],
  },
  {
    id: "lac-003",
    content:
      "La δ-décalactone donne une note crémeuse et beurrée typique des dairy.",
    category: "molecules",
    molecule: "delta-Decalactone",
    tags: ["lactone", "creamy", "buttery"],
    domains: ["flavor"],
  },
  {
    id: "lac-004",
    content:
      "La γ-nonalactone est responsable de la note noix de coco crémeuse.",
    category: "molecules",
    molecule: "gamma-Nonalactone",
    tags: ["lactone", "coconut", "creamy"],
    domains: ["flavor"],
  },
  {
    id: "lac-005",
    content:
      "La whiskey lactone apporte des notes boisées et de noix de coco au whiskey vieilli en fût.",
    category: "molecules",
    molecule: "Whiskey lactone",
    tags: ["lactone", "woody", "coconut", "whiskey"],
    domains: ["flavor"],
  },
  {
    id: "lac-006",
    content:
      "Le sotolone possède une odeur puissante de curry, fenugrec et caramel brûlé.",
    category: "molecules",
    molecule: "Sotolon",
    tags: ["lactone", "curry", "caramel", "fenugreek"],
    domains: ["flavor"],
  },
  {
    id: "lac-007",
    content:
      "Le maltol est un exhausteur de goût sucré avec une note caramel.",
    category: "molecules",
    molecule: "Maltol",
    tags: ["lactone", "sweet", "caramel", "enhancer"],
    domains: ["flavor"],
  },
  {
    id: "lac-008",
    content:
      "L'éthyl maltol est 6 fois plus puissant que le maltol avec une note barbe à papa.",
    category: "molecules",
    molecule: "Ethyl maltol",
    tags: ["lactone", "sweet", "cotton candy", "enhancer"],
    domains: ["flavor"],
  },

  // ============================================
  // MOLECULES - Ketones (flavor + fragrance)
  // ============================================
  {
    id: "ket-001",
    content: "Le diacétyl est le composé principal du goût beurre frais.",
    category: "molecules",
    molecule: "Diacetyl",
    tags: ["ketone", "butter", "dairy"],
    domains: ["flavor"],
  },
  {
    id: "ket-002",
    content:
      "L'acétoïne renforce la note beurrée douce et yaourt du diacétyl.",
    category: "molecules",
    molecule: "Acetoin",
    tags: ["ketone", "butter", "yogurt"],
    domains: ["flavor"],
  },
  {
    id: "ket-003",
    content:
      "Le 2,3-pentanedione est une alternative au diacétyl pour les notes beurrées.",
    category: "molecules",
    molecule: "2,3-Pentanedione",
    tags: ["ketone", "butter"],
    domains: ["flavor"],
  },
  {
    id: "ket-004",
    content:
      "L'α-ionone apporte des notes de violette et boisées aux arômes floraux.",
    category: "molecules",
    molecule: "alpha-Ionone",
    tags: ["ketone", "violet", "floral", "woody"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ket-005",
    content:
      "La β-ionone est plus puissante que l'α-ionone pour la note violette et framboise.",
    category: "molecules",
    molecule: "beta-Ionone",
    tags: ["ketone", "violet", "raspberry"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ket-006",
    content:
      "La β-damascénone possède un seuil de perception extrêmement bas (0.002 ppb) avec des notes de rose et pomme cuite.",
    category: "molecules",
    molecule: "beta-Damascenone",
    tags: ["ketone", "rose", "apple", "low threshold"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ket-007",
    content:
      "La raspberry ketone (frambinone) est le composé impact de l'arôme framboise.",
    category: "molecules",
    molecule: "Raspberry ketone",
    tags: ["ketone", "raspberry"],
    domains: ["flavor"],
  },
  {
    id: "ket-008",
    content: "La menthone contribue à l'arôme menthe poivrée.",
    category: "molecules",
    molecule: "Menthone",
    tags: ["ketone", "mint", "peppermint"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ket-009",
    content:
      "La L-carvone sent la menthe verte (spearmint) tandis que la D-carvone sent le carvi.",
    category: "molecules",
    molecule: "Carvone",
    tags: ["ketone", "spearmint", "caraway", "chirality"],
    domains: ["flavor", "fragrance"],
  },

  // ============================================
  // MOLECULES - Alcohols (flavor + fragrance)
  // ============================================
  {
    id: "alc-001",
    content:
      "Le linalol est un alcool terpénique floral présent dans la lavande et la bergamote.",
    category: "molecules",
    molecule: "Linalool",
    tags: ["alcohol", "floral", "lavender", "terpene"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "alc-002",
    content:
      "Le géraniol apporte une note rose et géranium aux compositions florales.",
    category: "molecules",
    molecule: "Geraniol",
    tags: ["alcohol", "rose", "floral", "terpene"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "alc-003",
    content:
      "Le citronellol possède une odeur de rose avec une facette citronnée.",
    category: "molecules",
    molecule: "Citronellol",
    tags: ["alcohol", "rose", "citrus", "terpene"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "alc-004",
    content:
      "Le menthol active le récepteur TRPM8, créant une sensation de froid.",
    category: "molecules",
    molecule: "Menthol",
    tags: ["alcohol", "cooling", "mint", "terpene"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "alc-005",
    content:
      "Le cis-3-hexénol est la molécule de l'herbe fraîchement coupée.",
    category: "molecules",
    molecule: "cis-3-Hexenol",
    tags: ["alcohol", "green", "grass"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "alc-006",
    content:
      "L'alcool phényléthylique est le principal composé de l'odeur de rose.",
    category: "molecules",
    molecule: "Phenylethyl alcohol",
    tags: ["alcohol", "rose", "floral"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },

  // ============================================
  // MOLECULES - Acids (flavor only)
  // ============================================
  {
    id: "aci-001",
    content:
      "L'acide butyrique en traces contribue au goût du beurre, mais devient désagréable (vomi) à forte concentration.",
    category: "molecules",
    molecule: "Butyric acid",
    tags: ["acid", "butter", "cheese"],
    domains: ["flavor"],
  },
  {
    id: "aci-002",
    content:
      "L'acide isovalérique donne la note caractéristique du fromage et de transpiration.",
    category: "molecules",
    molecule: "Isovaleric acid",
    tags: ["acid", "cheese", "sweaty"],
    domains: ["flavor"],
  },
  {
    id: "aci-003",
    content:
      "L'acide hexanoïque apporte une note de chèvre aux fromages.",
    category: "molecules",
    molecule: "Hexanoic acid",
    tags: ["acid", "goat", "cheese"],
    domains: ["flavor"],
  },

  // ============================================
  // MOLECULES - Pyrazines (flavor only)
  // ============================================
  {
    id: "pyr-001",
    content:
      "La 2-isobutyl-3-méthoxypyrazine a le seuil de perception le plus bas connu (0.002 ppb) avec une odeur intense de poivron vert.",
    category: "molecules",
    molecule: "2-Isobutyl-3-methoxypyrazine",
    tags: ["pyrazine", "bell pepper", "green", "low threshold"],
    domains: ["flavor"],
  },
  {
    id: "pyr-002",
    content:
      "La 2-acétylpyrazine est responsable de l'odeur de pop-corn et de grillé.",
    category: "molecules",
    molecule: "2-Acetylpyrazine",
    tags: ["pyrazine", "popcorn", "roasted"],
    domains: ["flavor"],
  },
  {
    id: "pyr-003",
    content:
      "La 2,3,5-triméthylpyrazine apporte des notes de cacao et café torréfié.",
    category: "molecules",
    molecule: "2,3,5-Trimethylpyrazine",
    tags: ["pyrazine", "cocoa", "coffee", "roasted"],
    domains: ["flavor"],
  },
  {
    id: "pyr-004",
    content:
      "La tétraméthylpyrazine est un marqueur caractéristique du cacao.",
    category: "molecules",
    molecule: "Tetramethylpyrazine",
    tags: ["pyrazine", "cocoa", "chocolate"],
    domains: ["flavor"],
  },

  // ============================================
  // MOLECULES - Thiols & Sulfur (flavor only)
  // ============================================
  {
    id: "thi-001",
    content:
      "Le 4MMP (4-mercapto-4-méthylpentan-2-one) est responsable de l'arôme cassis et buis du Sauvignon blanc.",
    category: "molecules",
    molecule: "4MMP",
    tags: ["thiol", "blackcurrant", "wine", "tropical"],
    domains: ["flavor"],
  },
  {
    id: "thi-002",
    content:
      "Le 3-mercaptohexanol apporte des notes de pamplemousse et fruits tropicaux.",
    category: "molecules",
    molecule: "3-Mercaptohexanol",
    tags: ["thiol", "grapefruit", "tropical"],
    domains: ["flavor"],
  },
  {
    id: "thi-003",
    content:
      "Le furfurylthiol est le composé impact du café torréfié avec un seuil de 0.01 ppb.",
    category: "molecules",
    molecule: "Furfurylthiol",
    tags: ["thiol", "coffee", "roasted", "low threshold"],
    domains: ["flavor"],
  },
  {
    id: "thi-004",
    content:
      "Le méthional donne l'odeur caractéristique de pomme de terre cuite.",
    category: "molecules",
    molecule: "Methional",
    tags: ["thiol", "potato", "savory"],
    domains: ["flavor"],
  },
  {
    id: "thi-005",
    content:
      "Le diméthyl sulfure (DMS) apporte une note de maïs cuit ou chou.",
    category: "molecules",
    molecule: "Dimethyl sulfide",
    tags: ["sulfur", "corn", "cabbage"],
    domains: ["flavor"],
  },
  {
    id: "thi-006",
    content:
      "Le diallyl disulfide est le composé principal de l'ail cuit.",
    category: "molecules",
    molecule: "Diallyl disulfide",
    tags: ["sulfur", "garlic", "cooked"],
    domains: ["flavor"],
  },

  // ============================================
  // MOLECULES - Furanones (flavor)
  // ============================================
  {
    id: "fur-001",
    content:
      "Le furaneol (HDMF) est le composé clé de l'arôme fraise mûre avec des notes caramel.",
    category: "molecules",
    molecule: "Furaneol",
    tags: ["furanone", "strawberry", "caramel"],
    domains: ["flavor"],
  },
  {
    id: "fur-002",
    content:
      "L'homofuraneol renforce le caractère fraise caramélisé.",
    category: "molecules",
    molecule: "Homofuraneol",
    tags: ["furanone", "strawberry", "caramel"],
    domains: ["flavor"],
  },
  {
    id: "fur-003",
    content: "Le norfuraneol apporte une note de pain grillé.",
    category: "molecules",
    molecule: "Norfuraneol",
    tags: ["furanone", "bread", "toasted"],
    domains: ["flavor"],
  },

  // ============================================
  // TERPENES - Monoterpenes (all domains)
  // ============================================
  {
    id: "ter-001",
    content:
      "Le limonène constitue jusqu'à 90% de l'huile essentielle d'orange.",
    category: "terpenes",
    molecule: "Limonene",
    tags: ["monoterpene", "citrus", "orange"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "ter-002",
    content:
      "Le D-limonène sent l'orange tandis que le L-limonène sent le citron.",
    category: "terpenes",
    molecule: "Limonene",
    tags: ["monoterpene", "citrus", "chirality"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ter-003",
    content:
      "Le myrcène apporte une note herbacée caractéristique du houblon.",
    category: "terpenes",
    molecule: "Myrcene",
    tags: ["monoterpene", "herbal", "hops"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ter-004",
    content:
      "L'α-pinène est responsable de l'odeur de pin et des notes résineuses.",
    category: "terpenes",
    molecule: "alpha-Pinene",
    tags: ["monoterpene", "pine", "resinous"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "ter-005",
    content: "Le terpinéol possède une odeur florale de lilas.",
    category: "terpenes",
    molecule: "Terpineol",
    tags: ["monoterpene", "floral", "lilac"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ter-006",
    content:
      "Le citral donne l'odeur caractéristique du citron et de la citronnelle.",
    category: "terpenes",
    molecule: "Citral",
    tags: ["monoterpene", "lemon", "lemongrass"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "ter-007",
    content:
      "L'eucalyptol (1,8-cinéole) est le composé principal de l'eucalyptus.",
    category: "terpenes",
    molecule: "Eucalyptol",
    tags: ["monoterpene", "eucalyptus", "fresh"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "ter-008",
    content:
      "Le thymol est responsable de l'odeur caractéristique du thym.",
    category: "terpenes",
    molecule: "Thymol",
    tags: ["monoterpene", "thyme", "herbal"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "ter-009",
    content: "Le carvacrol apporte la note typique de l'origan.",
    category: "terpenes",
    molecule: "Carvacrol",
    tags: ["monoterpene", "oregano", "herbal"],
    domains: ["flavor", "fragrance"],
  },

  // ============================================
  // TERPENES - Sesquiterpenes
  // ============================================
  {
    id: "ter-010",
    content:
      "Le β-caryophyllène apporte des notes boisées et épicées au poivre noir et au clou de girofle.",
    category: "terpenes",
    molecule: "beta-Caryophyllene",
    tags: ["sesquiterpene", "woody", "spicy", "pepper"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ter-011",
    content:
      "L'α-humulène est le terpène caractéristique du houblon.",
    category: "terpenes",
    molecule: "alpha-Humulene",
    tags: ["sesquiterpene", "hops", "woody"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ter-012",
    content:
      "Le valencène donne la note boisée spécifique de l'orange Valencia.",
    category: "terpenes",
    molecule: "Valencene",
    tags: ["sesquiterpene", "orange", "woody"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ter-013",
    content: "Le zingibérène est le terpène principal du gingembre.",
    category: "terpenes",
    molecule: "Zingiberene",
    tags: ["sesquiterpene", "ginger"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ter-014",
    content:
      "Le nootkatone est responsable de l'arôme caractéristique du pamplemousse.",
    category: "terpenes",
    molecule: "Nootkatone",
    tags: ["sesquiterpene", "grapefruit", "citrus"],
    domains: ["flavor", "fragrance"],
  },

  // ============================================
  // FLAVOR PROFILES
  // ============================================
  {
    id: "pro-001",
    content:
      "Un arôme fraise typique combine furaneol pour le caractère mûr, γ-décalactone pour le fruité, et cis-3-hexénol pour la fraîcheur verte.",
    category: "profiles",
    tags: ["strawberry", "formulation", "accord"],
    domains: ["flavor"],
  },
  {
    id: "pro-002",
    content:
      "Le méthyl cinnamate apporte la note spécifique de fraise des bois.",
    category: "profiles",
    molecule: "Methyl cinnamate",
    tags: ["strawberry", "wild strawberry"],
    domains: ["flavor"],
  },
  {
    id: "pro-003",
    content:
      "L'éthylvanilline est 3 à 4 fois plus puissante que la vanilline naturelle.",
    category: "profiles",
    molecule: "Ethylvanillin",
    tags: ["vanilla", "sweet"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "pro-004",
    content:
      "Le gaïacol apporte une note fumée qui contribue à l'authenticité de la vanille naturelle.",
    category: "profiles",
    molecule: "Guaiacol",
    tags: ["vanilla", "smoky", "natural"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "pro-005",
    content:
      "Un extrait de vanille naturel contient vanilline, p-hydroxybenzaldéhyde, acide vanillique et gaïacol.",
    category: "profiles",
    tags: ["vanilla", "natural", "composition"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "pro-006",
    content:
      "Le profil cacao repose sur les pyrazines pour le torréfié et le phénylacétaldéhyde pour la note miel-chocolat.",
    category: "profiles",
    tags: ["cocoa", "chocolate", "roasted"],
    domains: ["flavor"],
  },
  {
    id: "pro-007",
    content:
      "Le furfurylthiol est le composé impact majeur du café torréfié.",
    category: "profiles",
    molecule: "Furfurylthiol",
    tags: ["coffee", "roasted", "impact"],
    domains: ["flavor"],
  },
  {
    id: "pro-008",
    content:
      "Le guaïacol et le 4-vinylguaïacol apportent les notes fumées et épicées du café.",
    category: "profiles",
    tags: ["coffee", "smoky", "spicy"],
    domains: ["flavor"],
  },
  {
    id: "pro-009",
    content:
      "L'accord beurré classique combine diacétyl, acétoïne et δ-décalactone pour un profil crémeux complet.",
    category: "profiles",
    tags: ["butter", "dairy", "accord"],
    domains: ["flavor"],
  },
  {
    id: "pro-010",
    content:
      "Des traces d'acide butyrique sont nécessaires pour un beurre authentique.",
    category: "profiles",
    molecule: "Butyric acid",
    tags: ["butter", "authentic"],
    domains: ["flavor"],
  },
  {
    id: "pro-011",
    content:
      "Un profil orange équilibré nécessite limonène comme base, décanal pour l'écorce, et linalol pour la fraîcheur florale.",
    category: "profiles",
    tags: ["orange", "citrus", "accord"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "pro-012",
    content:
      "Le L-menthol est la forme active qui procure la sensation de fraîcheur intense.",
    category: "profiles",
    molecule: "L-Menthol",
    tags: ["mint", "cooling", "chirality"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "pro-013",
    content:
      "La différence entre menthe poivrée (peppermint) et menthe verte (spearmint) vient du menthol vs carvone.",
    category: "profiles",
    tags: ["mint", "peppermint", "spearmint"],
    domains: ["flavor", "fragrance"],
  },

  // ============================================
  // THRESHOLDS
  // ============================================
  {
    id: "thr-001",
    content:
      "La 2-isobutyl-3-méthoxypyrazine (poivron vert) a un seuil de 0.002 ppb, le plus bas connu.",
    category: "thresholds",
    molecule: "2-Isobutyl-3-methoxypyrazine",
    tags: ["threshold", "bell pepper", "ultra-low"],
    domains: ["flavor"],
  },
  {
    id: "thr-002",
    content:
      "La β-damascénone est perceptible à seulement 0.002 ppb dans l'eau.",
    category: "thresholds",
    molecule: "beta-Damascenone",
    tags: ["threshold", "rose", "ultra-low"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "thr-003",
    content: "Le furfurylthiol (café) est détectable à 0.01 ppb.",
    category: "thresholds",
    molecule: "Furfurylthiol",
    tags: ["threshold", "coffee", "ultra-low"],
    domains: ["flavor"],
  },
  {
    id: "thr-004",
    content:
      "La géosmine (odeur de terre/betterave) est perceptible à 0.01 ppb.",
    category: "thresholds",
    molecule: "Geosmin",
    tags: ["threshold", "earthy", "ultra-low"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "thr-005",
    content: "Le 4MMP (cassis) a un seuil de 0.1 ppb.",
    category: "thresholds",
    molecule: "4MMP",
    tags: ["threshold", "blackcurrant", "low"],
    domains: ["flavor"],
  },
  {
    id: "thr-006",
    content:
      "La β-ionone (violette) est détectable à 0.007 ppb, expliquant la puissance de cette note.",
    category: "thresholds",
    molecule: "beta-Ionone",
    tags: ["threshold", "violet", "ultra-low"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "thr-007",
    content: "Le linalol est perceptible à 6 ppb dans l'eau.",
    category: "thresholds",
    molecule: "Linalool",
    tags: ["threshold", "floral", "low"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "thr-008",
    content: "La γ-décalactone (pêche) a un seuil de 10 ppb.",
    category: "thresholds",
    molecule: "gamma-Decalactone",
    tags: ["threshold", "peach", "low"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "thr-009",
    content: "La vanilline est perceptible à environ 20 ppb.",
    category: "thresholds",
    molecule: "Vanillin",
    tags: ["threshold", "vanilla", "low"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "thr-010",
    content: "Le furaneol (fraise) a un seuil de 30 ppb.",
    category: "thresholds",
    molecule: "Furaneol",
    tags: ["threshold", "strawberry", "low"],
    domains: ["flavor"],
  },
  {
    id: "thr-011",
    content:
      "Le maltol a un seuil relativement élevé de 35 ppm.",
    category: "thresholds",
    molecule: "Maltol",
    tags: ["threshold", "caramel", "high"],
    domains: ["flavor"],
  },
  {
    id: "thr-012",
    content:
      "Le limonène a un seuil élevé de 10 ppm, nécessitant de fortes doses pour l'impact citrus.",
    category: "thresholds",
    molecule: "Limonene",
    tags: ["threshold", "citrus", "high"],
    domains: ["flavor", "fragrance"],
  },

  // ============================================
  // MAILLARD REACTION (flavor only)
  // ============================================
  {
    id: "mai-001",
    content:
      "La réaction de Maillard entre sucres et acides aminés produit les arômes de cuisson, grillé et torréfié.",
    category: "maillard",
    tags: ["maillard", "cooking", "roasted"],
    domains: ["flavor"],
  },
  {
    id: "mai-002",
    content:
      "Les pyrazines se forment lors de la réaction de Maillard et donnent les notes grillées et torréfiées.",
    category: "maillard",
    tags: ["maillard", "pyrazine", "roasted"],
    domains: ["flavor"],
  },
  {
    id: "mai-003",
    content:
      "Les thiazoles issus de Maillard apportent les notes de viande grillée.",
    category: "maillard",
    tags: ["maillard", "thiazole", "meat", "grilled"],
    domains: ["flavor"],
  },
  {
    id: "mai-004",
    content:
      "Le furfural et l'HMF (hydroxyméthylfurfural) donnent les notes de pain et caramel.",
    category: "maillard",
    tags: ["maillard", "bread", "caramel"],
    domains: ["flavor"],
  },
  {
    id: "mai-005",
    content:
      "La méthionine se dégrade en méthional, donnant l'odeur de pomme de terre cuite.",
    category: "maillard",
    tags: ["strecker", "methionine", "potato"],
    domains: ["flavor"],
  },
  {
    id: "mai-006",
    content:
      "La phénylalanine produit du phénylacétaldéhyde aux notes de miel et chocolat.",
    category: "maillard",
    tags: ["strecker", "phenylalanine", "honey", "chocolate"],
    domains: ["flavor"],
  },
  {
    id: "mai-007",
    content:
      "La leucine génère l'isovaléraldéhyde à l'odeur de malt.",
    category: "maillard",
    tags: ["strecker", "leucine", "malt"],
    domains: ["flavor"],
  },
  {
    id: "mai-008",
    content:
      "La valine produit le 2-méthylpropanal contribuant aux notes chocolat.",
    category: "maillard",
    tags: ["strecker", "valine", "chocolate"],
    domains: ["flavor"],
  },

  // ============================================
  // CHIRALITY (all domains)
  // ============================================
  {
    id: "chi-001",
    content:
      "La chiralité peut complètement changer l'odeur d'une molécule : L-carvone sent la menthe verte, D-carvone sent le carvi.",
    category: "chirality",
    molecule: "Carvone",
    tags: ["chirality", "spearmint", "caraway"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "chi-002",
    content:
      "Le D-limonène sent l'orange tandis que le L-limonène sent le citron.",
    category: "chirality",
    molecule: "Limonene",
    tags: ["chirality", "orange", "lemon"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "chi-003",
    content:
      "Le L-menthol est la forme biologiquement active qui procure la sensation de fraîcheur.",
    category: "chirality",
    molecule: "Menthol",
    tags: ["chirality", "cooling", "mint"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "chi-004",
    content:
      "Le R-linalol (licareol) est floral lavande tandis que le S-linalol (coriandrol) est plus boisé.",
    category: "chirality",
    molecule: "Linalool",
    tags: ["chirality", "lavender", "woody"],
    domains: ["flavor", "fragrance"],
  },

  // ============================================
  // FORMULATION (flavor)
  // ============================================
  {
    id: "for-001",
    content:
      "Les notes de tête (top) sont volatiles et donnent l'impact immédiat : aldéhydes légers, esters courts.",
    category: "formulation",
    tags: ["top notes", "volatile", "impact"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "for-002",
    content:
      "Les notes de cœur (middle) forment le corps de l'arôme : lactones, alcools terpéniques.",
    category: "formulation",
    tags: ["middle notes", "body", "lactones"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "for-003",
    content:
      "Les notes de fond (base) assurent la rémanence : vanilline, muscs, lactones lourdes.",
    category: "formulation",
    tags: ["base notes", "longevity", "fixative"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "for-004",
    content:
      "Commencer une formulation avec 3 à 5 ingrédients pour établir le squelette de l'arôme.",
    category: "formulation",
    tags: ["technique", "basics", "skeleton"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "for-005",
    content:
      "Un arôme doit toujours être testé dans son application finale car le support modifie la perception.",
    category: "formulation",
    tags: ["technique", "testing", "application"],
    domains: ["flavor"],
  },
  {
    id: "for-006",
    content:
      "Les accords sont des combinaisons éprouvées de molécules qui fonctionnent ensemble.",
    category: "formulation",
    tags: ["accord", "combination", "technique"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "for-007",
    content:
      "L'accord beurré classique : diacétyl + acétoïne + δ-décalactone.",
    category: "formulation",
    tags: ["accord", "butter", "recipe"],
    domains: ["flavor"],
  },
  {
    id: "for-008",
    content:
      "L'accord fraise mûre : furaneol + γ-décalactone + cis-3-hexénol.",
    category: "formulation",
    tags: ["accord", "strawberry", "recipe"],
    domains: ["flavor"],
  },
  {
    id: "for-009",
    content:
      "L'accord vanille riche : vanilline + éthylvanilline + coumarine.",
    category: "formulation",
    tags: ["accord", "vanilla", "recipe"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "for-010",
    content: "L'accord citrus frais : limonène + linalol + citral.",
    category: "formulation",
    tags: ["accord", "citrus", "recipe"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "for-011",
    content:
      "L'accord torréfié : pyrazines + furfurylthiol + guaïacol.",
    category: "formulation",
    tags: ["accord", "roasted", "coffee", "recipe"],
    domains: ["flavor"],
  },

  // ============================================
  // ENHANCERS & MODIFIERS (flavor)
  // ============================================
  {
    id: "enh-001",
    content:
      "Le maltol renforce la perception sucrée à des dosages de 50 à 200 ppm.",
    category: "enhancers",
    molecule: "Maltol",
    tags: ["enhancer", "sweet", "dosage"],
    domains: ["flavor"],
  },
  {
    id: "enh-002",
    content:
      "L'éthyl maltol est 6 fois plus efficace que le maltol pour renforcer le sucré.",
    category: "enhancers",
    molecule: "Ethyl maltol",
    tags: ["enhancer", "sweet", "potency"],
    domains: ["flavor"],
  },
  {
    id: "enh-003",
    content:
      "Le furaneol renforce les notes fruitées et sucrées à 10-100 ppm.",
    category: "enhancers",
    molecule: "Furaneol",
    tags: ["enhancer", "fruity", "sweet", "dosage"],
    domains: ["flavor"],
  },
  {
    id: "enh-004",
    content:
      "La vanilline arrondit les profils et renforce le sucré à 100-500 ppm.",
    category: "enhancers",
    molecule: "Vanillin",
    tags: ["enhancer", "sweet", "rounding", "dosage"],
    domains: ["flavor"],
  },
  {
    id: "enh-005",
    content:
      "Le glutamate (MSG) et les nucléotides (IMP, GMP) créent une synergie pour l'umami.",
    category: "enhancers",
    tags: ["enhancer", "umami", "synergy"],
    domains: ["flavor"],
  },
  {
    id: "enh-006",
    content:
      "La vanilline et les lactones peuvent masquer l'amertume.",
    category: "enhancers",
    tags: ["masking", "bitter", "lactone"],
    domains: ["flavor"],
  },
  {
    id: "enh-007",
    content:
      "Les cyclodextrines encapsulent les molécules amères pour réduire leur perception.",
    category: "enhancers",
    tags: ["masking", "bitter", "encapsulation"],
    domains: ["flavor"],
  },
  {
    id: "enh-008",
    content:
      "Le WS-3 procure une sensation de froid intense sans odeur de menthe.",
    category: "enhancers",
    molecule: "WS-3",
    tags: ["cooling", "odorless"],
    domains: ["flavor", "cosmetics"],
  },
  {
    id: "enh-009",
    content:
      "Le WS-23 est l'agent cooling le plus utilisé dans l'industrie pour sa neutralité.",
    category: "enhancers",
    molecule: "WS-23",
    tags: ["cooling", "neutral", "popular"],
    domains: ["flavor", "cosmetics"],
  },
  {
    id: "enh-010",
    content:
      "Le menthyl lactate offre un effet rafraîchissant plus doux que le menthol.",
    category: "enhancers",
    molecule: "Menthyl lactate",
    tags: ["cooling", "mild"],
    domains: ["flavor", "cosmetics"],
  },

  // ============================================
  // SOLVENTS (all domains)
  // ============================================
  {
    id: "sol-001",
    content:
      "Le propylène glycol (PG) est le solvant universel en aromatique avec une légère note sucrée.",
    category: "solvents",
    tags: ["solvent", "PG", "universal"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "sol-002",
    content:
      "La glycérine est utilisée en confiserie pour sa viscosité et son goût sucré.",
    category: "solvents",
    tags: ["solvent", "glycerin", "confectionery"],
    domains: ["flavor", "cosmetics"],
  },
  {
    id: "sol-003",
    content:
      "Le triacetin est un solvant neutre utilisé quand la neutralité gustative est critique.",
    category: "solvents",
    tags: ["solvent", "triacetin", "neutral"],
    domains: ["flavor"],
  },
  {
    id: "sol-004",
    content:
      "L'éthanol est le solvant de choix pour les boissons alcoolisées.",
    category: "solvents",
    tags: ["solvent", "ethanol", "beverages"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "sol-005",
    content:
      "Les MCT (triglycérides à chaîne moyenne) servent de support pour les arômes lipophiles.",
    category: "solvents",
    tags: ["solvent", "MCT", "lipophilic"],
    domains: ["flavor", "cosmetics"],
  },
  {
    id: "sol-006",
    content:
      "La maltodextrine est le support standard pour les arômes en poudre.",
    category: "solvents",
    tags: ["carrier", "maltodextrin", "powder"],
    domains: ["flavor"],
  },
  {
    id: "sol-007",
    content:
      "La gomme arabique permet l'encapsulation des arômes pour une libération contrôlée.",
    category: "solvents",
    tags: ["carrier", "gum arabic", "encapsulation"],
    domains: ["flavor"],
  },
  {
    id: "sol-008",
    content:
      "L'amidon modifié est utilisé pour l'encapsulation et la protection des arômes volatils.",
    category: "solvents",
    tags: ["carrier", "starch", "encapsulation"],
    domains: ["flavor"],
  },

  // ============================================
  // STABILITY (all domains)
  // ============================================
  {
    id: "sta-001",
    content:
      "Les aldéhydes et terpènes sont sensibles à l'oxydation et nécessitent des antioxydants (BHT, tocophérols).",
    category: "stability",
    tags: ["stability", "oxidation", "antioxidant"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "sta-002",
    content:
      "Le citral cyclise en milieu acide, perdant sa note citron caractéristique.",
    category: "stability",
    molecule: "Citral",
    tags: ["stability", "pH", "degradation"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "sta-003",
    content:
      "Les thiols s'oxydent facilement en disulfures, perdant leur puissance aromatique.",
    category: "stability",
    tags: ["stability", "thiol", "oxidation"],
    domains: ["flavor"],
  },
  {
    id: "sta-004",
    content: "Les esters et lactones s'hydrolysent en milieu basique.",
    category: "stability",
    tags: ["stability", "pH", "hydrolysis"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "sta-005",
    content:
      "La lumière dégrade les aldéhydes et les terpènes d'agrumes.",
    category: "stability",
    tags: ["stability", "light", "photodegradation"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "sta-006",
    content:
      "Les arômes volatils et les thiols nécessitent un stockage au froid.",
    category: "stability",
    tags: ["stability", "storage", "cold"],
    domains: ["flavor", "fragrance"],
  },

  // ============================================
  // REGULATION (all domains)
  // ============================================
  {
    id: "reg-001",
    content:
      "Un arôme naturel \"de X\" doit contenir au moins 95% de sa partie aromatisante issue de la source X.",
    category: "regulation",
    tags: ["regulation", "natural", "EU"],
    domains: ["flavor"],
  },
  {
    id: "reg-002",
    content:
      "Un \"arôme naturel\" doit être composé à 100% de substances aromatisantes naturelles.",
    category: "regulation",
    tags: ["regulation", "natural", "definition"],
    domains: ["flavor"],
  },
  {
    id: "reg-003",
    content:
      "Le système FEMA GRAS (Generally Recognized As Safe) classe les substances autorisées aux États-Unis.",
    category: "regulation",
    tags: ["regulation", "FEMA", "GRAS", "USA"],
    domains: ["flavor"],
  },
  {
    id: "reg-004",
    content:
      "En Europe, les arômes sont réglementés par le règlement CE 1334/2008.",
    category: "regulation",
    tags: ["regulation", "EU", "1334/2008"],
    domains: ["flavor"],
  },

  // ============================================
  // TASTE & PERCEPTION (flavor)
  // ============================================
  {
    id: "tas-001",
    content:
      "Le sucré est détecté par les récepteurs T1R2+T1R3 de la langue.",
    category: "taste",
    tags: ["taste", "sweet", "receptor"],
    domains: ["flavor"],
  },
  {
    id: "tas-002",
    content: "Le salé active les canaux sodiques ENaC.",
    category: "taste",
    tags: ["taste", "salty", "receptor"],
    domains: ["flavor"],
  },
  {
    id: "tas-003",
    content:
      "L'acide est perçu via les récepteurs PKD2L1 sensibles aux ions H+.",
    category: "taste",
    tags: ["taste", "sour", "receptor"],
    domains: ["flavor"],
  },
  {
    id: "tas-004",
    content:
      "L'amer est détecté par 25 types différents de récepteurs T2R, expliquant la diversité des substances amères.",
    category: "taste",
    tags: ["taste", "bitter", "receptor"],
    domains: ["flavor"],
  },
  {
    id: "tas-005",
    content:
      "L'umami est perçu par les récepteurs T1R1+T1R3, activés par le glutamate et les nucléotides.",
    category: "taste",
    tags: ["taste", "umami", "receptor"],
    domains: ["flavor"],
  },
  {
    id: "tas-006",
    content:
      "La capsaïcine du piment active le récepteur TRPV1, créant la sensation de chaleur/brûlure.",
    category: "taste",
    molecule: "Capsaicin",
    tags: ["trigeminal", "hot", "TRPV1"],
    domains: ["flavor"],
  },
  {
    id: "tas-007",
    content:
      "Le menthol active le récepteur TRPM8, créant la sensation de froid.",
    category: "taste",
    molecule: "Menthol",
    tags: ["trigeminal", "cooling", "TRPM8"],
    domains: ["flavor", "cosmetics"],
  },
  {
    id: "tas-008",
    content:
      "Le CO2 dissous crée la sensation pétillante via l'anhydrase carbonique.",
    category: "taste",
    tags: ["trigeminal", "sparkling", "CO2"],
    domains: ["flavor"],
  },
  {
    id: "tas-009",
    content:
      "Les tanins provoquent l'astringence en précipitant les protéines salivaires.",
    category: "taste",
    tags: ["trigeminal", "astringent", "tannins"],
    domains: ["flavor"],
  },

  // ============================================
  // CUISINE (flavor only)
  // ============================================
  {
    id: "cui-001",
    content:
      "L'oignon piqué de clous de girofle est l'aromate traditionnel du pot-au-feu français.",
    category: "cuisine",
    tags: ["french", "pot-au-feu", "clove"],
    domains: ["flavor"],
  },
  {
    id: "cui-002",
    content:
      "L'estragon est l'herbe essentielle de la sauce béarnaise.",
    category: "cuisine",
    tags: ["french", "bearnaise", "tarragon"],
    domains: ["flavor"],
  },
  {
    id: "cui-003",
    content:
      "Le curcuma apporte la couleur jaune caractéristique au curry.",
    category: "cuisine",
    molecule: "Curcumin",
    tags: ["curry", "turmeric", "color"],
    domains: ["flavor"],
  },
  {
    id: "cui-004",
    content:
      "Le fenugrec donne au curry sa note sucrée-amère distinctive grâce au sotolone.",
    category: "cuisine",
    molecule: "Sotolon",
    tags: ["curry", "fenugreek"],
    domains: ["flavor"],
  },
  {
    id: "cui-005",
    content:
      "Le cuminaldéhyde est responsable de l'arôme caractéristique du cumin.",
    category: "cuisine",
    molecule: "Cuminaldehyde",
    tags: ["cumin", "spice"],
    domains: ["flavor"],
  },
  {
    id: "cui-006",
    content:
      "Les aromates sont les parties vertes (feuilles) des plantes : basilic, laurier, romarin, estragon.",
    category: "cuisine",
    tags: ["herbs", "aromatics", "definition"],
    domains: ["flavor"],
  },
  {
    id: "cui-007",
    content:
      "Les épices proviennent d'autres parties des plantes : graines (cardamome), écorces (cannelle), racines (gingembre).",
    category: "cuisine",
    tags: ["spices", "definition"],
    domains: ["flavor"],
  },
  {
    id: "cui-008",
    content:
      "Les protéines de pois ont des off-notes vertes et herbacées qui nécessitent un masquage.",
    category: "cuisine",
    tags: ["plant protein", "pea", "off-notes"],
    domains: ["flavor"],
  },
  {
    id: "cui-009",
    content:
      "Les protéines de soja présentent des notes \"beany\" et carton traitables par voie enzymatique.",
    category: "cuisine",
    tags: ["plant protein", "soy", "off-notes"],
    domains: ["flavor"],
  },

  // ============================================
  // INDUSTRY (all domains)
  // ============================================
  {
    id: "ind-001",
    content:
      "Givaudan (Suisse) est le leader mondial de l'industrie des arômes et parfums.",
    category: "industry",
    tags: ["company", "givaudan", "leader"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "ind-002",
    content:
      "dsm-firmenich est né de la fusion Firmenich-DSM en 2023.",
    category: "industry",
    tags: ["company", "dsm-firmenich", "merger"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "ind-003",
    content:
      "IFF (International Flavors & Fragrances) a acquis Frutarom en 2018.",
    category: "industry",
    tags: ["company", "IFF", "acquisition"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "ind-004",
    content:
      "Symrise (Allemagne) est le 4ème acteur mondial des arômes.",
    category: "industry",
    tags: ["company", "symrise"],
    domains: ["flavor", "fragrance", "cosmetics"],
  },
  {
    id: "ind-005",
    content:
      "Mane (France) est la plus grande maison d'arômes familiale au monde.",
    category: "industry",
    tags: ["company", "mane", "family"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ind-006",
    content:
      "Robertet à Grasse est spécialisé dans les matières premières naturelles.",
    category: "industry",
    tags: ["company", "robertet", "natural", "grasse"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ind-007",
    content:
      "Firmenich a acquis DRT (Dérivés Résiniques et Terpéniques) en 2020.",
    category: "industry",
    tags: ["company", "firmenich", "DRT", "acquisition"],
    domains: ["flavor", "fragrance"],
  },
  {
    id: "ind-008",
    content: "Knorr appartient à Unilever, pas à Nestlé.",
    category: "industry",
    tags: ["brand", "knorr", "unilever"],
    domains: ["flavor"],
  },
  {
    id: "ind-009",
    content: "Buitoni, Herta et Maggi sont des marques Nestlé.",
    category: "industry",
    tags: ["brand", "nestle"],
    domains: ["flavor"],
  },
  {
    id: "ind-010",
    content:
      "The Good Scents Company est la référence pour les profils olfactifs et numéros CAS/FEMA.",
    category: "industry",
    tags: ["resource", "database", "good scents"],
    domains: ["flavor", "fragrance"],
  },

  // ============================================
  // FRAGRANCE - OLFACTIVE FAMILIES
  // ============================================
  {
    id: "olf-001",
    content:
      "La famille 'chypre' tire son nom du parfum Chypre de Coty (1917), construit sur un accord bergamote-mousse de chêne-labdanum.",
    category: "olfactive-families",
    tags: ["chypre", "coty", "history"],
    domains: ["fragrance"],
  },
  {
    id: "olf-002",
    content:
      "La famille 'fougère' s'articule autour d'un accord lavande-géranium-coumarine, inspiré par Fougère Royale (1882).",
    category: "olfactive-families",
    tags: ["fougere", "lavender", "coumarin"],
    domains: ["fragrance"],
  },
  {
    id: "olf-003",
    content:
      "Les orientaux (ambrés) combinent vanille, résines, épices et notes animales pour créer des sillages chauds et enveloppants.",
    category: "olfactive-families",
    tags: ["oriental", "amber", "vanilla"],
    domains: ["fragrance"],
  },
  {
    id: "olf-004",
    content:
      "La famille hespéridée regroupe les parfums à base d'agrumes : bergamote, citron, orange, pamplemousse.",
    category: "olfactive-families",
    tags: ["hesperidic", "citrus", "fresh"],
    domains: ["fragrance"],
  },
  {
    id: "olf-005",
    content:
      "Les floraux représentent la plus grande famille olfactive, de la rose au jasmin en passant par le tubéreuse.",
    category: "olfactive-families",
    tags: ["floral", "rose", "jasmine"],
    domains: ["fragrance"],
  },
  {
    id: "olf-006",
    content:
      "Les boisés masculins classiques utilisent le cèdre, le vétiver et le santal comme notes de fond.",
    category: "olfactive-families",
    tags: ["woody", "cedar", "vetiver", "sandalwood"],
    domains: ["fragrance"],
  },

  // ============================================
  // FRAGRANCE - PYRAMID
  // ============================================
  {
    id: "pyr-f-001",
    content:
      "Les notes de tête s'évaporent en 15-30 minutes : agrumes, aldéhydes, notes aromatiques fraîches.",
    category: "pyramid",
    tags: ["top notes", "volatile", "citrus"],
    domains: ["fragrance"],
  },
  {
    id: "pyr-f-002",
    content:
      "Les notes de cœur persistent 2-4 heures et constituent le caractère principal du parfum : floraux, épices, fruités.",
    category: "pyramid",
    tags: ["heart notes", "floral", "spicy"],
    domains: ["fragrance"],
  },
  {
    id: "pyr-f-003",
    content:
      "Les notes de fond durent plusieurs heures à plusieurs jours : bois, muscs, résines, ambre.",
    category: "pyramid",
    tags: ["base notes", "woody", "musk"],
    domains: ["fragrance"],
  },
  {
    id: "pyr-f-004",
    content:
      "Le sillage désigne la traîne olfactive que laisse un parfum dans l'espace traversé.",
    category: "pyramid",
    tags: ["sillage", "trail", "projection"],
    domains: ["fragrance"],
  },
  {
    id: "pyr-f-005",
    content:
      "La tenue d'un parfum dépend de la concentration : eau de cologne (3-5%), EDT (5-15%), EDP (15-20%), extrait (20-40%).",
    category: "pyramid",
    tags: ["concentration", "longevity", "EDT", "EDP"],
    domains: ["fragrance"],
  },

  // ============================================
  // FRAGRANCE - ICONIC PERFUMES
  // ============================================
  {
    id: "ico-001",
    content:
      "Chanel N°5 (1921) fut le premier parfum à utiliser des aldéhydes synthétiques en grande quantité, révolutionnant la parfumerie.",
    category: "iconic-perfumes",
    molecule: "Aldehydes C10-C12",
    tags: ["chanel", "aldehydes", "revolution"],
    domains: ["fragrance"],
  },
  {
    id: "ico-002",
    content:
      "Shalimar de Guerlain (1925) a popularisé l'accord oriental-vanillé qui définit encore la famille orientale.",
    category: "iconic-perfumes",
    molecule: "Vanillin",
    tags: ["guerlain", "shalimar", "oriental"],
    domains: ["fragrance"],
  },
  {
    id: "ico-003",
    content:
      "Eau Sauvage de Dior (1966) a introduit l'hedione, une molécule jasminée fraîche qui est devenue incontournable.",
    category: "iconic-perfumes",
    molecule: "Hedione",
    tags: ["dior", "hedione", "fresh"],
    domains: ["fragrance"],
  },
  {
    id: "ico-004",
    content:
      "Angel de Mugler (1992) a créé la famille 'gourmande' avec son accord éthylmaltol-chocolat-patchouli.",
    category: "iconic-perfumes",
    molecule: "Ethyl maltol",
    tags: ["mugler", "gourmand", "angel"],
    domains: ["fragrance"],
  },
  {
    id: "ico-005",
    content:
      "CK One (1994) a démocratisé les parfums unisexes avec son accord thé-musc-agrumes.",
    category: "iconic-perfumes",
    tags: ["calvin klein", "unisex", "minimalist"],
    domains: ["fragrance"],
  },
  {
    id: "ico-006",
    content:
      "L'Iso E Super, molécule boisée ambrée, est devenue un pilier de la parfumerie moderne depuis Escentric Molecules 01.",
    category: "iconic-perfumes",
    molecule: "Iso E Super",
    tags: ["iso e super", "woody", "modern"],
    domains: ["fragrance"],
  },

  // ============================================
  // FRAGRANCE - ACCORDS
  // ============================================
  {
    id: "acc-001",
    content:
      "L'accord fougère combine lavande, géranium et coumarine pour créer une note aromatique-herbacée.",
    category: "accords",
    molecule: "Coumarin",
    tags: ["fougere", "lavender", "aromatic"],
    domains: ["fragrance"],
  },
  {
    id: "acc-002",
    content:
      "L'accord chypré repose sur bergamote en tête, rose-jasmin en cœur, et mousse de chêne-patchouli en fond.",
    category: "accords",
    tags: ["chypre", "oakmoss", "bergamot"],
    domains: ["fragrance"],
  },
  {
    id: "acc-003",
    content:
      "L'ambre gris synthétique combine vanilline, labdanum et muscs pour recréer cette note animale précieuse.",
    category: "accords",
    tags: ["ambergris", "amber", "synthetic"],
    domains: ["fragrance"],
  },
  {
    id: "acc-004",
    content:
      "L'accord cuir utilise le bouleau, le styrax et le castoreum synthétique pour évoquer le cuir tanné.",
    category: "accords",
    tags: ["leather", "birch", "styrax"],
    domains: ["fragrance"],
  },
  {
    id: "acc-005",
    content:
      "Le musc blanc moderne (galaxolide, habanolide) a remplacé les muscs animaux interdits.",
    category: "accords",
    molecule: "Galaxolide",
    tags: ["white musk", "clean", "synthetic"],
    domains: ["fragrance", "cosmetics"],
  },

  // ============================================
  // FRAGRANCE - NATURAL VS SYNTHETIC
  // ============================================
  {
    id: "nat-001",
    content:
      "L'huile essentielle de rose naturelle coûte environ 5000€/kg tandis que le géraniol synthétique coûte moins de 20€/kg.",
    category: "natural-vs-synthetic",
    molecule: "Geraniol",
    tags: ["rose", "cost", "natural"],
    domains: ["fragrance"],
  },
  {
    id: "nat-002",
    content:
      "Le santal de Mysore naturel est quasi-extinct ; le Javanol et le Polysantol sont ses substituts synthétiques.",
    category: "natural-vs-synthetic",
    molecule: "Javanol",
    tags: ["sandalwood", "synthetic", "sustainability"],
    domains: ["fragrance"],
  },
  {
    id: "nat-003",
    content:
      "Les muscs synthétiques ont remplacé les muscs animaux (civette, castor) pour des raisons éthiques et de durabilité.",
    category: "natural-vs-synthetic",
    tags: ["musk", "animal", "ethics"],
    domains: ["fragrance"],
  },
  {
    id: "nat-004",
    content:
      "La molécule Calone apporte une note marine-ozone qui n'existe pas dans la nature.",
    category: "natural-vs-synthetic",
    molecule: "Calone",
    tags: ["marine", "synthetic", "innovation"],
    domains: ["fragrance"],
  },
  {
    id: "nat-005",
    content:
      "L'ambroxan (du sclareol) reproduit les facettes de l'ambre gris naturel à moindre coût.",
    category: "natural-vs-synthetic",
    molecule: "Ambroxan",
    tags: ["ambergris", "sclareol", "amber"],
    domains: ["fragrance"],
  },

  // ============================================
  // FRAGRANCE - EXTRACTION
  // ============================================
  {
    id: "ext-001",
    content:
      "L'enfleurage à froid, technique grassoise traditionnelle, capture les parfums de fleurs fragiles comme le jasmin.",
    category: "extraction",
    tags: ["enfleurage", "grasse", "traditional"],
    domains: ["fragrance"],
  },
  {
    id: "ext-002",
    content:
      "L'extraction au CO2 supercritique préserve les molécules thermosensibles détruites par la distillation.",
    category: "extraction",
    tags: ["CO2", "supercritical", "modern"],
    domains: ["fragrance", "cosmetics"],
  },
  {
    id: "ext-003",
    content:
      "Il faut 1 tonne de pétales de rose pour produire 1 kg d'absolue de rose.",
    category: "extraction",
    tags: ["rose", "yield", "absolute"],
    domains: ["fragrance"],
  },
  {
    id: "ext-004",
    content:
      "L'expression à froid des zestes d'agrumes préserve les aldéhydes délicats qui seraient détruits par la chaleur.",
    category: "extraction",
    tags: ["cold pressing", "citrus", "aldehydes"],
    domains: ["fragrance", "flavor"],
  },
  {
    id: "ext-005",
    content:
      "La distillation fractionnée permet d'isoler des fractions spécifiques d'une huile essentielle.",
    category: "extraction",
    tags: ["distillation", "fractionation", "technique"],
    domains: ["fragrance"],
  },

  // ============================================
  // FRAGRANCE - RAW MATERIALS
  // ============================================
  {
    id: "raw-001",
    content:
      "Le vétiver d'Haïti est considéré comme le plus fin au monde pour ses notes boisées et terreuses.",
    category: "raw-materials",
    molecule: "Vetiverol",
    tags: ["vetiver", "haiti", "woody"],
    domains: ["fragrance"],
  },
  {
    id: "raw-002",
    content:
      "Le jasmin sambac (fleur de thé) offre une note plus fruitée et indolée que le jasmin grandiflorum.",
    category: "raw-materials",
    molecule: "Indole",
    tags: ["jasmine", "sambac", "indole"],
    domains: ["fragrance"],
  },
  {
    id: "raw-003",
    content:
      "L'oud naturel (bois d'agar infecté) peut coûter jusqu'à 30 000€/kg, c'est l'une des matières les plus chères au monde.",
    category: "raw-materials",
    tags: ["oud", "agarwood", "luxury"],
    domains: ["fragrance"],
  },
  {
    id: "raw-004",
    content:
      "La fleur d'oranger donne trois produits : l'huile de néroli (fleurs), l'huile de petit grain (feuilles) et l'eau de fleur d'oranger.",
    category: "raw-materials",
    tags: ["neroli", "petitgrain", "orange blossom"],
    domains: ["fragrance"],
  },
  {
    id: "raw-005",
    content:
      "Le patchouli s'améliore avec l'âge : les huiles vieillies plusieurs années sont plus prisées.",
    category: "raw-materials",
    molecule: "Patchoulol",
    tags: ["patchouli", "aging", "woody"],
    domains: ["fragrance"],
  },

  // ============================================
  // FRAGRANCE - HISTORY
  // ============================================
  {
    id: "his-001",
    content:
      "Grasse est devenue la capitale mondiale du parfum au XVIe siècle grâce aux gantiers-parfumeurs.",
    category: "history",
    tags: ["grasse", "history", "gloves"],
    domains: ["fragrance"],
  },
  {
    id: "his-002",
    content:
      "L'Eau de Cologne originale (1709) de Jean-Marie Farina utilisait bergamote, citron et néroli.",
    category: "history",
    tags: ["cologne", "farina", "history"],
    domains: ["fragrance"],
  },
  {
    id: "his-003",
    content:
      "La coumarine synthétisée en 1868 fut la première molécule aromatique créée en laboratoire pour la parfumerie.",
    category: "history",
    molecule: "Coumarin",
    tags: ["synthetic", "history", "coumarin"],
    domains: ["fragrance"],
  },
  {
    id: "his-004",
    content:
      "Ernest Beaux créa Chanel N°5 en 1921 en utilisant par erreur une dose massive d'aldéhydes.",
    category: "history",
    tags: ["chanel", "beaux", "aldehydes"],
    domains: ["fragrance"],
  },
  {
    id: "his-005",
    content:
      "Les Égyptiens utilisaient le kyphi, un parfum sacré brûlé au coucher du soleil, dès 1500 av. J.-C.",
    category: "history",
    tags: ["egypt", "kyphi", "ancient"],
    domains: ["fragrance"],
  },

  // ============================================
  // COSMETICS - ACTIVES
  // ============================================
  {
    id: "act-001",
    content:
      "Le rétinol (vitamine A) est l'actif anti-âge le plus étudié avec plus de 700 publications scientifiques.",
    category: "actives",
    molecule: "Retinol",
    tags: ["retinol", "anti-aging", "vitamin A"],
    domains: ["cosmetics"],
  },
  {
    id: "act-002",
    content:
      "L'acide hyaluronique peut retenir jusqu'à 1000 fois son poids en eau, c'est l'hydratant par excellence.",
    category: "actives",
    molecule: "Hyaluronic acid",
    tags: ["hyaluronic acid", "hydration", "moisture"],
    domains: ["cosmetics"],
  },
  {
    id: "act-003",
    content:
      "La vitamine C (acide ascorbique) est un antioxydant puissant mais très instable en formulation.",
    category: "actives",
    molecule: "Ascorbic acid",
    tags: ["vitamin C", "antioxidant", "stability"],
    domains: ["cosmetics"],
  },
  {
    id: "act-004",
    content:
      "Le niacinamide (vitamine B3) renforce la barrière cutanée et réduit l'apparence des pores.",
    category: "actives",
    molecule: "Niacinamide",
    tags: ["niacinamide", "barrier", "pores"],
    domains: ["cosmetics"],
  },
  {
    id: "act-005",
    content:
      "Les peptides biomimétiques imitent les signaux cellulaires pour stimuler la production de collagène.",
    category: "actives",
    tags: ["peptides", "collagen", "signaling"],
    domains: ["cosmetics"],
  },
  {
    id: "act-006",
    content:
      "L'acide salicylique (BHA) pénètre dans les pores pour exfolier en profondeur les peaux grasses.",
    category: "actives",
    molecule: "Salicylic acid",
    tags: ["BHA", "exfoliation", "acne"],
    domains: ["cosmetics"],
  },
  {
    id: "act-007",
    content:
      "Les céramides représentent 50% des lipides de la couche cornée et sont essentiels à la barrière cutanée.",
    category: "actives",
    molecule: "Ceramides",
    tags: ["ceramides", "barrier", "lipids"],
    domains: ["cosmetics"],
  },
  {
    id: "act-008",
    content:
      "Le bakuchiol est présenté comme l'alternative naturelle au rétinol avec moins d'irritation.",
    category: "actives",
    molecule: "Bakuchiol",
    tags: ["bakuchiol", "natural", "retinol alternative"],
    domains: ["cosmetics"],
  },

  // ============================================
  // COSMETICS - FORMULATION
  // ============================================
  {
    id: "cos-001",
    content:
      "Une émulsion H/E (huile dans eau) est légère et pénétrante, une E/H est plus occlusive et protectrice.",
    category: "cos-formulation",
    tags: ["emulsion", "HE", "EH", "texture"],
    domains: ["cosmetics"],
  },
  {
    id: "cos-002",
    content:
      "Le HLB (Hydrophilic-Lipophilic Balance) détermine si un émulsifiant crée une émulsion H/E ou E/H.",
    category: "cos-formulation",
    tags: ["HLB", "emulsifier", "formulation"],
    domains: ["cosmetics"],
  },
  {
    id: "cos-003",
    content:
      "Les silicones volatiles (cyclopentasiloxane) s'évaporent en laissant un toucher soyeux non gras.",
    category: "cos-formulation",
    molecule: "Cyclopentasiloxane",
    tags: ["silicone", "volatile", "sensory"],
    domains: ["cosmetics"],
  },
  {
    id: "cos-004",
    content:
      "Le xanthane à 0.2-0.5% crée un gel fluide, à 1-2% un gel épais, illustrant la sensibilité au dosage.",
    category: "cos-formulation",
    molecule: "Xanthan gum",
    tags: ["thickener", "gel", "dosage"],
    domains: ["cosmetics"],
  },
  {
    id: "cos-005",
    content:
      "Les tensioactifs anioniques (SLS) moussent bien mais peuvent être irritants ; les non-ioniques sont plus doux.",
    category: "cos-formulation",
    tags: ["surfactant", "SLS", "cleansing"],
    domains: ["cosmetics"],
  },
  {
    id: "cos-006",
    content:
      "Le squalane (dérivé de l'olive ou de la canne) est un émollient biomimétique du sébum humain.",
    category: "cos-formulation",
    molecule: "Squalane",
    tags: ["squalane", "emollient", "biomimetic"],
    domains: ["cosmetics"],
  },

  // ============================================
  // COSMETICS - SKIN SCIENCE
  // ============================================
  {
    id: "ski-001",
    content:
      "La peau possède un pH naturel de 4,5 à 5,5 (légèrement acide), le 'manteau acide' qui protège contre les bactéries.",
    category: "skin-science",
    tags: ["pH", "acid mantle", "barrier"],
    domains: ["cosmetics"],
  },
  {
    id: "ski-002",
    content:
      "Le renouvellement cellulaire de l'épiderme prend environ 28 jours chez l'adulte, plus long avec l'âge.",
    category: "skin-science",
    tags: ["cell turnover", "epidermis", "aging"],
    domains: ["cosmetics"],
  },
  {
    id: "ski-003",
    content:
      "Le collagène représente 75-80% du poids sec du derme et sa production diminue de 1% par an après 20 ans.",
    category: "skin-science",
    tags: ["collagen", "aging", "dermis"],
    domains: ["cosmetics"],
  },
  {
    id: "ski-004",
    content:
      "La mélanine est produite par les mélanocytes pour protéger l'ADN des UV, causant le bronzage.",
    category: "skin-science",
    molecule: "Melanin",
    tags: ["melanin", "UV", "pigmentation"],
    domains: ["cosmetics"],
  },
  {
    id: "ski-005",
    content:
      "Le microbiome cutané contient des milliards de bactéries qui participent à l'immunité de la peau.",
    category: "skin-science",
    tags: ["microbiome", "bacteria", "immunity"],
    domains: ["cosmetics"],
  },
  {
    id: "ski-006",
    content:
      "La perte insensible en eau (PIE) mesure l'évaporation à travers la peau, indicateur de la fonction barrière.",
    category: "skin-science",
    tags: ["TEWL", "barrier", "hydration"],
    domains: ["cosmetics"],
  },

  // ============================================
  // COSMETICS - HAIR SCIENCE
  // ============================================
  {
    id: "hai-001",
    content:
      "Le cheveu est composé à 95% de kératine, une protéine fibreuse riche en cystéine.",
    category: "hair-science",
    molecule: "Keratin",
    tags: ["keratin", "protein", "structure"],
    domains: ["cosmetics"],
  },
  {
    id: "hai-002",
    content:
      "Les ponts disulfures entre les chaînes de kératine donnent au cheveu sa forme ; les permanentes les brisent et reforment.",
    category: "hair-science",
    tags: ["disulfide bonds", "perm", "shape"],
    domains: ["cosmetics"],
  },
  {
    id: "hai-003",
    content:
      "La cuticule du cheveu, composée d'écailles, reflète la lumière quand elle est lisse (cheveu brillant).",
    category: "hair-science",
    tags: ["cuticle", "shine", "damage"],
    domains: ["cosmetics"],
  },
  {
    id: "hai-004",
    content:
      "Les silicones comme le diméthicone lissent la cuticule mais peuvent créer un effet de build-up.",
    category: "hair-science",
    molecule: "Dimethicone",
    tags: ["silicone", "smoothing", "buildup"],
    domains: ["cosmetics"],
  },
  {
    id: "hai-005",
    content:
      "Le cheveu pousse en moyenne de 1 cm par mois, soit environ 15 cm par an.",
    category: "hair-science",
    tags: ["growth", "cycle", "length"],
    domains: ["cosmetics"],
  },

  // ============================================
  // COSMETICS - PRESERVATION
  // ============================================
  {
    id: "pre-001",
    content:
      "Les parabènes (méthyl, propyl) sont des conservateurs efficaces mais controversés, remplacés par des alternatives.",
    category: "preservation",
    tags: ["parabens", "preservation", "controversy"],
    domains: ["cosmetics"],
  },
  {
    id: "pre-002",
    content:
      "Le phenoxyethanol à 1% max est le conservateur le plus utilisé en cosmétique naturelle.",
    category: "preservation",
    molecule: "Phenoxyethanol",
    tags: ["phenoxyethanol", "natural", "preservation"],
    domains: ["cosmetics"],
  },
  {
    id: "pre-003",
    content:
      "Le challenge test (pharmacopée) vérifie qu'un produit résiste à la contamination microbienne.",
    category: "preservation",
    tags: ["challenge test", "microbial", "safety"],
    domains: ["cosmetics"],
  },
  {
    id: "pre-004",
    content:
      "Les formules anhydres (baumes, huiles) nécessitent peu ou pas de conservateurs car les bactéries ont besoin d'eau.",
    category: "preservation",
    tags: ["anhydrous", "water-free", "stability"],
    domains: ["cosmetics"],
  },
  {
    id: "pre-005",
    content:
      "L'activité de l'eau (Aw) mesure l'eau disponible pour la croissance microbienne ; Aw < 0.6 est auto-conservé.",
    category: "preservation",
    tags: ["water activity", "Aw", "self-preserving"],
    domains: ["cosmetics"],
  },

  // ============================================
  // COSMETICS - TEXTURE
  // ============================================
  {
    id: "tex-001",
    content:
      "Les gels aqueux utilisent des gélifiants (carbomer, gommes) pour créer une texture fraîche sans huile.",
    category: "texture",
    tags: ["gel", "carbomer", "water-based"],
    domains: ["cosmetics"],
  },
  {
    id: "tex-002",
    content:
      "Les sérums ont une viscosité faible et une concentration élevée en actifs pour une pénétration optimale.",
    category: "texture",
    tags: ["serum", "concentration", "penetration"],
    domains: ["cosmetics"],
  },
  {
    id: "tex-003",
    content:
      "Les baumes sont des mélanges anhydres de cires et huiles qui forment une barrière occlusive.",
    category: "texture",
    tags: ["balm", "anhydrous", "occlusive"],
    domains: ["cosmetics"],
  },
  {
    id: "tex-004",
    content:
      "Les mousses utilisent des gaz propulseurs ou des tensioactifs pour incorporer de l'air dans la formule.",
    category: "texture",
    tags: ["foam", "mousse", "aeration"],
    domains: ["cosmetics"],
  },
  {
    id: "tex-005",
    content:
      "Le 'skin feel' décrit les sensations tactiles : glissant, absorbant, collant, velouté...",
    category: "texture",
    tags: ["skin feel", "sensory", "touch"],
    domains: ["cosmetics"],
  },

  // ============================================
  // COSMETICS - CLAIMS
  // ============================================
  {
    id: "cla-001",
    content:
      "Un cosmétique ne peut revendiquer d'action thérapeutique sous peine d'être reclassé en médicament.",
    category: "claims",
    tags: ["claims", "regulation", "therapeutic"],
    domains: ["cosmetics"],
  },
  {
    id: "cla-002",
    content:
      "'Hypoallergénique' signifie formulé pour minimiser les risques d'allergie, pas garanti sans réaction.",
    category: "claims",
    tags: ["hypoallergenic", "claims", "allergy"],
    domains: ["cosmetics"],
  },
  {
    id: "cla-003",
    content:
      "'Non comédogène' indique que le produit n'obstruera pas les pores, important pour les peaux à tendance acnéique.",
    category: "claims",
    tags: ["non-comedogenic", "acne", "pores"],
    domains: ["cosmetics"],
  },
  {
    id: "cla-004",
    content:
      "Les indices de protection SPF mesurent uniquement la protection contre les UVB, pas les UVA.",
    category: "claims",
    tags: ["SPF", "UV protection", "sunscreen"],
    domains: ["cosmetics"],
  },
  {
    id: "cla-005",
    content:
      "Le label 'bio' en cosmétique exige un minimum d'ingrédients naturels et interdit certains ingrédients synthétiques.",
    category: "claims",
    tags: ["organic", "natural", "certification"],
    domains: ["cosmetics"],
  },

  // ============================================
  // COSMETICS - NATURAL COSMETICS
  // ============================================
  {
    id: "nat-cos-001",
    content:
      "L'huile de jojoba est en réalité une cire liquide, très proche du sébum humain.",
    category: "natural-cosmetics",
    tags: ["jojoba", "wax", "sebum"],
    domains: ["cosmetics"],
  },
  {
    id: "nat-cos-002",
    content:
      "L'aloe vera contient plus de 200 composés actifs dont des polysaccharides apaisants.",
    category: "natural-cosmetics",
    tags: ["aloe vera", "soothing", "natural"],
    domains: ["cosmetics"],
  },
  {
    id: "nat-cos-003",
    content:
      "Le beurre de karité non raffiné conserve ses vitamines A, E et F, contrairement au raffiné.",
    category: "natural-cosmetics",
    tags: ["shea butter", "vitamins", "unrefined"],
    domains: ["cosmetics"],
  },
  {
    id: "nat-cos-004",
    content:
      "L'huile d'argan, riche en tocophérols et acides gras, est utilisée pour la peau et les cheveux.",
    category: "natural-cosmetics",
    tags: ["argan", "tocopherols", "morocco"],
    domains: ["cosmetics"],
  },
  {
    id: "nat-cos-005",
    content:
      "Les huiles essentielles, bien que naturelles, peuvent être irritantes ou allergisantes à forte dose.",
    category: "natural-cosmetics",
    tags: ["essential oils", "irritation", "allergy"],
    domains: ["cosmetics", "fragrance"],
  },

  // ============================================
  // COSMETICS - REGULATION
  // ============================================
  {
    id: "cos-reg-001",
    content:
      "En Europe, le Règlement Cosmétiques (EC) No 1223/2009 définit les obligations de sécurité et d'étiquetage.",
    category: "cos-regulation",
    tags: ["EU regulation", "1223/2009", "safety"],
    domains: ["cosmetics"],
  },
  {
    id: "cos-reg-002",
    content:
      "La liste INCI (International Nomenclature of Cosmetic Ingredients) standardise les noms d'ingrédients.",
    category: "cos-regulation",
    tags: ["INCI", "ingredients", "labeling"],
    domains: ["cosmetics"],
  },
  {
    id: "cos-reg-003",
    content:
      "Les tests sur animaux sont interdits en Europe pour les cosmétiques depuis 2013.",
    category: "cos-regulation",
    tags: ["animal testing", "EU ban", "cruelty-free"],
    domains: ["cosmetics"],
  },
  {
    id: "cos-reg-004",
    content:
      "Le dossier DIP (Dossier d'Information Produit) doit être disponible pour chaque cosmétique commercialisé en UE.",
    category: "cos-regulation",
    tags: ["PIF", "documentation", "compliance"],
    domains: ["cosmetics"],
  },
  {
    id: "cos-reg-005",
    content:
      "26 allergènes parfumants doivent être déclarés sur l'étiquette s'ils dépassent certains seuils.",
    category: "cos-regulation",
    tags: ["allergens", "fragrance", "labeling"],
    domains: ["cosmetics", "fragrance"],
  },

  // ============================================
  // COSMETICS - TRENDS
  // ============================================
  {
    id: "tre-001",
    content:
      "'Clean beauty' privilégie les formules sans ingrédients controversés, bien que la définition varie.",
    category: "trends",
    tags: ["clean beauty", "trend", "controversy"],
    domains: ["cosmetics"],
  },
  {
    id: "tre-002",
    content:
      "La K-beauty (cosmétique coréenne) a popularisé les routines multi-étapes et les textures innovantes.",
    category: "trends",
    tags: ["K-beauty", "routine", "innovation"],
    domains: ["cosmetics"],
  },
  {
    id: "tre-003",
    content:
      "Le 'skinimalism' prône une routine simplifiée avec moins de produits mais plus efficaces.",
    category: "trends",
    tags: ["skinimalism", "minimalist", "simplified"],
    domains: ["cosmetics"],
  },
  {
    id: "tre-004",
    content:
      "Les produits 'waterless' (solides, poudres) réduisent l'eau dans les formules pour la durabilité.",
    category: "trends",
    tags: ["waterless", "solid", "sustainability"],
    domains: ["cosmetics"],
  },
  {
    id: "tre-005",
    content:
      "La cosmétique 'adaptogène' incorpore des ingrédients qui aident la peau à s'adapter au stress.",
    category: "trends",
    tags: ["adaptogen", "stress", "wellness"],
    domains: ["cosmetics"],
  },
];

// Legacy alias for backward compatibility
export const AROME_FACTS = KNOWLEDGE_FACTS;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a random fact from all categories
 */
export function getRandomFact(): KnowledgeFact {
  return KNOWLEDGE_FACTS[Math.floor(Math.random() * KNOWLEDGE_FACTS.length)];
}

/**
 * Get a random fact from a specific domain
 */
export function getRandomFactByDomain(domain: FactDomain): KnowledgeFact | null {
  const facts = KNOWLEDGE_FACTS.filter((f) => f.domains.includes(domain));
  if (facts.length === 0) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}

/**
 * Get facts filtered by domain
 */
export function getFactsByDomain(domain: FactDomain): KnowledgeFact[] {
  return KNOWLEDGE_FACTS.filter((f) => f.domains.includes(domain));
}

/**
 * Get a random fact from a specific category
 */
export function getRandomFactByCategory(category: FactCategory): KnowledgeFact | null {
  const facts = KNOWLEDGE_FACTS.filter((f) => f.category === category);
  if (facts.length === 0) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}

/**
 * Get a random fact that mentions a specific molecule
 */
export function getRandomFactByMolecule(molecule: string): KnowledgeFact | null {
  const facts = KNOWLEDGE_FACTS.filter(
    (f) => f.molecule?.toLowerCase() === molecule.toLowerCase()
  );
  if (facts.length === 0) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}

/**
 * Get a random fact that has a specific tag
 */
export function getRandomFactByTag(tag: string): KnowledgeFact | null {
  const facts = KNOWLEDGE_FACTS.filter((f) =>
    f.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
  if (facts.length === 0) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}

/**
 * Get multiple random facts (non-repeating)
 */
export function getRandomFacts(count: number): KnowledgeFact[] {
  const shuffled = [...KNOWLEDGE_FACTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, KNOWLEDGE_FACTS.length));
}

/**
 * Get all facts for a category
 */
export function getFactsByCategory(category: FactCategory): KnowledgeFact[] {
  return KNOWLEDGE_FACTS.filter((f) => f.category === category);
}

/**
 * Get all unique molecules mentioned in facts
 */
export function getAllMolecules(): string[] {
  const molecules = KNOWLEDGE_FACTS.filter((f) => f.molecule).map((f) => f.molecule!);
  return [...new Set(molecules)].sort();
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = KNOWLEDGE_FACTS.flatMap((f) => f.tags || []);
  return [...new Set(tags)].sort();
}

/**
 * Get categories available for a specific domain
 */
export function getCategoriesForDomain(domain: FactDomain): { value: string; label: string }[] {
  const facts = getFactsByDomain(domain);
  const categoryValues = new Set(facts.map((f) => f.category));
  return FACT_CATEGORIES.filter((c) => categoryValues.has(c.value));
}
