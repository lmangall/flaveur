import { getSubstancesWithSmiles } from "@/actions/substances";
import { MoleculeTestClient } from "./molecule-test-client";

interface Substance {
  substance_id: number;
  fema_number: number;
  common_name: string | null;
  smile: string | null;
  molecular_formula: string | null;
  pubchem_cid: string | null;
  iupac_name: string | null;
}

export default async function TestMoleculesPage() {
  const substances = (await getSubstancesWithSmiles(20)) as Substance[];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Molecule Rendering Test</h1>
        <p className="text-muted-foreground">
          Compare different SMILES rendering libraries with real data from the database.
        </p>
      </div>

      <MoleculeTestClient substances={substances} />
    </div>
  );
}
