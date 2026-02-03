"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { getFlavourById, updateFlavour } from "@/actions/flavours";
import { MarkdownEditor } from "@/app/[locale]/components/markdown-editor";
import { getCategories, type CategoryWithDetails } from "@/actions/categories";

export default function EditFlavourPage() {
  const router = useRouter();
  const params = useParams();
  const flavourId = parseInt(params.id as string, 10);
  const t = useTranslations("NewFlavour");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryWithDetails[]>([]);

  // Form state
  const [flavour, setFlavour] = useState({
    name: "",
    description: "",
    notes: "",
    isPublic: false,
    category: "",
    status: "draft",
    baseUnit: "g/kg",
  });

  useEffect(() => {
    async function loadData() {
      if (isNaN(flavourId)) {
        setError("Invalid flavour ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [flavourData, categoriesData] = await Promise.all([
          getFlavourById(flavourId),
          getCategories(),
        ]);

        setCategories(categoriesData);
        setFlavour({
          name: String(flavourData.flavour.name || ""),
          description: String(flavourData.flavour.description || ""),
          notes: String(flavourData.flavour.notes || ""),
          isPublic: Boolean(flavourData.flavour.is_public),
          category: flavourData.flavour.category_id
            ? String(flavourData.flavour.category_id)
            : "",
          status: String(flavourData.flavour.status || "draft"),
          baseUnit: String(flavourData.flavour.base_unit || "g/kg"),
        });
        setError(null);
      } catch (err) {
        console.error("Error loading flavour:", err);
        setError("Failed to load flavour data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [flavourId]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateFlavour(flavourId, {
        name: flavour.name,
        description: flavour.description,
        notes: flavour.notes || null,
        is_public: flavour.isPublic,
        category_id: flavour.category ? parseInt(flavour.category) : null,
        status: flavour.status,
        base_unit: flavour.baseUnit,
      });

      toast.success(`${flavour.name} has been updated successfully.`);
      router.push(`/flavours/${flavourId}`);
    } catch (error) {
      console.error("Error updating flavour:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update flavour. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center">
          <Skeleton className="h-10 w-20 mr-4" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Card className="p-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-24 sm:col-span-2" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        </div>
        <Card className="p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Flavour</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("basicInfo")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("flavorName")}</Label>
                <Input
                  id="name"
                  name="name"
                  value={flavour.name}
                  onChange={handleFlavourChange}
                  placeholder={t("enterFlavorName")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("category")}</Label>
                <Select
                  value={flavour.category || "none"}
                  onValueChange={(value) =>
                    handleSelectChange("category", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.category_id}
                        value={category.category_id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={flavour.description}
                  onChange={handleFlavourChange}
                  placeholder={t("describeYourFlavor")}
                  rows={3}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">{t("notes")}</Label>
                <MarkdownEditor
                  value={flavour.notes}
                  onChange={(value) => setFlavour({ ...flavour, notes: value })}
                  placeholder={t("notesPlaceholder")}
                  minHeight="min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t("status")}</Label>
                <Select
                  value={flavour.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t("draft")}</SelectItem>
                    <SelectItem value="published">{t("published")}</SelectItem>
                    <SelectItem value="archived">{t("archived")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseUnit">{t("baseUnit")}</Label>
                <Select
                  value={flavour.baseUnit}
                  onValueChange={(value) =>
                    handleSelectChange("baseUnit", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectBaseUnit")} />
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
                <Label htmlFor="isPublic">{t("publicFlavor")}</Label>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  {t("saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
