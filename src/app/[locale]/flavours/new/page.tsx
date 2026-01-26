"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useConfetti } from "@/app/[locale]/components/ui/confetti";
import { createFlavour } from "@/actions/flavours";
import { getCategories, type CategoryWithDetails } from "@/actions/categories";

export default function NewFlavourPage() {
  const router = useRouter();
  const t = useTranslations("NewFlavour");
  const { fire: fireConfetti } = useConfetti();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [flavour, setFlavour] = useState({
    name: "",
    description: "",
    isPublic: false,
    category: "",
    status: "draft",
    baseUnit: "g/kg",
  });

  // Categories from database
  const [categories, setCategories] = useState<CategoryWithDetails[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

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
      const result = await createFlavour({
        name: flavour.name,
        description: flavour.description,
        is_public: flavour.isPublic,
        category_id: flavour.category ? parseInt(flavour.category) : null,
        status: flavour.status,
        base_unit: flavour.baseUnit,
      });

      fireConfetti();
      toast.success(`${flavour.name} has been created successfully.`);
      // Redirect to the new flavour's detail page to add substances
      router.push(`/flavours/${result.flavour.flavour_id}`);
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("newFlavor")}</h1>
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
                  value={flavour.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
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
                  {t("saveFlavor")}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
