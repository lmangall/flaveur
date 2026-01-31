export type ExtractedIngredient = {
  rowNumber: number;
  name: string;
  supplier: string | null;
  dilution: string | null;
  pricePerKg: number | null;
  concentrationA: number | null;
  concentrationB: number | null;
  concentrationC: number | null;
  concentrationD: number | null;
};

export type VisionExtractionResult = {
  success: boolean;
  metadata: {
    studentName: string | null;
    formulaName: string | null;
    formulationDate: string | null;
  };
  ingredients: ExtractedIngredient[];
  confidence: "high" | "medium" | "low";
  warnings: string[];
  error?: string;
};
