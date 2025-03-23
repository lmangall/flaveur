// Define the Substance type based on the example provided
// export type Substance = {
//   fema_number: number;
//   common_name: string;
//   synthetic: boolean;
//   molecular_weight: number;
//   exact_mass: number;
//   smile: string;
//   iupac_name: string;
//   unknown_natural: boolean;
//   odor: string;
//   functional_groups: string;
//   inchi: string;
//   xlogp: number;
//   is_natural: boolean;
//   flavor_profile: string;
//   fema_flavor_profile: string;
//   pubchem_id: number;
//   cas_id: string;
//   substance_id: number;
//   concentration?: number;
//   unit?: string;
//   order_index?: number;
// };

// Define the Flavour type
export type Flavour = {
  id: number; // Maps to flavour_id from API
  name: string; // Maps to name from API
  description: string; // Maps to description from API
  substances: Substance[]; // Array of substances
  status: string; // Maps to status from API
  isPublic: boolean; // Maps to is_public from API
  version: number | null; // Maps to version from API
  baseUnit: string; // Maps to base_unit from API
  categoryId: number | null; // Maps to category_id from API
  createdAt: string; // Maps to created_at from API
  updatedAt: string; // Maps to updated_at from API
  userId: string; // Maps to user_id from API
};

// Add these interfaces to your existing type.d.ts file

interface JobOffer {
  id: string;
  title: string;
  description: string;
  company_name: string;
  original_company_name?: string;
  through_recruiter: boolean;
  source_website?: string;
  source_url?: string;
  location: string;
  employment_type: string;
  salary?: string;
  requirements?: string[];
  tags?: string[];
  industry?: string;
  experience_level?: string;
  contact_person?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  posted_at: string;
  expires_at?: string;
  status: boolean;
}

interface JobInteraction {
  id: string;
  user_id: string;
  job_offer_id: string;
  action: "viewed" | "applied" | "seen_contact";
  referrer?: string;
  created_at: string;
}
