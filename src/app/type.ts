export type Substance = {
  substance_id: number;
  fema_number: number;
  common_name: string;
  chemical_name?: string;
  cas_number?: string;
  is_natural: boolean;
  odor: string;
  functional_groups: string;
  flavor_profile: string;
  taste?: string;
  olfactory_taste_notes?: string;
};
