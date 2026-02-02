"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/[locale]/components/ui/dialog";
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
  BookOpen,
} from "lucide-react";
import { MoleculeImage } from "@/app/[locale]/components/ui/molecule-image";
import { getSubstanceEUFullData } from "@/actions/regulatory";
import { addToLearningQueue } from "@/actions/learning";
import type { EUAdditiveFullData } from "@/lib/eu-api/client";

export type SubstanceForModal = {
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

interface SubstanceDetailsModalProps {
  substance: SubstanceForModal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showAddToQueue?: boolean;
}

export function SubstanceDetailsModal({
  substance,
  open,
  onOpenChange,
  showAddToQueue = true,
}: SubstanceDetailsModalProps) {
  const t = useTranslations("Substances");
  const { data: session } = useSession();
  const isSignedIn = !!session;

  const [euData, setEuData] = useState<EUAdditiveFullData | null>(null);
  const [euLoading, setEuLoading] = useState(false);
  const [euError, setEuError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [addingToQueueId, setAddingToQueueId] = useState<number | null>(null);

  // Fetch EU data when modal opens
  useEffect(() => {
    if (!open || !substance) {
      setEuData(null);
      setEuError(null);
      return;
    }

    setEuLoading(true);
    setEuError(null);

    getSubstanceEUFullData(substance.common_name, substance.alternative_names)
      .then((result) => {
        setEuData(result);
      })
      .catch(() => {
        setEuError("Failed to load EU regulatory data");
      })
      .finally(() => {
        setEuLoading(false);
      });
  }, [open, substance]);

  const handleAddToLearningQueue = async () => {
    if (!substance || !isSignedIn) return;

    setAddingToQueueId(substance.substance_id);
    try {
      await addToLearningQueue(substance.substance_id);
      toast.success(t("addedToQueue") || "Added to learning queue!");
    } catch (error) {
      console.error("Failed to add to queue:", error);
      toast.error(t("failedToAddToQueue") || "Failed to add to queue");
    } finally {
      setAddingToQueueId(null);
    }
  };

  if (!substance) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Substance Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Header with image and basic info - always visible */}
            <div className="flex gap-4 pb-4">
              <div
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsImageModalOpen(true)}
                title="Click to enlarge"
              >
                <MoleculeImage
                  pubchemCid={substance.pubchem_cid}
                  formula={substance.molecular_formula}
                  name={substance.common_name}
                  size={120}
                />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-lg">{substance.common_name}</h3>
                {substance.iupac_name && (
                  <p className="text-xs text-muted-foreground italic">
                    {substance.iupac_name}
                  </p>
                )}
                {substance.molecular_formula && (
                  <p className="text-sm text-muted-foreground font-mono">
                    {substance.molecular_formula}
                  </p>
                )}
                <div className="flex gap-4 text-sm">
                  {substance.molecular_weight && (
                    <span>MW: {substance.molecular_weight.toFixed(2)}</span>
                  )}
                  {substance.exact_mass && (
                    <span>Exact: {substance.exact_mass.toFixed(4)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {substance.is_natural && <Badge variant="success">Natural</Badge>}
                  {substance.synthetic && <Badge variant="secondary">Synthetic</Badge>}
                  {substance.type && <Badge variant="info">{substance.type}</Badge>}
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
                  <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                    Identifiers
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">FEMA Number</p>
                      <p className="font-medium">{substance.fema_number || "-"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">CAS ID</p>
                      <p className="font-medium">{substance.cas_id || "-"}</p>
                    </div>
                    {substance.ec_number && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">EC Number</p>
                        <p className="font-medium">{substance.ec_number}</p>
                      </div>
                    )}
                    {substance.pubchem_cid && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">PubChem CID</p>
                        <p className="font-medium">{substance.pubchem_cid}</p>
                      </div>
                    )}
                    {substance.pubchem_sid && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">PubChem SID</p>
                        <p className="font-medium">{substance.pubchem_sid}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alternative Names */}
                {substance.alternative_names && substance.alternative_names.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                      Alternative Names
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {substance.alternative_names.map((name, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Sensory Tab */}
              <TabsContent value="sensory" className="mt-4 space-y-4">
                {substance.odor ||
                substance.taste ||
                substance.olfactory_taste_notes ||
                substance.flavor_profile ||
                substance.fema_flavor_profile ? (
                  <div className="space-y-4">
                    {substance.odor && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Odor</p>
                        <p className="text-sm">{substance.odor}</p>
                      </div>
                    )}
                    {substance.taste && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Taste</p>
                        <p className="text-sm">{substance.taste}</p>
                      </div>
                    )}
                    {substance.olfactory_taste_notes && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Olfactory Notes</p>
                        <p className="text-sm">{substance.olfactory_taste_notes}</p>
                      </div>
                    )}
                    {substance.flavor_profile && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Flavor Profile</p>
                        <p className="text-sm">{substance.flavor_profile}</p>
                      </div>
                    )}
                    {substance.fema_flavor_profile && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">FEMA Flavor Profile</p>
                        <p className="text-sm">{substance.fema_flavor_profile}</p>
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
                {substance.functional_groups ||
                substance.xlogp !== undefined ||
                substance.smile ||
                substance.inchi ||
                substance.melting_point_c ||
                substance.boiling_point_c ||
                substance.solubility ? (
                  <>
                    {/* Chemical Properties */}
                    {(substance.functional_groups ||
                      (substance.xlogp !== undefined && substance.xlogp !== null)) && (
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                          Chemical Properties
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {substance.functional_groups && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">
                                Functional Groups
                              </p>
                              <p className="text-sm">{substance.functional_groups}</p>
                            </div>
                          )}
                          {substance.xlogp !== undefined && substance.xlogp !== null && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">XLogP</p>
                              <p className="text-sm font-medium">{substance.xlogp}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Physical Properties */}
                    {(substance.melting_point_c || substance.boiling_point_c) && (
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                          Physical Properties
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {substance.melting_point_c && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Melting Point</p>
                              <p className="text-sm font-medium">
                                {substance.melting_point_c}°C
                              </p>
                            </div>
                          )}
                          {substance.boiling_point_c && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Boiling Point</p>
                              <p className="text-sm font-medium">
                                {substance.boiling_point_c}°C
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Solubility */}
                    {substance.solubility &&
                      Object.keys(substance.solubility).length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                            Solubility
                          </h4>
                          <pre className="p-3 bg-muted/50 rounded-lg text-xs overflow-x-auto">
                            {JSON.stringify(substance.solubility, null, 2)}
                          </pre>
                        </div>
                      )}

                    {/* Structural Notations */}
                    {(substance.smile || substance.inchi) && (
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                          Structural Notations
                        </h4>
                        <div className="space-y-3">
                          {substance.smile && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">SMILES</p>
                              <code className="block p-3 bg-muted/50 rounded-lg text-xs break-all font-mono">
                                {substance.smile}
                              </code>
                            </div>
                          )}
                          {substance.inchi && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">InChI</p>
                              <code className="block p-3 bg-muted/50 rounded-lg text-xs break-all font-mono">
                                {substance.inchi}
                              </code>
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
                {substance.description ||
                substance.common_applications ||
                (substance.food_additive_classes &&
                  substance.food_additive_classes.length > 0) ? (
                  <>
                    {substance.description && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{substance.description}</p>
                      </div>
                    )}
                    {substance.common_applications && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Common Applications</p>
                        <p className="text-sm">{substance.common_applications}</p>
                      </div>
                    )}
                    {substance.food_additive_classes &&
                      substance.food_additive_classes.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                            Food Additive Classes
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {substance.food_additive_classes.map((cls, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {cls}
                              </Badge>
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
                  <h4 className="font-medium text-sm text-muted-foreground">
                    EU Regulatory Status
                  </h4>
                  {euData && (
                    <Badge
                      variant={euData.hasRestrictions ? "warning" : "success"}
                      className="text-xs"
                    >
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
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading EU data...
                    </span>
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
                      &quot;{substance.common_name}&quot; is not registered as an EU food
                      additive.
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
                            {euData.hasRestrictions
                              ? "Has specific restrictions"
                              : "Quantum satis (no limit)"}
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
                                <p className="text-xs text-muted-foreground">
                                  Category {cat.level}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  cat.restrictionType === "quantum satis"
                                    ? "secondary"
                                    : "warning"
                                }
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
                        <p className="font-medium text-sm">
                          {euData.legislation.short || "N/A"}
                        </p>
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
                          <a
                            href={euData.legislation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
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
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {showAddToQueue && isSignedIn && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleAddToLearningQueue}
                      disabled={addingToQueueId === substance.substance_id}
                    >
                      {addingToQueueId === substance.substance_id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BookOpen className="mr-2 h-4 w-4" />
                      )}
                      {t("addToLearningQueue") || "Add to Learning Queue"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px]">
                    <p className="text-xs">
                      {t("addToQueueTooltipDesc") ||
                        "Add this substance to your queue, then visit the Learn page to track your sensory training progress."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enlarged molecule image modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader>
            <DialogTitle>{substance.common_name || "Molecule Structure"}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <MoleculeImage
              pubchemCid={substance.pubchem_cid}
              formula={substance.molecular_formula}
              name={substance.common_name}
              size={400}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
