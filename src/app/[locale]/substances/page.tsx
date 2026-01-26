"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/[locale]/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import {
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Loader2,
  Info,
  List,
  Scale,
  Sparkles,
  FlaskConical,
  Building2,
  Flag,
} from "lucide-react";
import {
  getSubstances,
  searchSubstances,
  getSubstanceByFemaNumber,
} from "@/actions/substances";
import { addSubstanceToFlavour } from "@/actions/flavours";
import { getSubstanceEUFullData } from "@/actions/regulatory";
import { addToLearningQueue } from "@/actions/learning";
import type { EUAdditiveFullData } from "@/lib/eu-api/client";

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
};

export default function SubstancesPage() {
  const t = useTranslations("Substances");
  const { isSignedIn } = useUser();
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
  const [euData, setEuData] = useState<EUAdditiveFullData | null>(null);
  const [euLoading, setEuLoading] = useState(false);
  const [euError, setEuError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSubstance, setContactSubstance] = useState<Substance | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [addingToQueueId, setAddingToQueueId] = useState<number | null>(null);

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

  // Fetch EU data when modal opens
  useEffect(() => {
    if (!isViewDetailsOpen || !viewDetailsSubstance) {
      setEuData(null);
      setEuError(null);
      return;
    }

    setEuLoading(true);
    setEuError(null);

    getSubstanceEUFullData(
      viewDetailsSubstance.common_name,
      viewDetailsSubstance.alternative_names
    )
      .then((result) => {
        setEuData(result);
      })
      .catch(() => {
        setEuError("Failed to load EU regulatory data");
      })
      .finally(() => {
        setEuLoading(false);
      });
  }, [isViewDetailsOpen, viewDetailsSubstance]);

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

      {/* Learning feature tip */}
      {isSignedIn && (
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
                  <TableHead>FEMA #</TableHead>
                  <TableHead>CAS ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>EU Status</TableHead>
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <EUStatusBadge
                        chemicalName={substance.common_name}
                        alternativeNames={substance.alternative_names}
                        compact
                        showLink={false}
                      />
                    </TableCell>
                    <TableCell>{substance.taste || "-"}</TableCell>
                    <TableCell>
                      {substance.olfactory_taste_notes || "-"}
                    </TableCell>
                    <TableCell>{substance.flavor_profile || "-"}</TableCell>
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

          {/* Detail modal */}
          <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
            <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Substance Details</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                {viewDetailsSubstance && (
                  <>
                    {/* Header with image and basic info - always visible */}
                    <div className="flex gap-4 pb-4">
                      <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsImageModalOpen(true)}
                        title="Click to enlarge"
                      >
                        <MoleculeImage
                          pubchemCid={viewDetailsSubstance.pubchem_cid}
                          formula={viewDetailsSubstance.molecular_formula}
                          name={viewDetailsSubstance.common_name}
                          size={120}
                        />
                      </div>
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
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Natural</span>
                          )}
                          {viewDetailsSubstance.synthetic && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Synthetic</span>
                          )}
                          {viewDetailsSubstance.type && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{viewDetailsSubstance.type}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Main tabbed content */}
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview" className="gap-1 text-xs">
                          <Info className="h-3 w-3" />
                          <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="sensory" className="gap-1 text-xs">
                          <Sparkles className="h-3 w-3" />
                          <span className="hidden sm:inline">Sensory</span>
                        </TabsTrigger>
                        <TabsTrigger value="chemistry" className="gap-1 text-xs">
                          <FlaskConical className="h-3 w-3" />
                          <span className="hidden sm:inline">Chemistry</span>
                        </TabsTrigger>
                        <TabsTrigger value="applications" className="gap-1 text-xs">
                          <Building2 className="h-3 w-3" />
                          <span className="hidden sm:inline">Applications</span>
                        </TabsTrigger>
                        <TabsTrigger value="eu-regulation" className="gap-1 text-xs">
                          <Flag className="h-3 w-3" />
                          <span className="hidden sm:inline">EU</span>
                        </TabsTrigger>
                      </TabsList>

                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-4 space-y-4">
                        {/* Identifiers */}
                        <div>
                          <h4 className="font-medium text-sm mb-3 text-muted-foreground">Identifiers</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground">FEMA Number</p>
                              <p className="font-medium">{viewDetailsSubstance.fema_number || "-"}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground">CAS ID</p>
                              <p className="font-medium">{viewDetailsSubstance.cas_id || "-"}</p>
                            </div>
                            {viewDetailsSubstance.ec_number && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">EC Number</p>
                                <p className="font-medium">{viewDetailsSubstance.ec_number}</p>
                              </div>
                            )}
                            {viewDetailsSubstance.pubchem_cid && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">PubChem CID</p>
                                <p className="font-medium">{viewDetailsSubstance.pubchem_cid}</p>
                              </div>
                            )}
                            {viewDetailsSubstance.pubchem_sid && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">PubChem SID</p>
                                <p className="font-medium">{viewDetailsSubstance.pubchem_sid}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Alternative Names */}
                        {viewDetailsSubstance.alternative_names && viewDetailsSubstance.alternative_names.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 text-muted-foreground">Alternative Names</h4>
                            <div className="flex flex-wrap gap-1">
                              {viewDetailsSubstance.alternative_names.map((name, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{name}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Sensory Tab */}
                      <TabsContent value="sensory" className="mt-4 space-y-4">
                        {(viewDetailsSubstance.odor || viewDetailsSubstance.taste || viewDetailsSubstance.olfactory_taste_notes || viewDetailsSubstance.flavor_profile || viewDetailsSubstance.fema_flavor_profile) ? (
                          <div className="space-y-4">
                            {viewDetailsSubstance.odor && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Odor</p>
                                <p className="text-sm">{viewDetailsSubstance.odor}</p>
                              </div>
                            )}
                            {viewDetailsSubstance.taste && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Taste</p>
                                <p className="text-sm">{viewDetailsSubstance.taste}</p>
                              </div>
                            )}
                            {viewDetailsSubstance.olfactory_taste_notes && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Olfactory Notes</p>
                                <p className="text-sm">{viewDetailsSubstance.olfactory_taste_notes}</p>
                              </div>
                            )}
                            {viewDetailsSubstance.flavor_profile && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Flavor Profile</p>
                                <p className="text-sm">{viewDetailsSubstance.flavor_profile}</p>
                              </div>
                            )}
                            {viewDetailsSubstance.fema_flavor_profile && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">FEMA Flavor Profile</p>
                                <p className="text-sm">{viewDetailsSubstance.fema_flavor_profile}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-8 text-muted-foreground">
                            <Sparkles className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No sensory data available</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Chemistry Tab */}
                      <TabsContent value="chemistry" className="mt-4 space-y-4">
                        {(viewDetailsSubstance.functional_groups || viewDetailsSubstance.xlogp !== undefined || viewDetailsSubstance.smile || viewDetailsSubstance.inchi || viewDetailsSubstance.melting_point_c || viewDetailsSubstance.boiling_point_c || viewDetailsSubstance.solubility) ? (
                          <>
                            {/* Chemical Properties */}
                            {(viewDetailsSubstance.functional_groups || (viewDetailsSubstance.xlogp !== undefined && viewDetailsSubstance.xlogp !== null)) && (
                              <div>
                                <h4 className="font-medium text-sm mb-3 text-muted-foreground">Chemical Properties</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {viewDetailsSubstance.functional_groups && (
                                    <div className="p-3 rounded-lg bg-muted/50">
                                      <p className="text-xs text-muted-foreground mb-1">Functional Groups</p>
                                      <p className="text-sm">{viewDetailsSubstance.functional_groups}</p>
                                    </div>
                                  )}
                                  {viewDetailsSubstance.xlogp !== undefined && viewDetailsSubstance.xlogp !== null && (
                                    <div className="p-3 rounded-lg bg-muted/50">
                                      <p className="text-xs text-muted-foreground mb-1">XLogP</p>
                                      <p className="text-sm font-medium">{viewDetailsSubstance.xlogp}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Physical Properties */}
                            {(viewDetailsSubstance.melting_point_c || viewDetailsSubstance.boiling_point_c) && (
                              <div>
                                <h4 className="font-medium text-sm mb-3 text-muted-foreground">Physical Properties</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {viewDetailsSubstance.melting_point_c && (
                                    <div className="p-3 rounded-lg bg-muted/50">
                                      <p className="text-xs text-muted-foreground mb-1">Melting Point</p>
                                      <p className="text-sm font-medium">{viewDetailsSubstance.melting_point_c}°C</p>
                                    </div>
                                  )}
                                  {viewDetailsSubstance.boiling_point_c && (
                                    <div className="p-3 rounded-lg bg-muted/50">
                                      <p className="text-xs text-muted-foreground mb-1">Boiling Point</p>
                                      <p className="text-sm font-medium">{viewDetailsSubstance.boiling_point_c}°C</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Solubility */}
                            {viewDetailsSubstance.solubility && Object.keys(viewDetailsSubstance.solubility).length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-3 text-muted-foreground">Solubility</h4>
                                <pre className="p-3 bg-muted/50 rounded-lg text-xs overflow-x-auto">
                                  {JSON.stringify(viewDetailsSubstance.solubility, null, 2)}
                                </pre>
                              </div>
                            )}

                            {/* Structural Notations */}
                            {(viewDetailsSubstance.smile || viewDetailsSubstance.inchi) && (
                              <div>
                                <h4 className="font-medium text-sm mb-3 text-muted-foreground">Structural Notations</h4>
                                <div className="space-y-3">
                                  {viewDetailsSubstance.smile && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">SMILES</p>
                                      <code className="block p-3 bg-muted/50 rounded-lg text-xs break-all font-mono">{viewDetailsSubstance.smile}</code>
                                    </div>
                                  )}
                                  {viewDetailsSubstance.inchi && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">InChI</p>
                                      <code className="block p-3 bg-muted/50 rounded-lg text-xs break-all font-mono">{viewDetailsSubstance.inchi}</code>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center py-8 text-muted-foreground">
                            <FlaskConical className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No chemistry data available</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Applications Tab */}
                      <TabsContent value="applications" className="mt-4 space-y-4">
                        {(viewDetailsSubstance.description || viewDetailsSubstance.common_applications || (viewDetailsSubstance.food_additive_classes && viewDetailsSubstance.food_additive_classes.length > 0)) ? (
                          <>
                            {viewDetailsSubstance.description && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Description</p>
                                <p className="text-sm">{viewDetailsSubstance.description}</p>
                              </div>
                            )}
                            {viewDetailsSubstance.common_applications && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Common Applications</p>
                                <p className="text-sm">{viewDetailsSubstance.common_applications}</p>
                              </div>
                            )}
                            {viewDetailsSubstance.food_additive_classes && viewDetailsSubstance.food_additive_classes.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-2 text-muted-foreground">Food Additive Classes</h4>
                                <div className="flex flex-wrap gap-2">
                                  {viewDetailsSubstance.food_additive_classes.map((cls, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{cls}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center py-8 text-muted-foreground">
                            <Building2 className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No application data available</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* EU Regulation Tab */}
                      <TabsContent value="eu-regulation" className="mt-4">
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="font-medium text-sm text-muted-foreground">EU Regulatory Status</h4>
                          {euData && (
                            <Badge variant={euData.hasRestrictions ? "warning" : "success"} className="text-xs">
                              {euData.hasRestrictions ? (
                                <>
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Restricted
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </>
                              )}
                            </Badge>
                          )}
                        </div>

                        {euLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">Loading EU data...</span>
                          </div>
                        ) : euError ? (
                          <div className="flex items-center justify-center py-6 text-destructive text-sm">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            {euError}
                          </div>
                        ) : !euData ? (
                          <div className="flex flex-col items-center py-8 text-muted-foreground">
                            <HelpCircle className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm font-medium">Not found in EU database</p>
                            <p className="text-xs mt-1">
                              &quot;{viewDetailsSubstance.common_name}&quot; is not registered as an EU food additive.
                            </p>
                          </div>
                        ) : (
                          <Tabs defaultValue="eu-overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="eu-overview" className="gap-1 text-xs">
                                <Info className="h-3 w-3" />
                                Overview
                              </TabsTrigger>
                              <TabsTrigger value="eu-categories" className="gap-1 text-xs">
                                <List className="h-3 w-3" />
                                Categories ({euData.foodCategories.length})
                              </TabsTrigger>
                              <TabsTrigger value="eu-legislation" className="gap-1 text-xs">
                                <Scale className="h-3 w-3" />
                                Legislation
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="eu-overview" className="mt-3 space-y-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <p className="text-xs text-muted-foreground">Name</p>
                                  <p className="font-medium">{euData.name}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <p className="text-xs text-muted-foreground">E Number</p>
                                  <p className="font-medium">{euData.eNumber}</p>
                                </div>
                              </div>

                              {euData.synonyms.length > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-2">Synonyms</p>
                                  <div className="flex flex-wrap gap-1">
                                    {euData.synonyms.slice(0, 5).map((syn, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {syn}
                                      </Badge>
                                    ))}
                                    {euData.synonyms.length > 5 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{euData.synonyms.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <p className="text-xs text-muted-foreground">Food Categories</p>
                                  <p className="font-medium">{euData.foodCategories.length} authorized</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <p className="text-xs text-muted-foreground">Status</p>
                                  <p className="font-medium text-xs">
                                    {euData.hasRestrictions ? "Has specific restrictions" : "Quantum satis (no limit)"}
                                  </p>
                                </div>
                              </div>

                              {euData.detailsUrl && (
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                  <a href={euData.detailsUrl} target="_blank" rel="noopener noreferrer">
                                    View on EU Food Portal
                                    <ExternalLink className="h-3 w-3 ml-2" />
                                  </a>
                                </Button>
                              )}
                            </TabsContent>

                            <TabsContent value="eu-categories" className="mt-3">
                              <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2">
                                {euData.foodCategories.map((cat, i) => (
                                  <div
                                    key={i}
                                    className="border rounded-lg p-2 text-sm hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-xs leading-tight">{cat.name}</p>
                                        <p className="text-xs text-muted-foreground">Category {cat.level}</p>
                                      </div>
                                      <Badge
                                        variant={cat.restrictionType === "quantum satis" ? "secondary" : "warning"}
                                        className="shrink-0 text-xs"
                                      >
                                        {cat.restrictionType === "quantum satis"
                                          ? "No limit"
                                          : cat.restrictionValue
                                          ? `${cat.restrictionValue} ${cat.restrictionUnit || ""}`
                                          : cat.restrictionType || "Allowed"}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>

                            <TabsContent value="eu-legislation" className="mt-3 space-y-3">
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Regulation</p>
                                <p className="font-medium text-sm">{euData.legislation.short || "N/A"}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {euData.legislation.ojRef && (
                                  <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground">Official Journal</p>
                                    <p className="text-sm">{euData.legislation.ojRef}</p>
                                  </div>
                                )}
                                {euData.legislation.pubDate && (
                                  <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground">Publication Date</p>
                                    <p className="text-sm">{euData.legislation.pubDate}</p>
                                  </div>
                                )}
                              </div>

                              {euData.legislation.url && (
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                  <a href={euData.legislation.url} target="_blank" rel="noopener noreferrer">
                                    View Legislation
                                    <ExternalLink className="h-3 w-3 ml-2" />
                                  </a>
                                </Button>
                              )}
                            </TabsContent>
                          </Tabs>
                        )}
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                {isSignedIn && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleAddToLearningQueue()}
                          disabled={addingToQueueId === viewDetailsSubstance?.substance_id}
                        >
                          {addingToQueueId === viewDetailsSubstance?.substance_id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <BookOpen className="mr-2 h-4 w-4" />
                          )}
                          {t("addToLearningQueue") || "Add to Learning Queue"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[240px]">
                        <p className="text-xs">{t("addToQueueTooltipDesc") || "Add this substance to your queue, then visit the Learn page to track your sensory training progress."}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsViewDetailsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Enlarged molecule image modal */}
          <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <DialogContent className="sm:max-w-[500px] p-6">
              <DialogHeader>
                <DialogTitle>
                  {viewDetailsSubstance?.common_name || "Molecule Structure"}
                </DialogTitle>
              </DialogHeader>
              <div className="flex justify-center py-4">
                {viewDetailsSubstance && (
                  <MoleculeImage
                    pubchemCid={viewDetailsSubstance.pubchem_cid}
                    formula={viewDetailsSubstance.molecular_formula}
                    name={viewDetailsSubstance.common_name}
                    size={400}
                  />
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
