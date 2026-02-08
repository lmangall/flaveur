"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
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
  BookOpen,
} from "lucide-react";
import { SubstanceSearch } from "@/app/[locale]/components/substance-search";
import { MoleculeImage } from "@/app/[locale]/components/ui/molecule-image";
import { EUStatusBadge } from "@/app/[locale]/components/eu-status-badge";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { OlfactiveFamilyBadge, VolatilityBadge, DomainBadge } from "@/app/[locale]/components/olfactive-family-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { Cookie, Droplets, FlaskConical } from "lucide-react";
import type { UserDomain } from "@/lib/domain-filter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import {
  SubstanceDetailsModal,
  type SubstanceForModal,
} from "@/app/[locale]/components/substance-details-modal";
import {
  getSubstances,
  searchSubstances,
  getSubstanceByFemaNumber,
} from "@/actions/substances";
import { addSubstanceToFormula } from "@/actions/formulas";
import { addToLearningQueue } from "@/actions/learning";

type Substance = {
  substance_id: number;
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
  // Perfumery fields
  volatility_class?: string | null;
  olfactive_family?: string | null;
  odor_profile_tags?: string[] | null;
  substantivity?: string | null;
  performance_notes?: string | null;
  uses_in_perfumery?: string | null;
  use_level?: string | null;
  stability_notes?: string | null;
  price_range?: string | null;
  is_blend?: boolean | null;
  botanical_name?: string | null;
  extraction_process?: string | null;
  major_components?: string | null;
  vegan?: boolean | null;
  appearance?: string | null;
  density?: string | null;
  refractive_index?: string | null;
  flash_point?: string | null;
  vapor_pressure?: string | null;
  domain?: string | null;
};

export default function SubstancesPage() {
  const t = useTranslations("Substances");
  const { data: session } = useSession();
  const isSignedIn = !!session;
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "all" | "name" | "profile" | "cas_id" | "fema_number"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
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
    useState<SubstanceForModal | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSubstance, setContactSubstance] = useState<Substance | null>(null);
  const [addingToQueueId, setAddingToQueueId] = useState<number | null>(null);
  const [domainFilter, setDomainFilter] = useState<UserDomain | "all">("all");

  const ITEMS_PER_PAGE = 20;

  const fetchSubstancesData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (searchQuery) {
        const domain = domainFilter === "all" ? "flavor" : domainFilter;
        const data = await searchSubstances(searchQuery, searchType, currentPage, ITEMS_PER_PAGE, domain);
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
  }, [currentPage, searchQuery, searchType, domainFilter]);

  useEffect(() => {
    fetchSubstancesData();
  }, [currentPage, fetchSubstancesData]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

      // Step 2: Add the substance to a formula using server action
      // Note: This is a placeholder - you should pass the actual formula ID
      await addSubstanceToFormula(6, {
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
    setViewDetailsSubstance(substance as SubstanceForModal);
    setIsViewDetailsOpen(true);
  };

  // Open contact modal for editing
  const openContactModal = (substance: Substance) => {
    setContactSubstance(substance);
    setIsContactModalOpen(true);
  };

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    if (!contactSubstance) return;
    const message = `Hi Leo, I would like to request an edit for substance: ${contactSubstance.common_name} (FEMA #${contactSubstance.fema_number})`;
    const phoneNumber = "48537606403";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Handle adding substance to learning queue
  const handleAddToLearningQueue = async (substance?: Substance) => {
    const target = substance ?? viewDetailsSubstance;
    if (!target || !isSignedIn) return;

    setAddingToQueueId(target.substance_id);
    try {
      await addToLearningQueue(target.substance_id);
      toast.success(t("addedToQueue") || "Added to learning queue!");
    } catch (error) {
      console.error("Failed to add to queue:", error);
      toast.error(t("failedToAddToQueue") || "Failed to add to queue");
    } finally {
      setAddingToQueueId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-6">
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
        <Select value={domainFilter} onValueChange={(val) => setDomainFilter(val as UserDomain | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            <SelectItem value="flavor">
              <span className="flex items-center gap-2">
                <Cookie className="h-3 w-3" /> Flavor
              </span>
            </SelectItem>
            <SelectItem value="fragrance">
              <span className="flex items-center gap-2">
                <Droplets className="h-3 w-3" /> Fragrance
              </span>
            </SelectItem>
            <SelectItem value="cosmetic">
              <span className="flex items-center gap-2">
                <FlaskConical className="h-3 w-3" /> Cosmetic
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Learning feature tip */}
      {isHydrated && isSignedIn && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <BookOpen className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{t("learningTipTitle") || "Train your senses!"}</span>{" "}
            {t("learningTipDescription") || "Add substances to your learning queue to track your sensory training progress. Use the menu on each row or open substance details."}
          </p>
        </div>
      )}

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
                  <TableHead>Name</TableHead>
                  <TableHead>CAS ID</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Family / Profile</TableHead>
                  <TableHead>Odor / Scent</TableHead>
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
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{substance.common_name}</span>
                        <div className="flex gap-1 flex-wrap">
                          {substance.fema_number > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              FEMA {substance.fema_number}
                            </Badge>
                          )}
                          {substance.volatility_class && (
                            <VolatilityBadge volatilityClass={substance.volatility_class} size="sm" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{substance.cas_id || "-"}</TableCell>
                    <TableCell>
                      {substance.domain ? (
                        <DomainBadge domain={substance.domain} size="sm" />
                      ) : (
                        <DomainBadge domain="flavor" size="sm" />
                      )}
                    </TableCell>
                    <TableCell>
                      {substance.olfactive_family ? (
                        <OlfactiveFamilyBadge family={substance.olfactive_family} size="sm" />
                      ) : substance.flavor_profile ? (
                        <span className="text-sm text-muted-foreground line-clamp-2">{substance.flavor_profile}</span>
                      ) : substance.olfactory_taste_notes ? (
                        <span className="text-sm text-muted-foreground line-clamp-2">{substance.olfactory_taste_notes}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {substance.odor || substance.taste || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {isSignedIn && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleAddToLearningQueue(substance)}
                                  disabled={addingToQueueId === substance.substance_id}
                                >
                                  {addingToQueueId === substance.substance_id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <BookOpen className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[240px]">
                                <p className="text-xs">{t("addToQueueTooltipDesc") || "Add this substance to your queue, then visit the Learn page to track your sensory training progress."}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
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
                          {isSignedIn && (
                            <DropdownMenuItem
                              onClick={() => handleAddToLearningQueue(substance)}
                              disabled={addingToQueueId === substance.substance_id}
                            >
                              {addingToQueueId === substance.substance_id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <BookOpen className="h-4 w-4 mr-2" />
                              )}
                              {t("addToLearningQueue") || "Add to Learning Queue"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => openContactModal(substance)}
                          >
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

          {/* Substance Details Modal */}
          <SubstanceDetailsModal
            substance={viewDetailsSubstance}
            open={isViewDetailsOpen}
            onOpenChange={setIsViewDetailsOpen}
          />

          {/* Contact Leo modal for editing */}
          <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>{t("contactModalTitle")}</DialogTitle>
                <DialogDescription className="text-base leading-relaxed pt-2">
                  {t("contactModalDescription")}
                </DialogDescription>
              </DialogHeader>
              {contactSubstance && (
                <div className="py-4 space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{t("substance")}</p>
                    <p className="font-medium">{contactSubstance.common_name}</p>
                    <p className="text-sm text-muted-foreground">FEMA #{contactSubstance.fema_number}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button onClick={handleWhatsAppContact} className="bg-green-600 hover:bg-green-700 w-full">
                      {t("contactWhatsApp")}
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{t("orEmail")}</span>
                      <a
                        href={`mailto:l.mangallon@gmail.com?subject=Edit suggestion for ${contactSubstance.common_name} (FEMA #${contactSubstance.fema_number})`}
                        className="text-primary hover:underline"
                      >
                        l.mangallon@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsContactModalOpen(false)}>
                  {t("cancel")}
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
