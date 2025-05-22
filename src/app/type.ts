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
  description: string;
  created_at: string;
  updated_at: string;
};

export type Flavour = {
  flavour_id: number;
  name: string;
  description: string;
  is_public: boolean;
  category_id: number;
  status: string;
  base_unit: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  version?: number;
  substances?: Array<{
    substance_id: number;
    concentration: number;
    unit: string;
    order_index: number;
    substance?: Substance;
  }>;
  ingredients?: Array<{
    ingredient_id: number;
    concentration: number;
    unit: string;
    order_index: number;
    ingredient?: Ingredient;
  }>;
};

export type Ingredient = {
  ingredient_id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};
