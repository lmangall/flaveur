const PUBCHEM_API = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

export interface PubChemCompound {
  CID: number;
  MolecularWeight: number;
  MolecularFormula: string;
  CanonicalSMILES: string;
  InChI: string;
  XLogP: number;
  ExactMass: number;
}

/**
 * Fetch compound data from PubChem by chemical name
 */
export async function fetchByName(
  name: string
): Promise<PubChemCompound | null> {
  try {
    const url = `${PUBCHEM_API}/compound/name/${encodeURIComponent(name)}/property/MolecularWeight,MolecularFormula,CanonicalSMILES,InChI,XLogP,ExactMass/JSON`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data.PropertyTable?.Properties?.[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch compound data from PubChem by CAS registry number
 */
export async function fetchByCAS(cas: string): Promise<PubChemCompound | null> {
  try {
    // PubChem accepts CAS numbers as compound names
    const url = `${PUBCHEM_API}/compound/name/${encodeURIComponent(cas)}/property/MolecularWeight,MolecularFormula,CanonicalSMILES,InChI,XLogP,ExactMass/JSON`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data.PropertyTable?.Properties?.[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch compound data from PubChem by CID (Compound ID)
 */
export async function fetchByCID(cid: number): Promise<PubChemCompound | null> {
  try {
    const url = `${PUBCHEM_API}/compound/cid/${cid}/property/MolecularWeight,MolecularFormula,CanonicalSMILES,InChI,XLogP,ExactMass/JSON`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data.PropertyTable?.Properties?.[0] ?? null;
  } catch {
    return null;
  }
}
