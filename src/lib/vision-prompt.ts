export const FORMULATION_EXTRACTION_PROMPT = `
You are an expert at extracting structured data from French formulation sheets ("Fiche de formulation").

Analyze this image of a formulation sheet and extract all data into the following JSON structure:

{
  "metadata": {
    "studentName": "string or null",
    "formulaName": "string or null",
    "formulationDate": "string or null (format: YYYY-MM-DD if possible)"
  },
  "ingredients": [
    {
      "rowNumber": 1,
      "name": "Constituent name",
      "supplier": "Supplier name or null",
      "dilution": "Dilution value (e.g., '10%') or null",
      "pricePerKg": 123.45 or null,
      "concentrationA": 0.5 or null,
      "concentrationB": null,
      "concentrationC": null,
      "concentrationD": null
    }
  ],
  "confidence": "high|medium|low",
  "warnings": ["Any issues found during extraction"]
}

Column mapping for the table:
- "N°" = Row number (rowNumber)
- "Constituants" = Ingredient name (name) - MOST IMPORTANT, always extract this
- "Fournisseur" = Supplier (supplier)
- "Dilution" = Dilution percentage (dilution)
- "Prix/Kg" = Price per kilogram (pricePerKg)
- "A%", "B%", "C%", "D%" = Concentration percentages for different versions (concentrationA, concentrationB, concentrationC, concentrationD)

Header fields to look for:
- "Étudiant" or "Etudiant" = Student name (studentName)
- "Nom de la formule" = Formula name (formulaName)
- "Date" = Formulation date (formulationDate)

IMPORTANT RULES:
1. Extract ALL visible rows with ingredient names, even if some columns are empty
2. For handwritten text, do your best to interpret it accurately
3. If a value is unclear or unreadable, set it to null rather than guessing
4. Numbers should be parsed as floats (e.g., "0,5" becomes 0.5)
5. French uses comma (,) as decimal separator - convert to period (.)
6. Set confidence to:
   - "high" if image is clear and all text is easily readable
   - "medium" if some values required interpretation
   - "low" if image quality is poor or significant text is hard to read
7. Add specific warnings for any cells you were uncertain about
8. Ignore the "TOTAL" row if present
9. Skip completely empty rows (no ingredient name)

Return ONLY valid JSON, no additional text or markdown formatting.
`;
