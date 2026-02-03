import type {
  FlavourStatusValue,
  ConcentrationUnitValue,
  JobInteractionValue,
  EmploymentTypeValue,
  ExperienceLevelValue,
  ContactPerson,
  VerificationStatusValue,
  FeedbackTypeValue,
  FeedbackStatusValue,
  WorkspaceRoleValue,
  DocumentTypeValue,
  WorkspaceInviteStatusValue,
  LearningStatus,
  ReviewResult,
  BadgeKey,
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

  // User contribution fields (added by migration 018)
  verification_status: VerificationStatusValue;
  submitted_by_user_id: string | null;
  submitted_at: string | null;
  reviewed_by_admin_email: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  source_reference: string | null;

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
  notes: string | null;
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
  supplier?: string | null;
  dilution?: string | null;
  price_per_kg?: number | null;
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

// ===========================================
// SUBSTANCE FEEDBACK
// ===========================================
export type SubstanceFeedback = {
  feedback_id: number;
  substance_id: number;
  submitted_by_user_id: string;
  submitted_at: string;
  feedback_type: FeedbackTypeValue;
  target_field: string | null;
  current_value: string | null;
  suggested_value: string | null;
  commentary: string;
  source_reference: string | null;
  status: FeedbackStatusValue;
  reviewed_by_admin_email: string | null;
  admin_notes: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;

  // Relations (when loaded)
  substance?: Substance;
};

// ===========================================
// WORKSPACE
// ===========================================
export type Workspace = {
  workspace_id: number;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;

  // Relations (when loaded)
  members?: WorkspaceMember[];
  documents?: WorkspaceDocument[];
  flavours?: WorkspaceFlavour[];
};

export type WorkspaceMember = {
  member_id: number;
  workspace_id: number;
  user_id: string;
  role: WorkspaceRoleValue;
  created_at: string;

  // Relations (when loaded)
  user?: User;
};

export type WorkspaceInvite = {
  invite_id: number;
  workspace_id: number;
  invited_email: string;
  invited_by_user_id: string;
  invite_token: string;
  role: WorkspaceRoleValue;
  status: WorkspaceInviteStatusValue;
  created_at: string;

  // Relations (when loaded)
  workspace?: Workspace;
  invited_by?: User;
};

export type WorkspaceDocument = {
  document_id: number;
  workspace_id: number;
  name: string;
  description: string | null;
  type: DocumentTypeValue;
  content: string | null; // For markdown/csv
  url: string | null; // For images (Vercel Blob URL)
  file_size: number | null;
  mime_type: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;

  // Relations (when loaded)
  creator?: User;
};

export type WorkspaceFlavour = {
  workspace_id: number;
  flavour_id: number;
  added_by: string | null;
  added_at: string;

  // Relations (when loaded)
  flavour?: Flavour;
  added_by_user?: User;
};

// ===========================================
// LEARNING
// ===========================================

export type LearningQueueItem = {
  queue_id: number;
  user_id: string;
  substance_id: number;
  priority: number;
  target_date: string | null;
  added_at: string;

  // Relations (when loaded) - partial substance for queue display
  substance?: Pick<Substance, 'substance_id' | 'common_name' | 'fema_number' | 'cas_id' | 'flavor_profile' | 'fema_flavor_profile'>;
  progress_status?: string;
  has_smelled?: boolean;
  has_tasted?: boolean;
};

export type SubstanceLearningProgress = {
  progress_id: number;
  user_id: string;
  substance_id: number;
  has_smelled: boolean;
  smelled_at: string | null;
  has_tasted: boolean;
  tasted_at: string | null;
  status: LearningStatus;
  personal_notes: string | null;
  personal_descriptors: string[];
  associations: string | null;
  sample_photo_url: string | null;
  concentration_notes: string | null;
  started_at: string | null;
  mastered_at: string | null;
  created_at: string;
  updated_at: string;

  // Relations (when loaded)
  substance?: Substance;
};

export type LearningReview = {
  review_id: number;
  user_id: string;
  substance_id: number;
  scheduled_for: string;
  completed_at: string | null;
  review_result: ReviewResult | null;
  confidence_after: number | null;
  notes: string | null;
  created_at: string;

  // Relations (when loaded)
  substance?: Substance;
};

export type QuizAttempt = {
  attempt_id: number;
  user_id: string;
  substance_id: number;
  guessed_name: string | null;
  observations: string | null;
  result: ReviewResult;
  created_at: string;

  // Relations (when loaded)
  substance?: Substance;
};

export type LearningSession = {
  session_id: number;
  user_id: string;
  name: string;
  description: string | null;
  scheduled_for: string | null;
  duration_minutes: number | null;
  reflection_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;

  // Relations (when loaded)
  substances?: LearningSessionSubstance[];
};

export type LearningSessionSubstance = {
  session_id: number;
  substance_id: number;
  order_index: number;
  session_code: string | null;

  // Relations (when loaded)
  substance?: Substance;
};

export type LearningStreak = {
  streak_id: number;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  streak_freezes_available: number;
};

export type UserBadge = {
  badge_id: number;
  user_id: string;
  badge_key: BadgeKey;
  earned_at: string;
};

export type LearningDashboardStats = {
  total_in_queue: number;
  not_started: number;
  learning: number;
  confident: number;
  mastered: number;
  current_streak: number;
  longest_streak: number;
  reviews_due: number;
  badges_earned: number;
};

export type CategoryLearningProgress = {
  category_id: number;
  category_name: string;
  total_substances: number;
  mastered: number;
  learning: number;
  not_started: number;
  completion_percentage: number;
};
