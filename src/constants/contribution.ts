// ===========================================
// VERIFICATION STATUS
// ===========================================

export const VERIFICATION_STATUS_OPTIONS = [
  { value: "user_entry", label: "User Entry" },
  { value: "under_review", label: "Under Review" },
  { value: "verified", label: "Verified" },
] as const;

export type VerificationStatusValue =
  (typeof VERIFICATION_STATUS_OPTIONS)[number]["value"];

export const isValidVerificationStatus = (
  value: string
): value is VerificationStatusValue =>
  VERIFICATION_STATUS_OPTIONS.some((s) => s.value === value);

// ===========================================
// FEEDBACK TYPE
// ===========================================

export const FEEDBACK_TYPE_OPTIONS = [
  { value: "error_report", label: "Error Report" },
  { value: "change_request", label: "Change Request" },
  { value: "data_enhancement", label: "Data Enhancement" },
  { value: "general", label: "General Feedback" },
] as const;

export type FeedbackTypeValue =
  (typeof FEEDBACK_TYPE_OPTIONS)[number]["value"];

export const isValidFeedbackType = (
  value: string
): value is FeedbackTypeValue =>
  FEEDBACK_TYPE_OPTIONS.some((s) => s.value === value);

// ===========================================
// FEEDBACK STATUS
// ===========================================

export const FEEDBACK_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
  { value: "duplicate", label: "Duplicate" },
] as const;

export type FeedbackStatusValue =
  (typeof FEEDBACK_STATUS_OPTIONS)[number]["value"];

export const isValidFeedbackStatus = (
  value: string
): value is FeedbackStatusValue =>
  FEEDBACK_STATUS_OPTIONS.some((s) => s.value === value);

// ===========================================
// SUBSTANCE FIELDS (for feedback target)
// ===========================================

export const SUBSTANCE_FIELD_OPTIONS = [
  { value: "common_name", label: "Common Name" },
  { value: "alternative_names", label: "Alternative Names" },
  { value: "cas_id", label: "CAS Number" },
  { value: "fema_number", label: "FEMA Number" },
  { value: "pubchem_id", label: "PubChem ID" },
  { value: "iupac_name", label: "IUPAC Name" },
  { value: "odor", label: "Odor Description" },
  { value: "taste", label: "Taste Description" },
  { value: "flavor_profile", label: "Flavor Profile" },
  { value: "molecular_formula", label: "Molecular Formula" },
  { value: "molecular_weight", label: "Molecular Weight" },
  { value: "smile", label: "SMILES" },
  { value: "inchi", label: "InChI" },
  { value: "boiling_point_c", label: "Boiling Point" },
  { value: "melting_point_c", label: "Melting Point" },
  { value: "is_natural", label: "Natural Classification" },
  { value: "synthetic", label: "Synthetic Classification" },
  { value: "functional_groups", label: "Functional Groups" },
  { value: "description", label: "Description" },
  { value: "other", label: "Other" },
] as const;

export type SubstanceFieldValue =
  (typeof SUBSTANCE_FIELD_OPTIONS)[number]["value"];
