import { getSubstancesWithSmiles } from "@/actions/substances";
import { MoleculeViewerClient } from "./molecule-viewer-client";
import { getTranslations } from "next-intl/server";

interface Substance {
  substance_id: number;
  fema_number: number;
  common_name: string | null;
  smile: string | null;
  molecular_formula: string | null;
  pubchem_cid: string | null;
  iupac_name: string | null;
}

const DEFAULT_MOLECULES: Substance[] = [
  {
    substance_id: -1,
    fema_number: 2731,
    common_name: "Vanillin",
    smile: "COC1=CC(C=O)=CC=C1O",
    molecular_formula: "C8H8O3",
    pubchem_cid: "1183",
    iupac_name: "4-hydroxy-3-methoxybenzaldehyde",
  },
  {
    substance_id: -2,
    fema_number: 2055,
    common_name: "Benzaldehyde",
    smile: "C1=CC=C(C=C1)C=O",
    molecular_formula: "C7H6O",
    pubchem_cid: "240",
    iupac_name: "benzaldehyde",
  },
  {
    substance_id: -3,
    fema_number: 2414,
    common_name: "Limonene",
    smile: "CC1=CCC(CC1)C(=C)C",
    molecular_formula: "C10H16",
    pubchem_cid: "22311",
    iupac_name: "1-methyl-4-prop-1-en-2-ylcyclohexene",
  },
  {
    substance_id: -4,
    fema_number: 2174,
    common_name: "Cinnamaldehyde",
    smile: "C1=CC=C(C=C1)/C=C/C=O",
    molecular_formula: "C9H8O",
    pubchem_cid: "637511",
    iupac_name: "(E)-3-phenylprop-2-enal",
  },
  {
    substance_id: -5,
    fema_number: 2006,
    common_name: "Menthol",
    smile: "CC1CCC(C(C1)O)C(C)C",
    molecular_formula: "C10H20O",
    pubchem_cid: "1254",
    iupac_name: "2-isopropyl-5-methylcyclohexanol",
  },
  {
    substance_id: -6,
    fema_number: 2465,
    common_name: "Linalool",
    smile: "CC(=CCCC(C)(C=C)O)C",
    molecular_formula: "C10H18O",
    pubchem_cid: "6549",
    iupac_name: "3,7-dimethylocta-1,6-dien-3-ol",
  },
  {
    substance_id: -7,
    fema_number: 2902,
    common_name: "Ethyl Butyrate",
    smile: "CCCC(=O)OCC",
    molecular_formula: "C6H12O2",
    pubchem_cid: "7762",
    iupac_name: "ethyl butanoate",
  },
  {
    substance_id: -8,
    fema_number: 2418,
    common_name: "Geraniol",
    smile: "CC(=CCCC(=CC)C)CO",
    molecular_formula: "C10H18O",
    pubchem_cid: "637566",
    iupac_name: "(E)-3,7-dimethylocta-2,6-dien-1-ol",
  },
];

export default async function MoleculesPage() {
  const t = await getTranslations("molecules");
  let substances: Substance[] = [];

  try {
    substances = (await getSubstancesWithSmiles(20)) as Substance[];
  } catch (error) {
    console.error("Failed to fetch substances:", error);
  }

  const displaySubstances =
    substances.length > 0 ? substances : DEFAULT_MOLECULES;
  const usingDefaults = substances.length === 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
        {usingDefaults && (
          <p className="text-sm text-amber-600 mt-2">{t("usingDefaults")}</p>
        )}
      </div>

      <MoleculeViewerClient initialSubstances={displaySubstances} />
    </div>
  );
}
