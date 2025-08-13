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

type Substance = {
  fema_number: number;
  common_name: string;
  is_natural: boolean;
  cas_id: string;
  odor: string;
  functional_groups: string;
  flavor_profile: string;
  taste?: string;
  olfactory_taste_notes?: string;
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

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const ITEMS_PER_PAGE = 10;

  const fetchSubstances = useCallback(() => {
    setIsLoading(true);
    const searchParams = new URLSearchParams();

    if (searchQuery) {
      searchParams.append("query", searchQuery);
      searchParams.append("type", searchType);
    } else {
      searchParams.append("page", currentPage.toString());
    }

    const url = `${API_URL}/api/substances${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSubstances(Array.isArray(data) ? data : data.results || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching substances:", error);
        setIsLoading(false);
      });
  }, [currentPage, API_URL, searchQuery, searchType]);

  useEffect(() => {
    fetchSubstances();
  }, [currentPage, fetchSubstances]);

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

      // Step 1: Fetch Substance ID based on FEMA Number
      const res = await fetch(`${API_URL}/api/substances/${femaNumber}`);
      if (!res.ok) throw new Error("Failed to fetch substance");

      const foundSubstance = await res.json();

      if (!foundSubstance) {
        alert("Substance not found in database.");
        return;
      }

      // Step 2: Add the substance to the flavour
      const addRes = await fetch(`${API_URL}/api/flavours/6/substances`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          substance_id: foundSubstance.substance_id, // Use the correct ID
          concentration: 10.5, // Example concentration
          unit: "g/kg",
          order_index: 1,
        }),
      });

      if (!addRes.ok) throw new Error("Failed to add substance to flavour");

      // Step 3: Update UI with the newly added substance
      fetchSubstances(); // Refresh the list after adding
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
                  <TableRow key={`substance-${index}`}>
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openDetailsModal(substance)} // Open the details modal
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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Substance Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {viewDetailsSubstance && (
                  <>
                    <p>
                      <strong>FEMA Number:</strong>{" "}
                      {viewDetailsSubstance.fema_number}
                    </p>
                    <p>
                      <strong>CAS ID:</strong> {viewDetailsSubstance.cas_id}
                    </p>
                    <p>
                      <strong>Common Name:</strong>{" "}
                      {viewDetailsSubstance.common_name}
                    </p>
                    <p>
                      <strong>Odor:</strong> {viewDetailsSubstance.odor}
                    </p>
                    <p>
                      <strong>Functional Groups:</strong>{" "}
                      {viewDetailsSubstance.functional_groups}
                    </p>
                    <p>
                      <strong>Flavor Profile:</strong>{" "}
                      {viewDetailsSubstance.flavor_profile}
                    </p>
                    {viewDetailsSubstance.taste && (
                      <p>
                        <strong>Taste:</strong> {viewDetailsSubstance.taste}
                      </p>
                    )}
                    {viewDetailsSubstance.olfactory_taste_notes && (
                      <p>
                        <strong>Olfactory Notes:</strong>{" "}
                        {viewDetailsSubstance.olfactory_taste_notes}
                      </p>
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
