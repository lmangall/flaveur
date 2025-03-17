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

// Define the Flavor type
export type Flavor = {
  id: number;
  name: string;
  description: string;
  substances: Substance[];
  status: string;
  isPublic: boolean;
  version: number | null;
  baseUnit: string;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
};
