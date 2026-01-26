// Formulation parsing utilities (client-side compatible)

export type FormulationIngredient = {
  name: string;
  supplier?: string;
  dilution?: string;
  price_per_kg?: number;
  concentration: number; // percentage
};

export type FormulationVersion = {
  version_label: string; // A, B, C, etc.
  ingredients: FormulationIngredient[];
};

export type FormulationData = {
  student_name?: string;
  formula_name: string;
  formulation_date?: string;
  versions: FormulationVersion[];
};

/**
 * Parse formulation data from a structured array (from Excel/CSV)
 * Expected format matches the "fiche_de_formulation" template
 */
export function parseFormulationSheet(
  rows: (string | number | null | undefined)[][]
): FormulationData {
  // Find header row (contains "N°", "Constituants", etc.)
  let headerRowIndex = -1;
  let headerRow: (string | number | null | undefined)[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.some(cell => String(cell).toLowerCase().includes("constituant"))) {
      headerRowIndex = i;
      headerRow = row;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error("Could not find header row with 'Constituants' column");
  }

  // Extract metadata from rows before header
  let studentName: string | undefined;
  let formulaName: string | undefined;
  let formulationDate: string | undefined;

  for (let i = 0; i < headerRowIndex; i++) {
    const row = rows[i];
    const rowText = row.map(c => String(c || "").toLowerCase()).join(" ");

    if (rowText.includes("étudiant") || rowText.includes("student")) {
      // Find the value - usually next non-empty cell or specific column
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell && !String(cell).toLowerCase().includes("étudiant") && !String(cell).toLowerCase().includes("student")) {
          studentName = String(cell).trim();
          break;
        }
      }
    }

    if (rowText.includes("nom de la formule") || rowText.includes("formula name")) {
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell && !String(cell).toLowerCase().includes("formule") && !String(cell).toLowerCase().includes("formula")) {
          formulaName = String(cell).trim();
          break;
        }
      }
    }

    if (rowText.includes("date")) {
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell && !String(cell).toLowerCase().includes("date")) {
          formulationDate = String(cell).trim();
          break;
        }
      }
    }
  }

  // Find column indices
  const colIndices = {
    number: -1,
    name: -1,
    supplier: -1,
    dilution: -1,
    price: -1,
    versions: [] as { label: string; index: number }[],
  };

  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || "").trim().toLowerCase();

    if (cell === "n°" || cell === "no" || cell === "#") {
      colIndices.number = i;
    } else if (cell.includes("constituant") || cell.includes("ingredient")) {
      colIndices.name = i;
    } else if (cell.includes("fournisseur") || cell.includes("supplier")) {
      colIndices.supplier = i;
    } else if (cell.includes("dilution")) {
      colIndices.dilution = i;
    } else if (cell.includes("prix") || cell.includes("price")) {
      colIndices.price = i;
    } else if (/^[a-g]$/i.test(cell)) {
      // Version columns (A, B, C, D, E, F, G)
      colIndices.versions.push({ label: cell.toUpperCase(), index: i });
    }
  }

  if (colIndices.name === -1) {
    throw new Error("Could not find 'Constituants' (ingredient name) column");
  }

  // Parse data rows
  const versions: FormulationVersion[] = colIndices.versions.map(v => ({
    version_label: v.label,
    ingredients: [],
  }));

  // If no version columns found, create a single default version
  if (versions.length === 0) {
    versions.push({ version_label: "A", ingredients: [] });
  }

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];

    // Check if this is the "Total" row or empty
    const firstCell = String(row[0] || "").toLowerCase();
    if (firstCell.includes("total") || !row.some(c => c !== null && c !== undefined && String(c).trim() !== "")) {
      continue;
    }

    const name = colIndices.name >= 0 ? String(row[colIndices.name] || "").trim() : "";

    if (!name) {
      continue;
    }

    const supplier = colIndices.supplier >= 0 ? String(row[colIndices.supplier] || "").trim() || undefined : undefined;
    const dilution = colIndices.dilution >= 0 ? String(row[colIndices.dilution] || "").trim() || undefined : undefined;
    const priceRaw = colIndices.price >= 0 ? row[colIndices.price] : undefined;
    const price = priceRaw ? parseFloat(String(priceRaw).replace(/[^0-9.]/g, "")) : undefined;

    // Add to each version that has a value
    for (let v = 0; v < colIndices.versions.length; v++) {
      const versionCol = colIndices.versions[v];
      const concentrationRaw = row[versionCol.index];

      if (concentrationRaw !== null && concentrationRaw !== undefined && String(concentrationRaw).trim() !== "" && String(concentrationRaw).trim() !== "—") {
        const concentration = parseFloat(String(concentrationRaw).replace(/[^0-9.]/g, ""));

        if (!isNaN(concentration) && concentration > 0) {
          versions[v].ingredients.push({
            name,
            supplier,
            dilution,
            price_per_kg: price,
            concentration,
          });
        }
      }
    }

    // If no version columns, add to default version (using first numeric column after known columns)
    if (colIndices.versions.length === 0) {
      // Try to find a concentration value
      for (let j = colIndices.name + 1; j < row.length; j++) {
        const cellValue = row[j];
        if (cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== "") {
          const concentration = parseFloat(String(cellValue).replace(/[^0-9.]/g, ""));
          if (!isNaN(concentration) && concentration > 0) {
            versions[0].ingredients.push({
              name,
              supplier,
              dilution,
              price_per_kg: price,
              concentration,
            });
            break;
          }
        }
      }
    }
  }

  return {
    student_name: studentName,
    formula_name: formulaName || "Imported Formulation",
    formulation_date: formulationDate,
    versions: versions.filter(v => v.ingredients.length > 0),
  };
}
