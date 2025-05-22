"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/[locale]/components/ui/button";
import { Card } from "@/app/[locale]/components/ui/card";
import { Input } from "@/app/[locale]/components/ui/input";
import { Label } from "@/app/[locale]/components/ui/label";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { Switch } from "@/app/[locale]/components/ui/switch";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SubstanceSearchField } from "@/app/[locale]/components/substance-search-field";
import type { Substance } from "@/app/type";
import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import { useAuth } from "@clerk/nextjs";

export default function NewFlavourPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();

  // Form state
  const [flavour, setFlavour] = useState({
    name: "",
    description: "",
    isPublic: true,
    category: "",
    status: "draft",
    baseUnit: "g/kg",
  });

  // Substance ingredients state
  const [substances, setSubstances] = useState<
    Array<{
      id: number;
      substance_id: string;
      name: string;
      concentration: string;
      unit: string;
      substance?: Substance;
    }>
  >([]);

  const [currentSubstance, setCurrentSubstance] = useState<Substance | null>(
    null
  );
  const [currentConcentration, setCurrentConcentration] = useState("");
  const [currentUnit, setCurrentUnit] = useState("g/kg");

  // Mock categories
  const categories = [
    { id: 1, name: "Fruit" },
    { id: 2, name: "Dessert" },
    { id: 3, name: "Beverage" },
    { id: 4, name: "Spice" },
    { id: 5, name: "Savory" },
  ];

  const handleFlavourChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFlavour({ ...flavour, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFlavour({ ...flavour, [name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFlavour({ ...flavour, isPublic: checked });
  };

  const handleAddSubstance = () => {
    if (!currentSubstance) return;

    setSubstances([
      ...substances,
      {
        id: substances.length + 1,
        substance_id: currentSubstance.substance_id.toString(),
        name: currentSubstance.common_name || "",
        concentration: currentConcentration,
        unit: currentUnit,
        substance: currentSubstance,
      },
    ]);

    // Reset current substance fields
    setCurrentSubstance(null);
    setCurrentConcentration("");
    setCurrentUnit("g/kg");
  };

  const removeSubstance = (id: number) => {
    if (substances.length === 1) return;
    setSubstances(substances.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const token = await getToken();

      // Prepare substances data for the API
      const substancesData = substances.map((substance, index) => ({
        fema_number: substance.substance?.fema_number,
        concentration: parseFloat(substance.concentration),
        unit: substance.unit,
        order_index: index + 1,
      }));

      // Create the flavour with substances in a single API call
      const flavourResponse = await fetch(`${API_URL}/api/flavours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: flavour.name,
          description: flavour.description,
          is_public: flavour.isPublic,
          // category_id: parseInt(flavour.category),
          status: flavour.status,
          base_unit: flavour.baseUnit,
          substances: substancesData, // Include substances in the main request
        }),
      });

      if (!flavourResponse.ok) {
        const errorData = await flavourResponse.json();
        throw new Error(errorData.error || "Failed to create flavour");
      }

      await flavourResponse.json();

      toast.success(`${flavour.name} has been created successfully.`);
      router.push("/flavours");
    } catch (error) {
      console.error("Error creating flavour:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create flavour. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Flavor</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Flavor Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={flavour.name}
                  onChange={handleFlavourChange}
                  placeholder="Enter flavor name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={flavour.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={flavour.description}
                  onChange={handleFlavourChange}
                  placeholder="Describe your flavor"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={flavour.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseUnit">Base Unit</Label>
                <Select
                  value={flavour.baseUnit}
                  onValueChange={(value) =>
                    handleSelectChange("baseUnit", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select base unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g/kg">g/kg</SelectItem>
                    <SelectItem value="%(v/v)">%(v/v)</SelectItem>
                    <SelectItem value="g/L">g/L</SelectItem>
                    <SelectItem value="mL/L">mL/L</SelectItem>
                    <SelectItem value="ppm">ppm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={flavour.isPublic}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isPublic">Public flavor</Label>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Substances</h2>

            <div className="space-y-4">
              {/* Search and Add Section */}
              <div className="grid gap-4 sm:grid-cols-12 p-4 border rounded-lg bg-muted/30">
                <div className="sm:col-span-5 space-y-2">
                  <SubstanceSearchField
                    onSelect={(substance) => {
                      setCurrentSubstance(substance);
                      // Enable the concentration input when a substance is selected
                      const concentrationInput = document.querySelector(
                        'input[type="number"]'
                      ) as HTMLInputElement;
                      if (concentrationInput) {
                        concentrationInput.focus();
                      }
                    }}
                  />
                </div>
                <div className="sm:col-span-3 space-y-2">
                  <Input
                    value={currentConcentration}
                    onChange={(e) => setCurrentConcentration(e.target.value)}
                    placeholder="Amount"
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={!currentSubstance}
                  />
                </div>
                <div className="sm:col-span-3 space-y-2">
                  <Select
                    value={currentUnit}
                    onValueChange={setCurrentUnit}
                    disabled={!currentSubstance}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g/kg">g/kg</SelectItem>
                      <SelectItem value="%(v/v)">%(v/v)</SelectItem>
                      <SelectItem value="g/L">g/L</SelectItem>
                      <SelectItem value="mL/L">mL/L</SelectItem>
                      <SelectItem value="ppm">ppm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddSubstance}
                    disabled={!currentSubstance || !currentConcentration}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Selected Substances List */}
              {substances.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Added Substances</h3>
                    <Badge variant="secondary" className="text-xs">
                      {substances.length} component
                      {substances.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {/* Desktop Table View */}
                  <Card className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Substance Name</TableHead>
                          <TableHead>FEMA #</TableHead>
                          <TableHead>CAS #</TableHead>
                          <TableHead className="text-right">
                            Concentration
                          </TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="w-[80px] text-center">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {substances.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{item.name}</div>
                                {item.substance?.chemical_name && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {item.substance.chemical_name}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.substance?.fema_number ? (
                                <Badge variant="outline" className="text-xs">
                                  {item.substance.fema_number}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  N/A
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {item.substance?.cas_number || (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {item.concentration}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {item.unit}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => removeSubstance(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Remove substance</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {substances.map((item) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.substance?.chemical_name && (
                              <p className="text-sm text-muted-foreground">
                                {item.substance.chemical_name}
                              </p>
                            )}
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 ml-2"
                                  onClick={() => removeSubstance(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove substance</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              FEMA #
                            </Label>
                            <div className="mt-1">
                              {item.substance?.fema_number ? (
                                <Badge variant="outline" className="text-xs">
                                  {item.substance.fema_number}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  N/A
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">
                              CAS #
                            </Label>
                            <div className="mt-1 font-mono text-xs">
                              {item.substance?.cas_number || (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Concentration
                            </Label>
                            <div className="mt-1 font-medium">
                              {item.concentration}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Unit
                            </Label>
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {item.unit}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Summary Footer */}
                  <Card className="p-3 bg-muted/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {substances.length} substance
                          {substances.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Units:</span>
                        {[...new Set(substances.map((s) => s.unit))].map(
                          (unit) => (
                            <Badge
                              key={unit}
                              variant="secondary"
                              className="text-xs"
                            >
                              {unit}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Flavor
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
