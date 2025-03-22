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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/[locale]/components/ui/tabs";
import { Switch } from "@/app/[locale]/components/ui/switch";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function NewFlavourPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [substances, setSubstances] = useState([
    { id: 1, substance_id: "", name: "", concentration: "", unit: "g/kg" },
  ]);

  // Flavor ingredients state
  const [ingredients, setIngredients] = useState([
    { id: 1, flavour_id: "", name: "", concentration: "", unit: "g/kg" },
  ]);

  // Mock categories
  const categories = [
    { id: 1, name: "Fruit" },
    { id: 2, name: "Dessert" },
    { id: 3, name: "Beverage" },
    { id: 4, name: "Spice" },
    { id: 5, name: "Savory" },
  ];

  // Mock substances for demo
  const availableSubstances = [
    { id: 1234, name: "Vanillin", fema_number: 1234 },
    { id: 2345, name: "Ethyl maltol", fema_number: 2345 },
    { id: 3456, name: "Benzaldehyde", fema_number: 3456 },
    { id: 4567, name: "Diacetyl", fema_number: 4567 },
    { id: 5678, name: "Citral", fema_number: 5678 },
  ];

  // Mock flavors for demo
  const availableFlavors = [
    { id: 101, name: "Base Vanilla" },
    { id: 102, name: "Simple Chocolate" },
    { id: 103, name: "Basic Cherry" },
    { id: 104, name: "Plain Lemon" },
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

  const addSubstance = () => {
    setSubstances([
      ...substances,
      {
        id: substances.length + 1,
        substance_id: "",
        name: "",
        concentration: "",
        unit: "g/kg",
      },
    ]);
  };

  const removeSubstance = (id: number) => {
    if (substances.length === 1) return;
    setSubstances(substances.filter((s) => s.id !== id));
  };

  const handleSubstanceChange = (id: number, field: string, value: string) => {
    setSubstances(
      substances.map((s) => {
        if (s.id === id) {
          if (field === "substance_id") {
            const selectedSubstance = availableSubstances.find(
              (sub) => sub.id.toString() === value
            );
            return {
              ...s,
              [field]: value,
              name: selectedSubstance ? selectedSubstance.name : "",
            };
          }
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: ingredients.length + 1,
        flavour_id: "",
        name: "",
        concentration: "",
        unit: "g/kg",
      },
    ]);
  };

  const removeIngredient = (id: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const handleIngredientChange = (id: number, field: string, value: string) => {
    setIngredients(
      ingredients.map((i) => {
        if (i.id === id) {
          if (field === "flavour_id") {
            const selectedFlavor = availableFlavors.find(
              (flav) => flav.id.toString() === value
            );
            return {
              ...i,
              [field]: value,
              name: selectedFlavor ? selectedFlavor.name : "",
            };
          }
          return { ...i, [field]: value };
        }
        return i;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    //TODO: This is only a simulation, correct it!
    setTimeout(() => {
      toast("`${flavour.name} has been created successfully.");
      router.push("/flavours");
    }, 1500);
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

          <Tabs defaultValue="substances" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="substances">Substance Components</TabsTrigger>
              <TabsTrigger value="ingredients">Flavor Ingredients</TabsTrigger>
            </TabsList>
            <TabsContent value="substances" className="mt-4">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Substances</h2>
                  <Button type="button" onClick={addSubstance} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Substance
                  </Button>
                </div>

                {substances.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-4 sm:grid-cols-12 mb-4 pb-4 border-b last:border-b-0"
                  >
                    <div className="sm:col-span-5 space-y-2">
                      <Label htmlFor={`substance-${item.id}`}>Substance</Label>
                      <Select
                        value={item.substance_id}
                        onValueChange={(value) =>
                          handleSubstanceChange(item.id, "substance_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select substance" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubstances.map((substance) => (
                            <SelectItem
                              key={substance.id}
                              value={substance.id.toString()}
                            >
                              {substance.name} (FEMA {substance.fema_number})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-3 space-y-2">
                      <Label htmlFor={`concentration-${item.id}`}>
                        Concentration
                      </Label>
                      <Input
                        id={`concentration-${item.id}`}
                        value={item.concentration}
                        onChange={(e) =>
                          handleSubstanceChange(
                            item.id,
                            "concentration",
                            e.target.value
                          )
                        }
                        placeholder="Amount"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-2">
                      <Label htmlFor={`unit-${item.id}`}>Unit</Label>
                      <Select
                        value={item.unit}
                        onValueChange={(value) =>
                          handleSubstanceChange(item.id, "unit", value)
                        }
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
                    <div className="sm:col-span-1 flex items-end justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSubstance(item.id)}
                        disabled={substances.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </Card>
            </TabsContent>
            <TabsContent value="ingredients" className="mt-4">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Flavor Ingredients</h2>
                  <Button type="button" onClick={addIngredient} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flavor
                  </Button>
                </div>

                {ingredients.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-4 sm:grid-cols-12 mb-4 pb-4 border-b last:border-b-0"
                  >
                    <div className="sm:col-span-5 space-y-2">
                      <Label htmlFor={`ingredient-${item.id}`}>Flavor</Label>
                      <Select
                        value={item.flavour_id}
                        onValueChange={(value) =>
                          handleIngredientChange(item.id, "flavour_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select flavor" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFlavors.map((flavor) => (
                            <SelectItem
                              key={flavor.id}
                              value={flavor.id.toString()}
                            >
                              {flavor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-3 space-y-2">
                      <Label htmlFor={`ingredient-concentration-${item.id}`}>
                        Concentration
                      </Label>
                      <Input
                        id={`ingredient-concentration-${item.id}`}
                        value={item.concentration}
                        onChange={(e) =>
                          handleIngredientChange(
                            item.id,
                            "concentration",
                            e.target.value
                          )
                        }
                        placeholder="Amount"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-2">
                      <Label htmlFor={`ingredient-unit-${item.id}`}>Unit</Label>
                      <Select
                        value={item.unit}
                        onValueChange={(value) =>
                          handleIngredientChange(item.id, "unit", value)
                        }
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
                    <div className="sm:col-span-1 flex items-end justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(item.id)}
                        disabled={ingredients.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </Card>
            </TabsContent>
          </Tabs>

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
