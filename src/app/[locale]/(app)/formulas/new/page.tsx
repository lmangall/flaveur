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
import { ArrowLeft, Save, FileText, FlaskConical, Award, Droplets, Cookie, Sparkles, Flame, Waves, Cylinder } from "lucide-react";
import { COSMETIC_PRODUCT_TYPE_OPTIONS } from "@/constants";
import { toast } from "sonner";
import { useConfetti } from "@/app/[locale]/components/ui/confetti";
import { createFormula } from "@/actions/formulas";
import { cn } from "@/lib/utils";
import { getCategories, type CategoryWithDetails } from "@/actions/categories";
import { HowItWorks } from "@/app/[locale]/components/HowItWorks";

export default function NewFormulaPage() {
  const router = useRouter();
  const t = useTranslations("NewFormula");
  const { fire: fireConfetti } = useConfetti();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formula, setFormula] = useState({
    name: "",
    description: "",
    isPublic: false,
    category: "",
    status: "draft",
    baseUnit: "g/kg",
    projectType: "flavor" as "flavor" | "perfume" | "cosmetic",
    cosmeticProductType: "",
  });

  // Categories from database
  const [categories, setCategories] = useState<CategoryWithDetails[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleFormulaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormula({ ...formula, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormula({ ...formula, [name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormula({ ...formula, isPublic: checked });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createFormula({
        name: formula.name,
        description: formula.description,
        is_public: formula.isPublic,
        category_id: formula.category ? parseInt(formula.category) : null,
        status: formula.status,
        base_unit: formula.baseUnit,
        project_type: formula.projectType,
        cosmetic_product_type: formula.projectType === "cosmetic" ? formula.cosmeticProductType || null : null,
      });

      fireConfetti();
      toast.success(`${formula.name} has been created successfully.`);
      // Redirect to the new formula's detail page to add substances
      router.push(`/formulas/${result.formula.formula_id}`);
    } catch (error) {
      console.error("Error creating formula:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create formula. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("newFlavor")}</h1>
      </div>

      <HowItWorks
        title={t("howItWorksTitle")}
        steps={[
          {
            icon: FileText,
            title: t("step1Title"),
            description: t("step1Description"),
          },
          {
            icon: Save,
            title: t("step2Title"),
            description: t("step2Description"),
          },
          {
            icon: FlaskConical,
            title: t("step3Title"),
            description: t("step3Description"),
          },
        ]}
        tip={{
          icon: Award,
          title: t("tipTitle"),
          description: t("tipDescription"),
        }}
        faqLink={{
          text: t("faqLinkText"),
        }}
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Project Type Selector */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("projectType")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormula({
                    ...formula,
                    projectType: "flavor",
                    baseUnit: "g/kg",
                    cosmeticProductType: "",
                  })
                }
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all",
                  formula.projectType === "flavor"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-muted hover:border-muted-foreground/30"
                )}
              >
                <Cookie
                  className={cn(
                    "h-8 w-8",
                    formula.projectType === "flavor"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <div className="text-center">
                  <p className="font-semibold">{t("flavor")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("flavorDescription")}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormula({
                    ...formula,
                    projectType: "perfume",
                    baseUnit: "%(v/v)",
                    cosmeticProductType: "",
                  })
                }
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all",
                  formula.projectType === "perfume"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-muted hover:border-muted-foreground/30"
                )}
              >
                <Droplets
                  className={cn(
                    "h-8 w-8",
                    formula.projectType === "perfume"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <div className="text-center">
                  <p className="font-semibold">{t("perfume")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("perfumeDescription")}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormula({
                    ...formula,
                    projectType: "cosmetic",
                    baseUnit: "%(v/v)",
                    cosmeticProductType: "",
                  })
                }
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all",
                  formula.projectType === "cosmetic"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-muted hover:border-muted-foreground/30"
                )}
              >
                <FlaskConical
                  className={cn(
                    "h-8 w-8",
                    formula.projectType === "cosmetic"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <div className="text-center">
                  <p className="font-semibold">{t("cosmetic")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("cosmeticDescription")}
                  </p>
                </div>
              </button>
            </div>
          </Card>

          {/* Cosmetic Product Type Selector */}
          {formula.projectType === "cosmetic" && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">{t("productType")}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t("productTypeHint")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {COSMETIC_PRODUCT_TYPE_OPTIONS.map((option) => {
                  const IconComponent = {
                    Droplets,
                    Flame,
                    FlaskConical,
                    Waves,
                    Sparkles,
                    Cylinder,
                  }[option.icon] || FlaskConical;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormula({ ...formula, cosmeticProductType: option.value })
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center",
                        formula.cosmeticProductType === option.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <IconComponent
                        className={cn(
                          "h-6 w-6",
                          formula.cosmeticProductType === option.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("basicInfo")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("flavorName")}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formula.name}
                  onChange={handleFormulaChange}
                  placeholder={t("enterFlavorName")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("category")}</Label>
                <Select
                  value={formula.category}
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
                  value={formula.description}
                  onChange={handleFormulaChange}
                  placeholder={t("describeYourFlavor")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t("status")}</Label>
                <Select
                  value={formula.status}
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
                  value={formula.baseUnit}
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
                  checked={formula.isPublic}
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
