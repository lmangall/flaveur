// Arome knowledge facts for flavorists
// Usage: Display random facts during onboarding, loading states, or as tips

export const FACT_CATEGORIES = [
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

export type FactCategory = (typeof FACT_CATEGORIES)[number]["value"];

export interface AromeFact {
  id: string;
  content: string;
  category: FactCategory;
  molecule?: string;
  tags?: string[];
}

export const AROME_FACTS: AromeFact[] = [
  // ============================================
  // MOLECULES - Aldehydes
  // ============================================
  {
    id: "ald-001",
    content:
      "L'acétaldéhyde apporte des notes éthérées et de pomme verte, couramment utilisé dans les arômes de fruits et d'alcool.",
    category: "molecules",
    molecule: "Acetaldehyde",
    tags: ["aldehyde", "fruity", "apple"],
  },
  {
    id: "ald-002",
    content:
      "L'hexanal est responsable de l'odeur d'herbe fraîchement coupée dans les arômes verts.",
    category: "molecules",
    molecule: "Hexanal",
    tags: ["aldehyde", "green", "grass"],
  },
  {
    id: "ald-003",
    content:
      "Le (E)-2-hexénal donne la note caractéristique de feuille de tomate verte.",
    category: "molecules",
    molecule: "(E)-2-Hexenal",
    tags: ["aldehyde", "green", "tomato"],
  },
  {
    id: "ald-004",
    content:
      "L'octanal apporte une note aldéhydique citronnée et légèrement grasse aux agrumes.",
    category: "molecules",
    molecule: "Octanal",
    tags: ["aldehyde", "citrus"],
  },
  {
    id: "ald-005",
    content: "Le nonanal possède un profil floral cireux rappelant la rose.",
    category: "molecules",
    molecule: "Nonanal",
    tags: ["aldehyde", "floral", "waxy"],
  },
  {
    id: "ald-006",
    content:
      "Le décanal est la molécule clé de l'écorce d'orange avec sa note cireuse caractéristique.",
    category: "molecules",
    molecule: "Decanal",
    tags: ["aldehyde", "citrus", "orange"],
  },
  {
    id: "ald-007",
    content:
      "Le benzaldéhyde est responsable de l'odeur d'amande amère et de cerise dans les fruits à noyau.",
    category: "molecules",
    molecule: "Benzaldehyde",
    tags: ["aldehyde", "almond", "cherry"],
  },
  {
    id: "ald-008",
    content:
      "Le cinnamaldéhyde est le composé principal de l'arôme de cannelle.",
    category: "molecules",
    molecule: "Cinnamaldehyde",
    tags: ["aldehyde", "spice", "cinnamon"],
  },
  {
    id: "ald-009",
    content:
      "La vanilline représente 1 à 2% du poids sec d'une gousse de vanille.",
    category: "molecules",
    molecule: "Vanillin",
    tags: ["aldehyde", "vanilla", "sweet"],
  },
  {
    id: "ald-010",
    content:
      "Le 2,4-décadiénal apporte une note grasse de friture, typique des snacks et arômes chicken.",
    category: "molecules",
    molecule: "2,4-Decadienal",
    tags: ["aldehyde", "fatty", "fried"],
  },

  // ============================================
  // MOLECULES - Esters
  // ============================================
  {
    id: "est-001",
    content:
      "L'acétate d'éthyle est un ester fruité utilisé comme base dans de nombreux arômes de fruits.",
    category: "molecules",
    molecule: "Ethyl acetate",
    tags: ["ester", "fruity"],
  },
  {
    id: "est-002",
    content:
      "L'acétate d'isoamyle est la molécule signature de l'arôme banane et bonbon.",
    category: "molecules",
    molecule: "Isoamyl acetate",
    tags: ["ester", "banana", "candy"],
  },
  {
    id: "est-003",
    content:
      "L'acétate de benzyle combine des notes de jasmin et de fruité.",
    category: "molecules",
    molecule: "Benzyl acetate",
    tags: ["ester", "floral", "jasmine"],
  },
  {
    id: "est-004",
    content:
      "Le butyrate d'éthyle apporte une note d'ananas caractéristique aux arômes tropicaux.",
    category: "molecules",
    molecule: "Ethyl butyrate",
    tags: ["ester", "pineapple", "tropical"],
  },
  {
    id: "est-005",
    content:
      "L'hexanoate d'éthyle contribue aux notes de pomme et d'ananas.",
    category: "molecules",
    molecule: "Ethyl hexanoate",
    tags: ["ester", "apple", "pineapple"],
  },
  {
    id: "est-006",
    content:
      "L'acétate de cis-3-hexényle donne une note verte de banane pas mûre.",
    category: "molecules",
    molecule: "cis-3-Hexenyl acetate",
    tags: ["ester", "green", "unripe"],
  },
  {
    id: "est-007",
    content:
      "L'anthranilate de méthyle est responsable de l'arôme caractéristique du raisin Concord.",
    category: "molecules",
    molecule: "Methyl anthranilate",
    tags: ["ester", "grape", "floral"],
  },
  {
    id: "est-008",
    content:
      "Le salicylate de méthyle donne la note wintergreen (menthe des champs) reconnaissable.",
    category: "molecules",
    molecule: "Methyl salicylate",
    tags: ["ester", "wintergreen", "minty"],
  },

  // ============================================
  // MOLECULES - Lactones
  // ============================================
  {
    id: "lac-001",
    content:
      "La γ-décalactone est la molécule emblématique de l'arôme pêche.",
    category: "molecules",
    molecule: "gamma-Decalactone",
    tags: ["lactone", "peach", "fruity"],
  },
  {
    id: "lac-002",
    content:
      "La γ-undécalactone apporte une note pêche crémeuse aux produits laitiers.",
    category: "molecules",
    molecule: "gamma-Undecalactone",
    tags: ["lactone", "peach", "creamy"],
  },
  {
    id: "lac-003",
    content:
      "La δ-décalactone donne une note crémeuse et beurrée typique des dairy.",
    category: "molecules",
    molecule: "delta-Decalactone",
    tags: ["lactone", "creamy", "buttery"],
  },
  {
    id: "lac-004",
    content:
      "La γ-nonalactone est responsable de la note noix de coco crémeuse.",
    category: "molecules",
    molecule: "gamma-Nonalactone",
    tags: ["lactone", "coconut", "creamy"],
  },
  {
    id: "lac-005",
    content:
      "La whiskey lactone apporte des notes boisées et de noix de coco au whiskey vieilli en fût.",
    category: "molecules",
    molecule: "Whiskey lactone",
    tags: ["lactone", "woody", "coconut", "whiskey"],
  },
  {
    id: "lac-006",
    content:
      "Le sotolone possède une odeur puissante de curry, fenugrec et caramel brûlé.",
    category: "molecules",
    molecule: "Sotolon",
    tags: ["lactone", "curry", "caramel", "fenugreek"],
  },
  {
    id: "lac-007",
    content:
      "Le maltol est un exhausteur de goût sucré avec une note caramel.",
    category: "molecules",
    molecule: "Maltol",
    tags: ["lactone", "sweet", "caramel", "enhancer"],
  },
  {
    id: "lac-008",
    content:
      "L'éthyl maltol est 6 fois plus puissant que le maltol avec une note barbe à papa.",
    category: "molecules",
    molecule: "Ethyl maltol",
    tags: ["lactone", "sweet", "cotton candy", "enhancer"],
  },

  // ============================================
  // MOLECULES - Ketones
  // ============================================
  {
    id: "ket-001",
    content: "Le diacétyl est le composé principal du goût beurre frais.",
    category: "molecules",
    molecule: "Diacetyl",
    tags: ["ketone", "butter", "dairy"],
  },
  {
    id: "ket-002",
    content:
      "L'acétoïne renforce la note beurrée douce et yaourt du diacétyl.",
    category: "molecules",
    molecule: "Acetoin",
    tags: ["ketone", "butter", "yogurt"],
  },
  {
    id: "ket-003",
    content:
      "Le 2,3-pentanedione est une alternative au diacétyl pour les notes beurrées.",
    category: "molecules",
    molecule: "2,3-Pentanedione",
    tags: ["ketone", "butter"],
  },
  {
    id: "ket-004",
    content:
      "L'α-ionone apporte des notes de violette et boisées aux arômes floraux.",
    category: "molecules",
    molecule: "alpha-Ionone",
    tags: ["ketone", "violet", "floral", "woody"],
  },
  {
    id: "ket-005",
    content:
      "La β-ionone est plus puissante que l'α-ionone pour la note violette et framboise.",
    category: "molecules",
    molecule: "beta-Ionone",
    tags: ["ketone", "violet", "raspberry"],
  },
  {
    id: "ket-006",
    content:
      "La β-damascénone possède un seuil de perception extrêmement bas (0.002 ppb) avec des notes de rose et pomme cuite.",
    category: "molecules",
    molecule: "beta-Damascenone",
    tags: ["ketone", "rose", "apple", "low threshold"],
  },
  {
    id: "ket-007",
    content:
      "La raspberry ketone (frambinone) est le composé impact de l'arôme framboise.",
    category: "molecules",
    molecule: "Raspberry ketone",
    tags: ["ketone", "raspberry"],
  },
  {
    id: "ket-008",
    content: "La menthone contribue à l'arôme menthe poivrée.",
    category: "molecules",
    molecule: "Menthone",
    tags: ["ketone", "mint", "peppermint"],
  },
  {
    id: "ket-009",
    content:
      "La L-carvone sent la menthe verte (spearmint) tandis que la D-carvone sent le carvi.",
    category: "molecules",
    molecule: "Carvone",
    tags: ["ketone", "spearmint", "caraway", "chirality"],
  },

  // ============================================
  // MOLECULES - Alcohols
  // ============================================
  {
    id: "alc-001",
    content:
      "Le linalol est un alcool terpénique floral présent dans la lavande et la bergamote.",
    category: "molecules",
    molecule: "Linalool",
    tags: ["alcohol", "floral", "lavender", "terpene"],
  },
  {
    id: "alc-002",
    content:
      "Le géraniol apporte une note rose et géranium aux compositions florales.",
    category: "molecules",
    molecule: "Geraniol",
    tags: ["alcohol", "rose", "floral", "terpene"],
  },
  {
    id: "alc-003",
    content:
      "Le citronellol possède une odeur de rose avec une facette citronnée.",
    category: "molecules",
    molecule: "Citronellol",
    tags: ["alcohol", "rose", "citrus", "terpene"],
  },
  {
    id: "alc-004",
    content:
      "Le menthol active le récepteur TRPM8, créant une sensation de froid.",
    category: "molecules",
    molecule: "Menthol",
    tags: ["alcohol", "cooling", "mint", "terpene"],
  },
  {
    id: "alc-005",
    content:
      "Le cis-3-hexénol est la molécule de l'herbe fraîchement coupée.",
    category: "molecules",
    molecule: "cis-3-Hexenol",
    tags: ["alcohol", "green", "grass"],
  },
  {
    id: "alc-006",
    content:
      "L'alcool phényléthylique est le principal composé de l'odeur de rose.",
    category: "molecules",
    molecule: "Phenylethyl alcohol",
    tags: ["alcohol", "rose", "floral"],
  },

  // ============================================
  // MOLECULES - Acids
  // ============================================
  {
    id: "aci-001",
    content:
      "L'acide butyrique en traces contribue au goût du beurre, mais devient désagréable (vomi) à forte concentration.",
    category: "molecules",
    molecule: "Butyric acid",
    tags: ["acid", "butter", "cheese"],
  },
  {
    id: "aci-002",
    content:
      "L'acide isovalérique donne la note caractéristique du fromage et de transpiration.",
    category: "molecules",
    molecule: "Isovaleric acid",
    tags: ["acid", "cheese", "sweaty"],
  },
  {
    id: "aci-003",
    content:
      "L'acide hexanoïque apporte une note de chèvre aux fromages.",
    category: "molecules",
    molecule: "Hexanoic acid",
    tags: ["acid", "goat", "cheese"],
  },

  // ============================================
  // MOLECULES - Pyrazines
  // ============================================
  {
    id: "pyr-001",
    content:
      "La 2-isobutyl-3-méthoxypyrazine a le seuil de perception le plus bas connu (0.002 ppb) avec une odeur intense de poivron vert.",
    category: "molecules",
    molecule: "2-Isobutyl-3-methoxypyrazine",
    tags: ["pyrazine", "bell pepper", "green", "low threshold"],
  },
  {
    id: "pyr-002",
    content:
      "La 2-acétylpyrazine est responsable de l'odeur de pop-corn et de grillé.",
    category: "molecules",
    molecule: "2-Acetylpyrazine",
    tags: ["pyrazine", "popcorn", "roasted"],
  },
  {
    id: "pyr-003",
    content:
      "La 2,3,5-triméthylpyrazine apporte des notes de cacao et café torréfié.",
    category: "molecules",
    molecule: "2,3,5-Trimethylpyrazine",
    tags: ["pyrazine", "cocoa", "coffee", "roasted"],
  },
  {
    id: "pyr-004",
    content:
      "La tétraméthylpyrazine est un marqueur caractéristique du cacao.",
    category: "molecules",
    molecule: "Tetramethylpyrazine",
    tags: ["pyrazine", "cocoa", "chocolate"],
  },

  // ============================================
  // MOLECULES - Thiols & Sulfur
  // ============================================
  {
    id: "thi-001",
    content:
      "Le 4MMP (4-mercapto-4-méthylpentan-2-one) est responsable de l'arôme cassis et buis du Sauvignon blanc.",
    category: "molecules",
    molecule: "4MMP",
    tags: ["thiol", "blackcurrant", "wine", "tropical"],
  },
  {
    id: "thi-002",
    content:
      "Le 3-mercaptohexanol apporte des notes de pamplemousse et fruits tropicaux.",
    category: "molecules",
    molecule: "3-Mercaptohexanol",
    tags: ["thiol", "grapefruit", "tropical"],
  },
  {
    id: "thi-003",
    content:
      "Le furfurylthiol est le composé impact du café torréfié avec un seuil de 0.01 ppb.",
    category: "molecules",
    molecule: "Furfurylthiol",
    tags: ["thiol", "coffee", "roasted", "low threshold"],
  },
  {
    id: "thi-004",
    content:
      "Le méthional donne l'odeur caractéristique de pomme de terre cuite.",
    category: "molecules",
    molecule: "Methional",
    tags: ["thiol", "potato", "savory"],
  },
  {
    id: "thi-005",
    content:
      "Le diméthyl sulfure (DMS) apporte une note de maïs cuit ou chou.",
    category: "molecules",
    molecule: "Dimethyl sulfide",
    tags: ["sulfur", "corn", "cabbage"],
  },
  {
    id: "thi-006",
    content:
      "Le diallyl disulfide est le composé principal de l'ail cuit.",
    category: "molecules",
    molecule: "Diallyl disulfide",
    tags: ["sulfur", "garlic", "cooked"],
  },

  // ============================================
  // MOLECULES - Furanones
  // ============================================
  {
    id: "fur-001",
    content:
      "Le furaneol (HDMF) est le composé clé de l'arôme fraise mûre avec des notes caramel.",
    category: "molecules",
    molecule: "Furaneol",
    tags: ["furanone", "strawberry", "caramel"],
  },
  {
    id: "fur-002",
    content:
      "L'homofuraneol renforce le caractère fraise caramélisé.",
    category: "molecules",
    molecule: "Homofuraneol",
    tags: ["furanone", "strawberry", "caramel"],
  },
  {
    id: "fur-003",
    content: "Le norfuraneol apporte une note de pain grillé.",
    category: "molecules",
    molecule: "Norfuraneol",
    tags: ["furanone", "bread", "toasted"],
  },

  // ============================================
  // TERPENES - Monoterpenes
  // ============================================
  {
    id: "ter-001",
    content:
      "Le limonène constitue jusqu'à 90% de l'huile essentielle d'orange.",
    category: "terpenes",
    molecule: "Limonene",
    tags: ["monoterpene", "citrus", "orange"],
  },
  {
    id: "ter-002",
    content:
      "Le D-limonène sent l'orange tandis que le L-limonène sent le citron.",
    category: "terpenes",
    molecule: "Limonene",
    tags: ["monoterpene", "citrus", "chirality"],
  },
  {
    id: "ter-003",
    content:
      "Le myrcène apporte une note herbacée caractéristique du houblon.",
    category: "terpenes",
    molecule: "Myrcene",
    tags: ["monoterpene", "herbal", "hops"],
  },
  {
    id: "ter-004",
    content:
      "L'α-pinène est responsable de l'odeur de pin et des notes résineuses.",
    category: "terpenes",
    molecule: "alpha-Pinene",
    tags: ["monoterpene", "pine", "resinous"],
  },
  {
    id: "ter-005",
    content: "Le terpinéol possède une odeur florale de lilas.",
    category: "terpenes",
    molecule: "Terpineol",
    tags: ["monoterpene", "floral", "lilac"],
  },
  {
    id: "ter-006",
    content:
      "Le citral donne l'odeur caractéristique du citron et de la citronnelle.",
    category: "terpenes",
    molecule: "Citral",
    tags: ["monoterpene", "lemon", "lemongrass"],
  },
  {
    id: "ter-007",
    content:
      "L'eucalyptol (1,8-cinéole) est le composé principal de l'eucalyptus.",
    category: "terpenes",
    molecule: "Eucalyptol",
    tags: ["monoterpene", "eucalyptus", "fresh"],
  },
  {
    id: "ter-008",
    content:
      "Le thymol est responsable de l'odeur caractéristique du thym.",
    category: "terpenes",
    molecule: "Thymol",
    tags: ["monoterpene", "thyme", "herbal"],
  },
  {
    id: "ter-009",
    content: "Le carvacrol apporte la note typique de l'origan.",
    category: "terpenes",
    molecule: "Carvacrol",
    tags: ["monoterpene", "oregano", "herbal"],
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
  },
  {
    id: "ter-011",
    content:
      "L'α-humulène est le terpène caractéristique du houblon.",
    category: "terpenes",
    molecule: "alpha-Humulene",
    tags: ["sesquiterpene", "hops", "woody"],
  },
  {
    id: "ter-012",
    content:
      "Le valencène donne la note boisée spécifique de l'orange Valencia.",
    category: "terpenes",
    molecule: "Valencene",
    tags: ["sesquiterpene", "orange", "woody"],
  },
  {
    id: "ter-013",
    content: "Le zingibérène est le terpène principal du gingembre.",
    category: "terpenes",
    molecule: "Zingiberene",
    tags: ["sesquiterpene", "ginger"],
  },
  {
    id: "ter-014",
    content:
      "Le nootkatone est responsable de l'arôme caractéristique du pamplemousse.",
    category: "terpenes",
    molecule: "Nootkatone",
    tags: ["sesquiterpene", "grapefruit", "citrus"],
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
  },
  {
    id: "pro-002",
    content:
      "Le méthyl cinnamate apporte la note spécifique de fraise des bois.",
    category: "profiles",
    molecule: "Methyl cinnamate",
    tags: ["strawberry", "wild strawberry"],
  },
  {
    id: "pro-003",
    content:
      "L'éthylvanilline est 3 à 4 fois plus puissante que la vanilline naturelle.",
    category: "profiles",
    molecule: "Ethylvanillin",
    tags: ["vanilla", "sweet"],
  },
  {
    id: "pro-004",
    content:
      "Le gaïacol apporte une note fumée qui contribue à l'authenticité de la vanille naturelle.",
    category: "profiles",
    molecule: "Guaiacol",
    tags: ["vanilla", "smoky", "natural"],
  },
  {
    id: "pro-005",
    content:
      "Un extrait de vanille naturel contient vanilline, p-hydroxybenzaldéhyde, acide vanillique et gaïacol.",
    category: "profiles",
    tags: ["vanilla", "natural", "composition"],
  },
  {
    id: "pro-006",
    content:
      "Le profil cacao repose sur les pyrazines pour le torréfié et le phénylacétaldéhyde pour la note miel-chocolat.",
    category: "profiles",
    tags: ["cocoa", "chocolate", "roasted"],
  },
  {
    id: "pro-007",
    content:
      "Le furfurylthiol est le composé impact majeur du café torréfié.",
    category: "profiles",
    molecule: "Furfurylthiol",
    tags: ["coffee", "roasted", "impact"],
  },
  {
    id: "pro-008",
    content:
      "Le guaïacol et le 4-vinylguaïacol apportent les notes fumées et épicées du café.",
    category: "profiles",
    tags: ["coffee", "smoky", "spicy"],
  },
  {
    id: "pro-009",
    content:
      "L'accord beurré classique combine diacétyl, acétoïne et δ-décalactone pour un profil crémeux complet.",
    category: "profiles",
    tags: ["butter", "dairy", "accord"],
  },
  {
    id: "pro-010",
    content:
      "Des traces d'acide butyrique sont nécessaires pour un beurre authentique.",
    category: "profiles",
    molecule: "Butyric acid",
    tags: ["butter", "authentic"],
  },
  {
    id: "pro-011",
    content:
      "Un profil orange équilibré nécessite limonène comme base, décanal pour l'écorce, et linalol pour la fraîcheur florale.",
    category: "profiles",
    tags: ["orange", "citrus", "accord"],
  },
  {
    id: "pro-012",
    content:
      "Le L-menthol est la forme active qui procure la sensation de fraîcheur intense.",
    category: "profiles",
    molecule: "L-Menthol",
    tags: ["mint", "cooling", "chirality"],
  },
  {
    id: "pro-013",
    content:
      "La différence entre menthe poivrée (peppermint) et menthe verte (spearmint) vient du menthol vs carvone.",
    category: "profiles",
    tags: ["mint", "peppermint", "spearmint"],
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
  },
  {
    id: "thr-002",
    content:
      "La β-damascénone est perceptible à seulement 0.002 ppb dans l'eau.",
    category: "thresholds",
    molecule: "beta-Damascenone",
    tags: ["threshold", "rose", "ultra-low"],
  },
  {
    id: "thr-003",
    content: "Le furfurylthiol (café) est détectable à 0.01 ppb.",
    category: "thresholds",
    molecule: "Furfurylthiol",
    tags: ["threshold", "coffee", "ultra-low"],
  },
  {
    id: "thr-004",
    content:
      "La géosmine (odeur de terre/betterave) est perceptible à 0.01 ppb.",
    category: "thresholds",
    molecule: "Geosmin",
    tags: ["threshold", "earthy", "ultra-low"],
  },
  {
    id: "thr-005",
    content: "Le 4MMP (cassis) a un seuil de 0.1 ppb.",
    category: "thresholds",
    molecule: "4MMP",
    tags: ["threshold", "blackcurrant", "low"],
  },
  {
    id: "thr-006",
    content:
      "La β-ionone (violette) est détectable à 0.007 ppb, expliquant la puissance de cette note.",
    category: "thresholds",
    molecule: "beta-Ionone",
    tags: ["threshold", "violet", "ultra-low"],
  },
  {
    id: "thr-007",
    content: "Le linalol est perceptible à 6 ppb dans l'eau.",
    category: "thresholds",
    molecule: "Linalool",
    tags: ["threshold", "floral", "low"],
  },
  {
    id: "thr-008",
    content: "La γ-décalactone (pêche) a un seuil de 10 ppb.",
    category: "thresholds",
    molecule: "gamma-Decalactone",
    tags: ["threshold", "peach", "low"],
  },
  {
    id: "thr-009",
    content: "La vanilline est perceptible à environ 20 ppb.",
    category: "thresholds",
    molecule: "Vanillin",
    tags: ["threshold", "vanilla", "low"],
  },
  {
    id: "thr-010",
    content: "Le furaneol (fraise) a un seuil de 30 ppb.",
    category: "thresholds",
    molecule: "Furaneol",
    tags: ["threshold", "strawberry", "low"],
  },
  {
    id: "thr-011",
    content:
      "Le maltol a un seuil relativement élevé de 35 ppm.",
    category: "thresholds",
    molecule: "Maltol",
    tags: ["threshold", "caramel", "high"],
  },
  {
    id: "thr-012",
    content:
      "Le limonène a un seuil élevé de 10 ppm, nécessitant de fortes doses pour l'impact citrus.",
    category: "thresholds",
    molecule: "Limonene",
    tags: ["threshold", "citrus", "high"],
  },

  // ============================================
  // MAILLARD REACTION
  // ============================================
  {
    id: "mai-001",
    content:
      "La réaction de Maillard entre sucres et acides aminés produit les arômes de cuisson, grillé et torréfié.",
    category: "maillard",
    tags: ["maillard", "cooking", "roasted"],
  },
  {
    id: "mai-002",
    content:
      "Les pyrazines se forment lors de la réaction de Maillard et donnent les notes grillées et torréfiées.",
    category: "maillard",
    tags: ["maillard", "pyrazine", "roasted"],
  },
  {
    id: "mai-003",
    content:
      "Les thiazoles issus de Maillard apportent les notes de viande grillée.",
    category: "maillard",
    tags: ["maillard", "thiazole", "meat", "grilled"],
  },
  {
    id: "mai-004",
    content:
      "Le furfural et l'HMF (hydroxyméthylfurfural) donnent les notes de pain et caramel.",
    category: "maillard",
    tags: ["maillard", "bread", "caramel"],
  },
  {
    id: "mai-005",
    content:
      "La méthionine se dégrade en méthional, donnant l'odeur de pomme de terre cuite.",
    category: "maillard",
    tags: ["strecker", "methionine", "potato"],
  },
  {
    id: "mai-006",
    content:
      "La phénylalanine produit du phénylacétaldéhyde aux notes de miel et chocolat.",
    category: "maillard",
    tags: ["strecker", "phenylalanine", "honey", "chocolate"],
  },
  {
    id: "mai-007",
    content:
      "La leucine génère l'isovaléraldéhyde à l'odeur de malt.",
    category: "maillard",
    tags: ["strecker", "leucine", "malt"],
  },
  {
    id: "mai-008",
    content:
      "La valine produit le 2-méthylpropanal contribuant aux notes chocolat.",
    category: "maillard",
    tags: ["strecker", "valine", "chocolate"],
  },

  // ============================================
  // CHIRALITY
  // ============================================
  {
    id: "chi-001",
    content:
      "La chiralité peut complètement changer l'odeur d'une molécule : L-carvone sent la menthe verte, D-carvone sent le carvi.",
    category: "chirality",
    molecule: "Carvone",
    tags: ["chirality", "spearmint", "caraway"],
  },
  {
    id: "chi-002",
    content:
      "Le D-limonène sent l'orange tandis que le L-limonène sent le citron.",
    category: "chirality",
    molecule: "Limonene",
    tags: ["chirality", "orange", "lemon"],
  },
  {
    id: "chi-003",
    content:
      "Le L-menthol est la forme biologiquement active qui procure la sensation de fraîcheur.",
    category: "chirality",
    molecule: "Menthol",
    tags: ["chirality", "cooling", "mint"],
  },
  {
    id: "chi-004",
    content:
      "Le R-linalol (licareol) est floral lavande tandis que le S-linalol (coriandrol) est plus boisé.",
    category: "chirality",
    molecule: "Linalool",
    tags: ["chirality", "lavender", "woody"],
  },

  // ============================================
  // FORMULATION
  // ============================================
  {
    id: "for-001",
    content:
      "Les notes de tête (top) sont volatiles et donnent l'impact immédiat : aldéhydes légers, esters courts.",
    category: "formulation",
    tags: ["top notes", "volatile", "impact"],
  },
  {
    id: "for-002",
    content:
      "Les notes de cœur (middle) forment le corps de l'arôme : lactones, alcools terpéniques.",
    category: "formulation",
    tags: ["middle notes", "body", "lactones"],
  },
  {
    id: "for-003",
    content:
      "Les notes de fond (base) assurent la rémanence : vanilline, muscs, lactones lourdes.",
    category: "formulation",
    tags: ["base notes", "longevity", "fixative"],
  },
  {
    id: "for-004",
    content:
      "Commencer une formulation avec 3 à 5 ingrédients pour établir le squelette de l'arôme.",
    category: "formulation",
    tags: ["technique", "basics", "skeleton"],
  },
  {
    id: "for-005",
    content:
      "Un arôme doit toujours être testé dans son application finale car le support modifie la perception.",
    category: "formulation",
    tags: ["technique", "testing", "application"],
  },
  {
    id: "for-006",
    content:
      "Les accords sont des combinaisons éprouvées de molécules qui fonctionnent ensemble.",
    category: "formulation",
    tags: ["accord", "combination", "technique"],
  },
  {
    id: "for-007",
    content:
      "L'accord beurré classique : diacétyl + acétoïne + δ-décalactone.",
    category: "formulation",
    tags: ["accord", "butter", "recipe"],
  },
  {
    id: "for-008",
    content:
      "L'accord fraise mûre : furaneol + γ-décalactone + cis-3-hexénol.",
    category: "formulation",
    tags: ["accord", "strawberry", "recipe"],
  },
  {
    id: "for-009",
    content:
      "L'accord vanille riche : vanilline + éthylvanilline + coumarine.",
    category: "formulation",
    tags: ["accord", "vanilla", "recipe"],
  },
  {
    id: "for-010",
    content: "L'accord citrus frais : limonène + linalol + citral.",
    category: "formulation",
    tags: ["accord", "citrus", "recipe"],
  },
  {
    id: "for-011",
    content:
      "L'accord torréfié : pyrazines + furfurylthiol + guaïacol.",
    category: "formulation",
    tags: ["accord", "roasted", "coffee", "recipe"],
  },

  // ============================================
  // ENHANCERS & MODIFIERS
  // ============================================
  {
    id: "enh-001",
    content:
      "Le maltol renforce la perception sucrée à des dosages de 50 à 200 ppm.",
    category: "enhancers",
    molecule: "Maltol",
    tags: ["enhancer", "sweet", "dosage"],
  },
  {
    id: "enh-002",
    content:
      "L'éthyl maltol est 6 fois plus efficace que le maltol pour renforcer le sucré.",
    category: "enhancers",
    molecule: "Ethyl maltol",
    tags: ["enhancer", "sweet", "potency"],
  },
  {
    id: "enh-003",
    content:
      "Le furaneol renforce les notes fruitées et sucrées à 10-100 ppm.",
    category: "enhancers",
    molecule: "Furaneol",
    tags: ["enhancer", "fruity", "sweet", "dosage"],
  },
  {
    id: "enh-004",
    content:
      "La vanilline arrondit les profils et renforce le sucré à 100-500 ppm.",
    category: "enhancers",
    molecule: "Vanillin",
    tags: ["enhancer", "sweet", "rounding", "dosage"],
  },
  {
    id: "enh-005",
    content:
      "Le glutamate (MSG) et les nucléotides (IMP, GMP) créent une synergie pour l'umami.",
    category: "enhancers",
    tags: ["enhancer", "umami", "synergy"],
  },
  {
    id: "enh-006",
    content:
      "La vanilline et les lactones peuvent masquer l'amertume.",
    category: "enhancers",
    tags: ["masking", "bitter", "lactone"],
  },
  {
    id: "enh-007",
    content:
      "Les cyclodextrines encapsulent les molécules amères pour réduire leur perception.",
    category: "enhancers",
    tags: ["masking", "bitter", "encapsulation"],
  },
  {
    id: "enh-008",
    content:
      "Le WS-3 procure une sensation de froid intense sans odeur de menthe.",
    category: "enhancers",
    molecule: "WS-3",
    tags: ["cooling", "odorless"],
  },
  {
    id: "enh-009",
    content:
      "Le WS-23 est l'agent cooling le plus utilisé dans l'industrie pour sa neutralité.",
    category: "enhancers",
    molecule: "WS-23",
    tags: ["cooling", "neutral", "popular"],
  },
  {
    id: "enh-010",
    content:
      "Le menthyl lactate offre un effet rafraîchissant plus doux que le menthol.",
    category: "enhancers",
    molecule: "Menthyl lactate",
    tags: ["cooling", "mild"],
  },

  // ============================================
  // SOLVENTS
  // ============================================
  {
    id: "sol-001",
    content:
      "Le propylène glycol (PG) est le solvant universel en aromatique avec une légère note sucrée.",
    category: "solvents",
    tags: ["solvent", "PG", "universal"],
  },
  {
    id: "sol-002",
    content:
      "La glycérine est utilisée en confiserie pour sa viscosité et son goût sucré.",
    category: "solvents",
    tags: ["solvent", "glycerin", "confectionery"],
  },
  {
    id: "sol-003",
    content:
      "Le triacetin est un solvant neutre utilisé quand la neutralité gustative est critique.",
    category: "solvents",
    tags: ["solvent", "triacetin", "neutral"],
  },
  {
    id: "sol-004",
    content:
      "L'éthanol est le solvant de choix pour les boissons alcoolisées.",
    category: "solvents",
    tags: ["solvent", "ethanol", "beverages"],
  },
  {
    id: "sol-005",
    content:
      "Les MCT (triglycérides à chaîne moyenne) servent de support pour les arômes lipophiles.",
    category: "solvents",
    tags: ["solvent", "MCT", "lipophilic"],
  },
  {
    id: "sol-006",
    content:
      "La maltodextrine est le support standard pour les arômes en poudre.",
    category: "solvents",
    tags: ["carrier", "maltodextrin", "powder"],
  },
  {
    id: "sol-007",
    content:
      "La gomme arabique permet l'encapsulation des arômes pour une libération contrôlée.",
    category: "solvents",
    tags: ["carrier", "gum arabic", "encapsulation"],
  },
  {
    id: "sol-008",
    content:
      "L'amidon modifié est utilisé pour l'encapsulation et la protection des arômes volatils.",
    category: "solvents",
    tags: ["carrier", "starch", "encapsulation"],
  },

  // ============================================
  // STABILITY
  // ============================================
  {
    id: "sta-001",
    content:
      "Les aldéhydes et terpènes sont sensibles à l'oxydation et nécessitent des antioxydants (BHT, tocophérols).",
    category: "stability",
    tags: ["stability", "oxidation", "antioxidant"],
  },
  {
    id: "sta-002",
    content:
      "Le citral cyclise en milieu acide, perdant sa note citron caractéristique.",
    category: "stability",
    molecule: "Citral",
    tags: ["stability", "pH", "degradation"],
  },
  {
    id: "sta-003",
    content:
      "Les thiols s'oxydent facilement en disulfures, perdant leur puissance aromatique.",
    category: "stability",
    tags: ["stability", "thiol", "oxidation"],
  },
  {
    id: "sta-004",
    content: "Les esters et lactones s'hydrolysent en milieu basique.",
    category: "stability",
    tags: ["stability", "pH", "hydrolysis"],
  },
  {
    id: "sta-005",
    content:
      "La lumière dégrade les aldéhydes et les terpènes d'agrumes.",
    category: "stability",
    tags: ["stability", "light", "photodegradation"],
  },
  {
    id: "sta-006",
    content:
      "Les arômes volatils et les thiols nécessitent un stockage au froid.",
    category: "stability",
    tags: ["stability", "storage", "cold"],
  },

  // ============================================
  // REGULATION
  // ============================================
  {
    id: "reg-001",
    content:
      "Un arôme naturel \"de X\" doit contenir au moins 95% de sa partie aromatisante issue de la source X.",
    category: "regulation",
    tags: ["regulation", "natural", "EU"],
  },
  {
    id: "reg-002",
    content:
      "Un \"arôme naturel\" doit être composé à 100% de substances aromatisantes naturelles.",
    category: "regulation",
    tags: ["regulation", "natural", "definition"],
  },
  {
    id: "reg-003",
    content:
      "Le système FEMA GRAS (Generally Recognized As Safe) classe les substances autorisées aux États-Unis.",
    category: "regulation",
    tags: ["regulation", "FEMA", "GRAS", "USA"],
  },
  {
    id: "reg-004",
    content:
      "En Europe, les arômes sont réglementés par le règlement CE 1334/2008.",
    category: "regulation",
    tags: ["regulation", "EU", "1334/2008"],
  },

  // ============================================
  // TASTE & PERCEPTION
  // ============================================
  {
    id: "tas-001",
    content:
      "Le sucré est détecté par les récepteurs T1R2+T1R3 de la langue.",
    category: "taste",
    tags: ["taste", "sweet", "receptor"],
  },
  {
    id: "tas-002",
    content: "Le salé active les canaux sodiques ENaC.",
    category: "taste",
    tags: ["taste", "salty", "receptor"],
  },
  {
    id: "tas-003",
    content:
      "L'acide est perçu via les récepteurs PKD2L1 sensibles aux ions H+.",
    category: "taste",
    tags: ["taste", "sour", "receptor"],
  },
  {
    id: "tas-004",
    content:
      "L'amer est détecté par 25 types différents de récepteurs T2R, expliquant la diversité des substances amères.",
    category: "taste",
    tags: ["taste", "bitter", "receptor"],
  },
  {
    id: "tas-005",
    content:
      "L'umami est perçu par les récepteurs T1R1+T1R3, activés par le glutamate et les nucléotides.",
    category: "taste",
    tags: ["taste", "umami", "receptor"],
  },
  {
    id: "tas-006",
    content:
      "La capsaïcine du piment active le récepteur TRPV1, créant la sensation de chaleur/brûlure.",
    category: "taste",
    molecule: "Capsaicin",
    tags: ["trigeminal", "hot", "TRPV1"],
  },
  {
    id: "tas-007",
    content:
      "Le menthol active le récepteur TRPM8, créant la sensation de froid.",
    category: "taste",
    molecule: "Menthol",
    tags: ["trigeminal", "cooling", "TRPM8"],
  },
  {
    id: "tas-008",
    content:
      "Le CO2 dissous crée la sensation pétillante via l'anhydrase carbonique.",
    category: "taste",
    tags: ["trigeminal", "sparkling", "CO2"],
  },
  {
    id: "tas-009",
    content:
      "Les tanins provoquent l'astringence en précipitant les protéines salivaires.",
    category: "taste",
    tags: ["trigeminal", "astringent", "tannins"],
  },

  // ============================================
  // CUISINE
  // ============================================
  {
    id: "cui-001",
    content:
      "L'oignon piqué de clous de girofle est l'aromate traditionnel du pot-au-feu français.",
    category: "cuisine",
    tags: ["french", "pot-au-feu", "clove"],
  },
  {
    id: "cui-002",
    content:
      "L'estragon est l'herbe essentielle de la sauce béarnaise.",
    category: "cuisine",
    tags: ["french", "bearnaise", "tarragon"],
  },
  {
    id: "cui-003",
    content:
      "Le curcuma apporte la couleur jaune caractéristique au curry.",
    category: "cuisine",
    molecule: "Curcumin",
    tags: ["curry", "turmeric", "color"],
  },
  {
    id: "cui-004",
    content:
      "Le fenugrec donne au curry sa note sucrée-amère distinctive grâce au sotolone.",
    category: "cuisine",
    molecule: "Sotolon",
    tags: ["curry", "fenugreek"],
  },
  {
    id: "cui-005",
    content:
      "Le cuminaldéhyde est responsable de l'arôme caractéristique du cumin.",
    category: "cuisine",
    molecule: "Cuminaldehyde",
    tags: ["cumin", "spice"],
  },
  {
    id: "cui-006",
    content:
      "Les aromates sont les parties vertes (feuilles) des plantes : basilic, laurier, romarin, estragon.",
    category: "cuisine",
    tags: ["herbs", "aromatics", "definition"],
  },
  {
    id: "cui-007",
    content:
      "Les épices proviennent d'autres parties des plantes : graines (cardamome), écorces (cannelle), racines (gingembre).",
    category: "cuisine",
    tags: ["spices", "definition"],
  },
  {
    id: "cui-008",
    content:
      "Les protéines de pois ont des off-notes vertes et herbacées qui nécessitent un masquage.",
    category: "cuisine",
    tags: ["plant protein", "pea", "off-notes"],
  },
  {
    id: "cui-009",
    content:
      "Les protéines de soja présentent des notes \"beany\" et carton traitables par voie enzymatique.",
    category: "cuisine",
    tags: ["plant protein", "soy", "off-notes"],
  },

  // ============================================
  // INDUSTRY
  // ============================================
  {
    id: "ind-001",
    content:
      "Givaudan (Suisse) est le leader mondial de l'industrie des arômes et parfums.",
    category: "industry",
    tags: ["company", "givaudan", "leader"],
  },
  {
    id: "ind-002",
    content:
      "dsm-firmenich est né de la fusion Firmenich-DSM en 2023.",
    category: "industry",
    tags: ["company", "dsm-firmenich", "merger"],
  },
  {
    id: "ind-003",
    content:
      "IFF (International Flavors & Fragrances) a acquis Furtarom en 2018.",
    category: "industry",
    tags: ["company", "IFF", "acquisition"],
  },
  {
    id: "ind-004",
    content:
      "Symrise (Allemagne) est le 4ème acteur mondial des arômes.",
    category: "industry",
    tags: ["company", "symrise"],
  },
  {
    id: "ind-005",
    content:
      "Mane (France) est la plus grande maison d'arômes familiale au monde.",
    category: "industry",
    tags: ["company", "mane", "family"],
  },
  {
    id: "ind-006",
    content:
      "Robertet à Grasse est spécialisé dans les matières premières naturelles.",
    category: "industry",
    tags: ["company", "robertet", "natural", "grasse"],
  },
  {
    id: "ind-007",
    content:
      "Firmenich a acquis DRT (Dérivés Résiniques et Terpéniques) en 2020.",
    category: "industry",
    tags: ["company", "firmenich", "DRT", "acquisition"],
  },
  {
    id: "ind-008",
    content: "Knorr appartient à Unilever, pas à Nestlé.",
    category: "industry",
    tags: ["brand", "knorr", "unilever"],
  },
  {
    id: "ind-009",
    content: "Buitoni, Herta et Maggi sont des marques Nestlé.",
    category: "industry",
    tags: ["brand", "nestle"],
  },
  {
    id: "ind-010",
    content:
      "The Good Scents Company est la référence pour les profils olfactifs et numéros CAS/FEMA.",
    category: "industry",
    tags: ["resource", "database", "good scents"],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a random fact from all categories
 */
export function getRandomFact(): AromeFact {
  return AROME_FACTS[Math.floor(Math.random() * AROME_FACTS.length)];
}

/**
 * Get a random fact from a specific category
 */
export function getRandomFactByCategory(category: FactCategory): AromeFact | null {
  const facts = AROME_FACTS.filter((f) => f.category === category);
  if (facts.length === 0) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}

/**
 * Get a random fact that mentions a specific molecule
 */
export function getRandomFactByMolecule(molecule: string): AromeFact | null {
  const facts = AROME_FACTS.filter(
    (f) => f.molecule?.toLowerCase() === molecule.toLowerCase()
  );
  if (facts.length === 0) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}

/**
 * Get a random fact that has a specific tag
 */
export function getRandomFactByTag(tag: string): AromeFact | null {
  const facts = AROME_FACTS.filter((f) =>
    f.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
  if (facts.length === 0) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}

/**
 * Get multiple random facts (non-repeating)
 */
export function getRandomFacts(count: number): AromeFact[] {
  const shuffled = [...AROME_FACTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, AROME_FACTS.length));
}

/**
 * Get all facts for a category
 */
export function getFactsByCategory(category: FactCategory): AromeFact[] {
  return AROME_FACTS.filter((f) => f.category === category);
}

/**
 * Get all unique molecules mentioned in facts
 */
export function getAllMolecules(): string[] {
  const molecules = AROME_FACTS.filter((f) => f.molecule).map((f) => f.molecule!);
  return [...new Set(molecules)].sort();
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = AROME_FACTS.flatMap((f) => f.tags || []);
  return [...new Set(tags)].sort();
}
