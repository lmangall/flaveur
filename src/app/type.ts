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
  common_name: string | null;
  cas_id: string | null;
  iupac_name: string | null;

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

  // Junction table fields (when joined with substance_flavour)
  concentration?: number;
  unit?: ConcentrationUnitValue;
  order_index?: number;
};

// ===========================================
// FLAVOUR
// ===========================================
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
