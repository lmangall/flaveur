"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/[locale]/components/ui/dialog";
import { Label } from "@/app/[locale]/components/ui/label";
import {
  PlusCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SubstanceSearch } from "@/app/[locale]/components/substance-search";
import { MoleculeImage } from "@/app/[locale]/components/ui/molecule-image";
import {
  getSubstances,
  searchSubstances,
  getSubstanceByFemaNumber,
} from "@/actions/substances";
import { addSubstanceToFlavour } from "@/actions/flavours";

type Substance = {
  fema_number: number;
  common_name: string;
  is_natural?: boolean;
  synthetic?: boolean;
  cas_id?: string;
  odor?: string;
  functional_groups?: string;
  flavor_profile?: string;
  fema_flavor_profile?: string;
  taste?: string;
  olfactory_taste_notes?: string;
  pubchem_cid?: string;
  pubchem_sid?: string;
  molecular_formula?: string;
  molecular_weight?: number;
  exact_mass?: number;
  iupac_name?: string;
  smile?: string;
  inchi?: string;
  xlogp?: number;
  ec_number?: string;
  description?: string;
  common_applications?: string;
  type?: string;
  melting_point_c?: string;
  boiling_point_c?: string;
  solubility?: Record<string, unknown>;
  food_additive_classes?: string[];
  alternative_names?: string[];
};

export default function SubstancesPage() {
  const router = useRouter();
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "all" | "name" | "profile" | "cas_id" | "fema_number"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newSubstance, setNewSubstance] = useState({
    fema_number: "",
    common_name: "",
    is_natural: true,
    cas_id: "",
    odor: "",
    functional_groups: "",
    flavor_profile: "",
  });
  const [viewDetailsSubstance, setViewDetailsSubstance] =
    useState<Substance | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const fetchSubstancesData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (searchQuery) {
        const data = await searchSubstances(searchQuery, searchType, currentPage);
        setSubstances(data.results as Substance[]);
      } else {
        const data = await getSubstances(currentPage);
        setSubstances(data as Substance[]);
      }
    } catch (error) {
      console.error("Error fetching substances:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, searchType]);

  useEffect(() => {
    fetchSubstancesData();
  }, [currentPage, fetchSubstancesData]);

  // Remove the local filtering since we're now using backend search
  const filteredSubstances = substances;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewSubstance({ ...newSubstance, [name]: value });
  };

  const handleSubmitSubstance = async () => {
    try {
      const femaNumber = Number.parseInt(newSubstance.fema_number);
      if (!femaNumber) {
        alert("Please enter a valid FEMA Number");
        return;
      }

      // Step 1: Fetch Substance using server action
      const foundSubstance = await getSubstanceByFemaNumber(femaNumber);

      if (!foundSubstance) {
        alert("Substance not found in database.");
        return;
      }

      // Step 2: Add the substance to a flavour using server action
      // Note: This is a placeholder - you should pass the actual flavour ID
      await addSubstanceToFlavour(6, {
        fema_number: femaNumber,
        concentration: 10.5, // Example concentration
        unit: "g/kg",
        order_index: 1,
      });

      // Step 3: Update UI with the newly added substance
      fetchSubstancesData(); // Refresh the list after adding
      setOpenDialog(false);

      // Reset form
      setNewSubstance({
        fema_number: "",
        common_name: "",
        is_natural: true,
        cas_id: "",
        odor: "",
        functional_groups: "",
        flavor_profile: "",
      });
    } catch (error) {
      console.error("Error adding substance:", error);
      alert("Failed to add substance.");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Open the details modal
  const openDetailsModal = (substance: Substance) => {
    setViewDetailsSubstance(substance);
    setIsViewDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Substances</h1>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Substance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Substance</DialogTitle>
              <DialogDescription>
                Enter the details of the substance to add to the database.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fema_number">FEMA Number</Label>
                  <Input
                    id="fema_number"
                    name="fema_number"
                    value={newSubstance.fema_number}
                    onChange={handleInputChange}
                    placeholder="e.g. 2219"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cas_id">CAS ID</Label>
                  <Input
                    id="cas_id"
                    name="cas_id"
                    value={newSubstance.cas_id}
                    onChange={handleInputChange}
                    placeholder="e.g. 104-55-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="common_name">Common Name</Label>
                <Input
                  id="common_name"
                  name="common_name"
                  value={newSubstance.common_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Cinnamaldehyde"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odor">Odor Description</Label>
                <Input
                  id="odor"
                  name="odor"
                  value={newSubstance.odor}
                  onChange={handleInputChange}
                  placeholder="e.g. Cinnamon, spicy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="functional_groups">Functional Groups</Label>
                <Input
                  id="functional_groups"
                  name="functional_groups"
                  value={newSubstance.functional_groups}
                  onChange={handleInputChange}
                  placeholder="e.g. Aldehyde"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flavor_profile">Flavor Profile</Label>
                <Input
                  id="flavor_profile"
                  name="flavor_profile"
                  value={newSubstance.flavor_profile}
                  onChange={handleInputChange}
                  placeholder="e.g. Warm, sweet, spicy"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitSubstance}>Add Substance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <SubstanceSearch
          searchQuery={searchQuery}
          searchType={searchType}
          onSearchChange={setSearchQuery}
          onSearchTypeChange={setSearchType}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredSubstances.length > 0 ? (
        <>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Structure</TableHead>
                  <TableHead>FEMA #</TableHead>
                  <TableHead>CAS ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Taste</TableHead>
                  <TableHead>Olfactory Notes</TableHead>
                  <TableHead>Flavor Profile</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubstances.map((substance, index) => (
                  <TableRow
                    key={`substance-${index}`}
                    onClick={() => openDetailsModal(substance)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <MoleculeImage
                        pubchemCid={substance.pubchem_cid}
                        formula={substance.molecular_formula}
                        name={substance.common_name}
                        size={48}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {substance.fema_number}
                    </TableCell>
                    <TableCell>{substance.cas_id}</TableCell>
                    <TableCell>{substance.common_name}</TableCell>
                    <TableCell>{substance.taste || "-"}</TableCell>
                    <TableCell>
                      {substance.olfactory_taste_notes || "-"}
                    </TableCell>
                    <TableCell>{substance.flavor_profile || "-"}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openDetailsModal(substance)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/substances/${substance.fema_number}/edit`
                              )
                            }
                          >
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={substances.length < ITEMS_PER_PAGE}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Detail modal */}
          <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Substance Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {viewDetailsSubstance && (
                  <>
                    {/* Header with image and basic info */}
                    <div className="flex gap-4">
                      <MoleculeImage
                        pubchemCid={viewDetailsSubstance.pubchem_cid}
                        formula={viewDetailsSubstance.molecular_formula}
                        name={viewDetailsSubstance.common_name}
                        size={140}
                      />
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-lg">
                          {viewDetailsSubstance.common_name}
                        </h3>
                        {viewDetailsSubstance.iupac_name && (
                          <p className="text-xs text-muted-foreground italic">
                            {viewDetailsSubstance.iupac_name}
                          </p>
                        )}
                        {viewDetailsSubstance.molecular_formula && (
                          <p className="text-sm text-muted-foreground font-mono">
                            {viewDetailsSubstance.molecular_formula}
                          </p>
                        )}
                        <div className="flex gap-4 text-sm">
                          {viewDetailsSubstance.molecular_weight && (
                            <span>MW: {viewDetailsSubstance.molecular_weight.toFixed(2)}</span>
                          )}
                          {viewDetailsSubstance.exact_mass && (
                            <span>Exact: {viewDetailsSubstance.exact_mass.toFixed(4)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {viewDetailsSubstance.is_natural && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Natural</span>
                          )}
                          {viewDetailsSubstance.synthetic && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">Synthetic</span>
                          )}
                          {viewDetailsSubstance.type && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">{viewDetailsSubstance.type}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Identifiers */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm mb-2 text-muted-foreground">Identifiers</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">FEMA:</span> {viewDetailsSubstance.fema_number || "-"}</div>
                        <div><span className="text-muted-foreground">CAS:</span> {viewDetailsSubstance.cas_id || "-"}</div>
                        {viewDetailsSubstance.ec_number && (
                          <div><span className="text-muted-foreground">EC:</span> {viewDetailsSubstance.ec_number}</div>
                        )}
                        {viewDetailsSubstance.pubchem_cid && (
                          <div><span className="text-muted-foreground">PubChem CID:</span> {viewDetailsSubstance.pubchem_cid}</div>
                        )}
                        {viewDetailsSubstance.pubchem_sid && (
                          <div><span className="text-muted-foreground">PubChem SID:</span> {viewDetailsSubstance.pubchem_sid}</div>
                        )}
                      </div>
                    </div>

                    {/* Sensory Properties */}
                    {(viewDetailsSubstance.odor || viewDetailsSubstance.taste || viewDetailsSubstance.olfactory_taste_notes || viewDetailsSubstance.flavor_profile || viewDetailsSubstance.fema_flavor_profile) && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-sm mb-2 text-muted-foreground">Sensory Properties</h4>
                        <div className="space-y-2 text-sm">
                          {viewDetailsSubstance.odor && (
                            <p><strong>Odor:</strong> {viewDetailsSubstance.odor}</p>
                          )}
                          {viewDetailsSubstance.taste && (
                            <p><strong>Taste:</strong> {viewDetailsSubstance.taste}</p>
                          )}
                          {viewDetailsSubstance.olfactory_taste_notes && (
                            <p><strong>Olfactory Notes:</strong> {viewDetailsSubstance.olfactory_taste_notes}</p>
                          )}
                          {viewDetailsSubstance.flavor_profile && (
                            <p><strong>Flavor Profile:</strong> {viewDetailsSubstance.flavor_profile}</p>
                          )}
                          {viewDetailsSubstance.fema_flavor_profile && (
                            <p><strong>FEMA Flavor Profile:</strong> {viewDetailsSubstance.fema_flavor_profile}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Chemical Properties */}
                    {(viewDetailsSubstance.functional_groups || viewDetailsSubstance.xlogp || viewDetailsSubstance.smile || viewDetailsSubstance.inchi) && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-sm mb-2 text-muted-foreground">Chemical Properties</h4>
                        <div className="space-y-2 text-sm">
                          {viewDetailsSubstance.functional_groups && (
                            <p><strong>Functional Groups:</strong> {viewDetailsSubstance.functional_groups}</p>
                          )}
                          {viewDetailsSubstance.xlogp !== undefined && viewDetailsSubstance.xlogp !== null && (
                            <p><strong>XLogP:</strong> {viewDetailsSubstance.xlogp}</p>
                          )}
                          {viewDetailsSubstance.smile && (
                            <div>
                              <strong>SMILES:</strong>
                              <code className="block mt-1 p-2 bg-muted rounded text-xs break-all">{viewDetailsSubstance.smile}</code>
                            </div>
                          )}
                          {viewDetailsSubstance.inchi && (
                            <div>
                              <strong>InChI:</strong>
                              <code className="block mt-1 p-2 bg-muted rounded text-xs break-all">{viewDetailsSubstance.inchi}</code>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Physical Properties */}
                    {(viewDetailsSubstance.melting_point_c || viewDetailsSubstance.boiling_point_c || viewDetailsSubstance.solubility) && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-sm mb-2 text-muted-foreground">Physical Properties</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {viewDetailsSubstance.melting_point_c && (
                            <div><strong>Melting Point:</strong> {viewDetailsSubstance.melting_point_c}°C</div>
                          )}
                          {viewDetailsSubstance.boiling_point_c && (
                            <div><strong>Boiling Point:</strong> {viewDetailsSubstance.boiling_point_c}°C</div>
                          )}
                        </div>
                        {viewDetailsSubstance.solubility && Object.keys(viewDetailsSubstance.solubility).length > 0 && (
                          <div className="mt-2">
                            <strong>Solubility:</strong>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(viewDetailsSubstance.solubility, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Applications & Classification */}
                    {(viewDetailsSubstance.description || viewDetailsSubstance.common_applications || viewDetailsSubstance.food_additive_classes) && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-sm mb-2 text-muted-foreground">Applications</h4>
                        <div className="space-y-2 text-sm">
                          {viewDetailsSubstance.description && (
                            <p><strong>Description:</strong> {viewDetailsSubstance.description}</p>
                          )}
                          {viewDetailsSubstance.common_applications && (
                            <p><strong>Applications:</strong> {viewDetailsSubstance.common_applications}</p>
                          )}
                          {viewDetailsSubstance.food_additive_classes && viewDetailsSubstance.food_additive_classes.length > 0 && (
                            <div>
                              <strong>Food Additive Classes:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {viewDetailsSubstance.food_additive_classes.map((cls, i) => (
                                  <span key={i} className="px-2 py-0.5 text-xs rounded bg-muted">{cls}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Alternative Names */}
                    {viewDetailsSubstance.alternative_names && viewDetailsSubstance.alternative_names.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-sm mb-2 text-muted-foreground">Alternative Names</h4>
                        <div className="flex flex-wrap gap-1">
                          {viewDetailsSubstance.alternative_names.map((name, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs rounded bg-muted">{name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsViewDetailsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">
            No substances found matching your criteria
          </p>
          <Button onClick={() => setOpenDialog(true)}>
            Add a new substance
          </Button>
        </div>
      )}
    </div>
  );
}
