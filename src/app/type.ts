import type {
  FlavourStatusValue,
  ConcentrationUnitValue,
  JobInteractionValue,
  EmploymentTypeValue,
  ExperienceLevelValue,
  ContactPerson,
} from "@/constants";

// ===========================================
// SUBSTANCE
// ===========================================
export type Substance = {
  substance_id: number;
  fema_number: number | null;
  common_name: string; // NOT NULL after migration 009
  cas_id: string | null;
  iupac_name: string | null;

  // EU regulatory identifiers (added by migration 012)
  fl_number: string | null; // FLAVIS number (format: XX.XXX)
  coe_number: string | null; // Council of Europe number
  jecfa_number: number | null; // JECFA number

  // Chemical properties
  molecular_weight: number | null;
  molecular_formula: string | null;
  exact_mass: number | null;
  smile: string | null;
  inchi: string | null;
  xlogp: number | null;

  // Classification
  synthetic: boolean | null;
  is_natural: boolean | null;
  unknown_natural: boolean | null;
  functional_groups: string | null;

  // Sensory properties
  flavor_profile: string | null;
  fema_flavor_profile: string | null;
  olfactory_taste_notes: string | null;
  odor: string | null;
  taste: string | null;

  // Additional data
  pubchem_id: number | null;
  solubility: Record<string, string> | null;
  food_additive_classes: string[] | null;
  alternative_names: string[] | null;
  melting_point_c: string | null;
  boiling_point_c: string | null;
  description: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Full-text search (added by migration 006)
  search_vector?: string;

  // Junction table fields (when joined with substance_flavour)
  concentration?: number;
  unit?: ConcentrationUnitValue;
  order_index?: number;

  // Relations (when loaded)
  regulatory_statuses?: RegulatoryStatus[];
  usage_guidelines?: SubstanceUsageGuideline[];
};

// ===========================================
// FLAVOUR
// ===========================================
export type FlavorProfileAttribute = {
  attribute: string;
  value: number;
};

export type Flavour = {
  flavour_id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string | null;
  category_id: number | null;
  status: FlavourStatusValue;
  version: number;
  base_unit: ConcentrationUnitValue;
  flavor_profile: FlavorProfileAttribute[] | null;
  created_at: string;
  updated_at: string;

  // Relations (when loaded)
  substances?: SubstanceInFlavour[];
  ingredients?: IngredientInFlavour[];
};

export type SubstanceInFlavour = {
  substance_id: number;
  concentration: number;
  unit: ConcentrationUnitValue;
  order_index: number;
  substance?: Substance;
};

export type IngredientInFlavour = {
  ingredient_flavour_id: number;
  concentration: number;
  unit: ConcentrationUnitValue;
  order_index: number;
  ingredient?: Flavour; // Ingredients are other flavours
};

// ===========================================
// CATEGORY
// ===========================================
export type Category = {
  category_id: number;
  name: string;
  description: string | null;
  parent_category_id: number | null;
  updated_at?: string;
};

// ===========================================
// USER
// ===========================================
export type User = {
  user_id: string; // Clerk ID
  email: string | null;
  username: string;
  created_at: string;
  updated_at?: string;
};

// ===========================================
// JOB OFFERS
// ===========================================
export type JobOffer = {
  id: string; // UUID
  title: string;
  description: string;
  company_name: string | null;
  original_company_name: string | null;
  through_recruiter: boolean;
  source_website: string;
  source_url: string;
  location: string;
  employment_type: EmploymentTypeValue | null;
  salary: string | null;
  requirements: string[] | null;
  tags: string[] | null;
  industry: string;
  experience_level: ExperienceLevelValue | null;
  contact_person: ContactPerson | null;
  posted_at: string;
  expires_at: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export type JobInteraction = {
  id: string; // UUID
  user_id: string;
  job_offer_id: string;
  action: JobInteractionValue;
  referrer: string | null;
  timestamp: string;
};

// ===========================================
// REGULATORY STATUS
// ===========================================
export type RegulatoryBody =
  | "FDA"
  | "EU"
  | "FEMA"
  | "JECFA"
  | "COE"
  | "EFSA"
  | "Health_Canada"
  | "FSANZ"
  | "Other";

export type RegulatoryStatusValue =
  | "GRAS"
  | "Approved"
  | "Restricted"
  | "Banned"
  | "Under_Review"
  | "Pending"
  | "Not_Evaluated";

export type RegulatoryStatus = {
  status_id: number;
  substance_id: number;
  regulatory_body: RegulatoryBody;
  status: RegulatoryStatusValue;
  max_usage_level: string | null;
  reference_number: string | null;
  reference_url: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// ===========================================
// SUBSTANCE USAGE GUIDELINES
// ===========================================
export type ApplicationType =
  | "beverages"
  | "baked_goods"
  | "confectionery"
  | "dairy"
  | "savory"
  | "snacks"
  | "frozen_desserts"
  | "sauces_condiments"
  | "meat_products"
  | "tobacco"
  | "oral_care"
  | "fragrances"
  | "other";

export type SubstanceUsageGuideline = {
  guideline_id: number;
  substance_id: number;
  application_type: ApplicationType;
  application_subtype: string | null;
  typical_min_ppm: number | null;
  typical_max_ppm: number | null;
  legal_max_ppm: number | null;
  detection_threshold_ppm: number | null;
  low_level_character: string | null;
  high_level_character: string | null;
  data_source: string | null;
  source_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
