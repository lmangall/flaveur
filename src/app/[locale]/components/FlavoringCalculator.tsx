"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { Slider } from "@/app/[locale]/components/ui/slider";
import { Label } from "@/app/[locale]/components/ui/label";
import { Input } from "@/app/[locale]/components/ui/input";
import { Separator } from "@/app/[locale]/components/ui/separator";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/[locale]/components/ui/tabs";
import { Switch } from "@/app/[locale]/components/ui/switch";
import { toast } from "sonner";
import EditableBadge from "@/app/[locale]/components/EditableBadge";
import posthog from "posthog-js";

// Create a price badge component
const PriceBadge = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleBlur = () => {
    let newValue = parseFloat(inputValue);
    // Validate the input
    if (isNaN(newValue)) {
      newValue = value;
    } else if (newValue < 0) {
      newValue = 0;
    }
    setInputValue(newValue.toString());
    onChange(newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };

  // Update inputValue when value prop changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  return (
    <div onClick={() => setIsEditing(true)} className="inline-block">
      {isEditing ? (
        <Input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-20 h-6 p-1 text-xs font-mono"
          autoFocus
          min={0}
          step="0.01"
        />
      ) : (
        <Badge
          variant="outline"
          className="font-mono cursor-pointer hover:bg-muted"
        >
          {value.toFixed(2)}€/kg
        </Badge>
      )}
    </div>
  );
};

type Params = {
  syrupBrix: number;
  infusionBrix: number;
  infusionAlcohol: number;
  alcoholMass: number; // Mass of pure alcohol in g
  targetBrix: number;
  targetAlcohol: number;
  totalMass: number;
};

type Prices = {
  syrupPerKg: number;
  infusionPerKg: number;
  alcoholPerKg: number;
  waterPerKg: number;
};

const PURE_ALCOHOL_PERCENT = 96; // Fixed alcohol concentration at 96%

const FlavoringCalculator = () => {
  const t = useTranslations("Calculator");
  const [params, setParams] = useState<Params>({
    syrupBrix: 67,
    infusionBrix: 24,
    infusionAlcohol: 55,
    alcoholMass: 0, // Default to 0 g of pure alcohol
    targetBrix: 34,
    targetAlcohol: 19,
    totalMass: 1000,
  });

  const [prices, setPrices] = useState<Prices>({
    syrupPerKg: 5.5,
    infusionPerKg: 12.75,
    alcoholPerKg: 20.0,
    waterPerKg: 0.2,
  });

  const [result, setResult] = useState({
    syrup: "0 g",
    infusion: "0 g",
    alcohol: "0 g",
    water: "0 g",
    isValid: true,
    syrupPercent: 0,
    infusionPercent: 0,
    alcoholPercent: 0,
    waterPercent: 0,
    syrupMass: 0,
    infusionMass: 0,
    alcoholMass: 0,
    waterMass: 0,
    totalCost: 0,
  });

  const [email, setEmail] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [manualAlcoholInput, setManualAlcoholInput] = useState(false);
  const hasTrackedCalculation = useRef(false);

  const calculateMix = () => {
    const {
      syrupBrix,
      infusionBrix,
      infusionAlcohol,
      alcoholMass,
      targetBrix,
      targetAlcohol,
      totalMass,
    } = params;

    // Calculate how much total alcohol we need in mass
    const totalAlcoholMassNeeded = (targetAlcohol * totalMass) / 100;

    // We'll use this variable to track pure alcohol mass
    let alcoholMassUsed = alcoholMass;

    // Calculate alcohol contribution from pure alcohol
    let alcoholContributionFromPureAlcohol =
      (alcoholMassUsed * PURE_ALCOHOL_PERCENT) / 100;

    // Calculate how much infusion is needed for remaining alcohol (in mass)
    const remainingAlcohol =
      totalAlcoholMassNeeded - alcoholContributionFromPureAlcohol;

    // Calculate required infusion mass
    let infusionMass = (remainingAlcohol * 100) / infusionAlcohol;

    // If infusion amount is negative or exceeds available mass, adjust
    if (infusionMass < 0) {
      infusionMass = 0;
    } else if (infusionMass > totalMass - alcoholMassUsed) {
      infusionMass = totalMass - alcoholMassUsed;
    }

    // Calculate syrup needed based on sugar balance
    // The Brix is a percentage of sugar, so in terms of mass:
    // (totalMass * targetBrix) = (syrupMass * syrupBrix) + (infusionMass * infusionBrix)
    let syrupMass =
      (targetBrix * totalMass - infusionBrix * infusionMass) / syrupBrix;

    // Calculate remaining water mass
    let waterMass = totalMass - syrupMass - infusionMass - alcoholMassUsed;

    // Calculate cost for each ingredient in euros
    const syrupCost = (syrupMass / 1000) * prices.syrupPerKg;
    const infusionCost = (infusionMass / 1000) * prices.infusionPerKg;
    const alcoholCost = (alcoholMassUsed / 1000) * prices.alcoholPerKg;
    const waterCost = (waterMass / 1000) * prices.waterPerKg;
    const totalCost = syrupCost + infusionCost + alcoholCost + waterCost;

    // Check if solution is valid
    const isValid = syrupMass >= 0 && infusionMass >= 0 && waterMass >= 0;

    // Format numbers to always have exactly 2 decimal places
    const formatNumber = (num: number) => num.toFixed(2);

    // Return values even if invalid, to ensure continuous updates
    return {
      syrup: isValid ? formatNumber(syrupMass) + " g" : "Invalid",
      infusion: isValid ? formatNumber(infusionMass) + " g" : "Invalid",
      alcohol: formatNumber(alcoholMassUsed) + " g", // Always show alcohol mass
      water: isValid ? formatNumber(waterMass) + " g" : "Invalid",
      isValid: isValid,
      syrupPercent: isValid ? Math.round((syrupMass / totalMass) * 100) : 0,
      infusionPercent: isValid
        ? Math.round((infusionMass / totalMass) * 100)
        : 0,
      alcoholPercent: Math.round((alcoholMassUsed / totalMass) * 100), // Always calculate alcohol percent
      waterPercent: isValid ? Math.round((waterMass / totalMass) * 100) : 0,
      syrupMass: isValid ? syrupMass : 0,
      infusionMass: isValid ? infusionMass : 0.0,
      alcoholMass: alcoholMassUsed, // Always return the alcohol mass
      waterMass: isValid ? waterMass : 0,
      totalCost: isValid ? totalCost : alcoholCost, // Only include alcohol cost if invalid
    };
  };

  useEffect(() => {
    const newResult = calculateMix();
    setResult(newResult);

    // Track calculator usage once per session when user changes parameters
    if (newResult.isValid && !hasTrackedCalculation.current) {
      hasTrackedCalculation.current = true;
      posthog.capture("calculator_used", {
        target_brix: params.targetBrix,
        target_alcohol: params.targetAlcohol,
        total_mass: params.totalMass,
        advanced_options_enabled: advancedOptions,
      });
    }
  }, [params, prices, advancedOptions]);

  const handleParamChange = (paramName: keyof Params, value: number) => {
    if (paramName === "alcoholMass") {
      setManualAlcoholInput(true);
    }

    // If changing target values, reset manual flag
    if (paramName === "targetBrix" || paramName === "targetAlcohol") {
      setManualAlcoholInput(false);
    }

    setParams((prev) => ({ ...prev, [paramName]: Number(value) }));
  };

  const handlePriceChange = (priceName: keyof Prices, value: number) => {
    setPrices((prev) => ({ ...prev, [priceName]: Number(value) }));
  };

  const handleAdvancedOptionsToggle = () => {
    setAdvancedOptions((prev) => !prev);
    toast("Options Avancées Activées");
  };

  const sendEmailLink = () => {
    const subject = "Résultats du Calcul";
    let body =
      `Voici les résultats de votre calcul:\n\n` +
      `Sirop: ${result.syrup}\n` +
      `Infusion: ${result.infusion}\n` +
      `Alcool Pur (96%): ${result.alcohol}\n` +
      `Eau: ${result.water}\n`;
    if (advancedOptions) {
      body += `\nCoût Total: ${result.totalCost.toFixed(2)}€\n`;
      body += `\nPrix des Ingrédients par Kilogramme:\n`;
      body += `Sirop: ${prices.syrupPerKg.toFixed(2)}€/kg\n`;
      body += `Infusion: ${prices.infusionPerKg.toFixed(2)}€/kg\n`;
      body += `Alcool Pur: ${prices.alcoholPerKg.toFixed(2)}€/kg\n`;
      body += `Eau: ${prices.waterPerKg.toFixed(2)}€/kg\n`;
    }
    body +=
      `\nParamètres:\n` +
      `Brix du Sirop: ${params.syrupBrix}\n` +
      `Brix de l'Infusion: ${params.infusionBrix}\n` +
      `Alcool de l'Infusion: ${params.infusionAlcohol}\n` +
      `Masse d'Alcool Pur: ${params.alcoholMass} g\n` +
      `Brix Cible: ${params.targetBrix}\n` +
      `Alcool Cible: ${params.targetAlcohol}\n` +
      `Masse Totale: ${params.totalMass} g`;
    if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    } else {
      toast("Veuillez entrer une adresse e-mail valide.");
    }
  };

  useEffect(() => {
    if (sendEmail) {
      sendEmailLink();
      setSendEmail(false);
    }
  }, [sendEmail]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={advancedOptions}
            onCheckedChange={handleAdvancedOptionsToggle}
          />
          Options avancées
        </Label>
      </div>
      <div>
        {/* Fix: Ensure the Tabs container takes full width and the content expands properly */}
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="mb-6 w-full grid grid-cols-3">
            <TabsTrigger value="ingredients">Ingrédients</TabsTrigger>
            <TabsTrigger value="targets">Ratio Cible</TabsTrigger>
            <TabsTrigger value="explanations">Infos</TabsTrigger>
          </TabsList>

          {/* Fix: Added w-full to ensure each TabsContent takes the full width */}
          <TabsContent value="ingredients" className="space-y-6 w-full">
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between w-full">
                <Label htmlFor="syrupBrix" className="text-sm font-medium">
                  Concentration du Sirop (°Bx)
                </Label>
                <EditableBadge
                  value={params.syrupBrix}
                  onChange={(value) => handleParamChange("syrupBrix", value)}
                  suffix="°Bx"
                />
              </div>
              <Slider
                id="syrupBrix"
                min={0}
                max={100}
                step={1}
                value={[params.syrupBrix]}
                onValueChange={(value: number[]) =>
                  handleParamChange("syrupBrix", value[0])
                }
                className="cursor-pointer w-full"
              />
            </div>
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between w-full">
                <Label htmlFor="infusionBrix" className="text-sm font-medium">
                  Concentration de l'Infusion (°Bx)
                </Label>
                <EditableBadge
                  value={params.infusionBrix}
                  onChange={(value) => handleParamChange("infusionBrix", value)}
                  suffix="°Bx"
                />
              </div>
              <Slider
                id="infusionBrix"
                min={0}
                max={100}
                step={1}
                value={[params.infusionBrix]}
                onValueChange={(value: number[]) =>
                  handleParamChange("infusionBrix", value[0])
                }
                className="cursor-pointer w-full"
              />
            </div>
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between w-full">
                <Label
                  htmlFor="infusionAlcohol"
                  className="text-sm font-medium"
                >
                  Alcool de l'Infusion (%)
                </Label>
                <EditableBadge
                  value={params.infusionAlcohol}
                  onChange={(value) =>
                    handleParamChange("infusionAlcohol", value)
                  }
                  suffix="%"
                />
              </div>
              <Slider
                id="infusionAlcohol"
                min={0}
                max={100}
                step={1}
                value={[params.infusionAlcohol]}
                onValueChange={(value: number[]) =>
                  handleParamChange("infusionAlcohol", value[0])
                }
                className="cursor-pointer w-full"
              />
            </div>
          </TabsContent>

          {/* Fix: Added w-full to all TabsContent components */}
          <TabsContent value="targets" className="space-y-6 w-full">
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between w-full">
                <Label htmlFor="targetBrix" className="text-sm font-medium">
                  Concentration Cible (°Bx)
                </Label>
                <EditableBadge
                  value={params.targetBrix}
                  onChange={(value) => handleParamChange("targetBrix", value)}
                  suffix="°Bx"
                />
              </div>
              <Slider
                id="targetBrix"
                min={0}
                max={100}
                step={1}
                value={[params.targetBrix]}
                onValueChange={(value: number[]) =>
                  handleParamChange("targetBrix", value[0])
                }
                className="cursor-pointer w-full"
              />
            </div>
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between w-full">
                <Label htmlFor="targetAlcohol" className="text-sm font-medium">
                  Alcool Cible (%)
                </Label>
                <EditableBadge
                  value={params.targetAlcohol}
                  onChange={(value) =>
                    handleParamChange("targetAlcohol", value)
                  }
                  suffix="%"
                />
              </div>
              <Slider
                id="targetAlcohol"
                min={0}
                max={100}
                step={1}
                value={[params.targetAlcohol]}
                onValueChange={(value: number[]) =>
                  handleParamChange("targetAlcohol", value[0])
                }
                className="cursor-pointer w-full"
              />
            </div>
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between w-full">
                <Label htmlFor="alcoholMass" className="text-sm font-medium">
                  Masse d'Alcool Pur (96%) (g)
                </Label>
                <EditableBadge
                  value={params.alcoholMass}
                  onChange={(value) => handleParamChange("alcoholMass", value)}
                  suffix=" g"
                  max={params.totalMass}
                />
              </div>
              <Slider
                id="alcoholMass"
                min={0}
                max={params.totalMass / 2} // Limit to half the total mass as a reasonable maximum
                step={1}
                value={[params.alcoholMass]}
                onValueChange={(value: number[]) =>
                  handleParamChange("alcoholMass", value[0])
                }
                className="cursor-pointer w-full"
              />
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="totalMass" className="text-sm font-medium">
                Masse Totale (g)
              </Label>
              <Input
                id="totalMass"
                type="number"
                value={params.totalMass}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleParamChange("totalMass", Number(e.target.value))
                }
                className="w-full"
              />
            </div>
          </TabsContent>

          <TabsContent value="explanations" className="space-y-6 w-full">
            <h4 className="text-lg font-medium">{t("explanationsTitle")}</h4>
            <p>{t("explanationsIntro")}</p>
            <p>{t("explanationsBrix")}</p>
            <p>{t("explanationsUnits")}</p>
            <p>{t("explanationsAlcohol")}</p>
            {advancedOptions && (
              <div className="mt-4 p-4 bg-muted rounded-md border">
                <h5 className="text-md font-medium mb-2">{t("advancedOptionsTitle")}</h5>
                <p className="text-muted-foreground">
                  {t("advancedOptionsDesc")}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <Separator className="my-6" />
        <div className="relative">
          <h3 className="text-lg font-medium">Résultats de la Formulation</h3>
          <p>
            Cible: {params.totalMass} g de préparation à {params.targetBrix}
            °Bx et {params.targetAlcohol}%
            {params.alcoholMass > 0 &&
              ` (avec ${params.alcoholMass} g d'alcool pur à 96%)`}
          </p>
          <div className="relative mt-4">
            {/* Bars representing ingredient percentages - always visible */}
            <div className="flex mb-2 rounded-md overflow-hidden h-6">
              <div
                className="bg-amber-500 transition-all"
                style={{ width: `${result.syrupPercent}%` }}
              ></div>
              <div
                className="bg-violet-500 transition-all"
                style={{ width: `${result.infusionPercent}%` }}
              ></div>
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${result.alcoholPercent}%` }}
              ></div>
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${result.waterPercent}%` }}
              ></div>
            </div>
            {!result.isValid && (
              <div className="text-center py-2">
                <p className="text-destructive font-medium text-sm">
                  Aucune solution valide possible avec ces paramètres
                </p>
              </div>
            )}
            {/* Ingredients section with relative positioning for the error overlay */}
            <div className="relative">
              {/* Ingredient values that get blurred */}
              <div
                className={`grid grid-cols-2 gap-3 mt-4 transition-all duration-300 ${
                  !result.isValid ? "blur-sm opacity-50" : ""
                }`}
              >
                <div className="p-3 rounded-md border bg-card border-l-4 border-l-amber-500">
                  <div className="text-xs uppercase font-medium text-muted-foreground">Sirop</div>
                  <div className="text-lg font-semibold font-mono mt-1">
                    {result.syrup}
                  </div>
                  {advancedOptions && (
                    <div className="mt-2">
                      <PriceBadge
                        value={prices.syrupPerKg}
                        onChange={(value) =>
                          handlePriceChange("syrupPerKg", value)
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-md border bg-card border-l-4 border-l-violet-500">
                  <div className="text-xs uppercase font-medium text-muted-foreground">
                    Infusion
                  </div>
                  <div className="text-lg font-semibold font-mono mt-1">
                    {result.infusion}
                  </div>
                  {advancedOptions && (
                    <div className="mt-2">
                      <PriceBadge
                        value={prices.infusionPerKg}
                        onChange={(value) =>
                          handlePriceChange("infusionPerKg", value)
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-md border bg-card border-l-4 border-l-red-500">
                  <div className="text-xs uppercase font-medium text-muted-foreground">Alcool</div>
                  <div className="text-lg font-semibold font-mono mt-1">
                    {result.alcohol}
                  </div>
                  {advancedOptions && (
                    <div className="mt-2">
                      <PriceBadge
                        value={prices.alcoholPerKg}
                        onChange={(value) =>
                          handlePriceChange("alcoholPerKg", value)
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-md border bg-card border-l-4 border-l-blue-500">
                  <div className="text-xs uppercase font-medium text-muted-foreground">Eau</div>
                  <div className="text-lg font-semibold font-mono mt-1">
                    {result.water}
                  </div>
                  {advancedOptions && (
                    <div className="mt-2">
                      <PriceBadge
                        value={prices.waterPerKg}
                        onChange={(value) =>
                          handlePriceChange("waterPerKg", value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Total Cost Display - only visible with advanced options */}
            {advancedOptions && (
              <div className="mt-4 p-3 rounded-md border bg-card border-l-4 border-l-green-500">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Coût Total</span>
                  <span className="text-lg font-semibold font-mono">
                    {result.totalCost.toFixed(2)}€ / kg
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        {advancedOptions && (
          <div className="space-y-4 mt-4">
            <Label htmlFor="email" className="text-sm font-medium">
              Entrez votre e-mail pour envoyer les résultats :
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre e-mail"
              className="w-full"
            />
            <Button onClick={() => setSendEmail(true)} variant="outline">
              Envoyer par E-mail
            </Button>
          </div>
        )}
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={() => {
            setParams({
              syrupBrix: 67,
              infusionBrix: 24,
              infusionAlcohol: 55,
              alcoholMass: 0,
              targetBrix: 34,
              targetAlcohol: 19,
              totalMass: 1000,
            });
            setPrices({
              syrupPerKg: 5.5,
              infusionPerKg: 12.75,
              alcoholPerKg: 20.0,
              waterPerKg: 0.2,
            });
            setManualAlcoholInput(false); // Reset the manual flag
          }}
          variant="outline"
          className="text-sm"
        >
          Réinitialiser aux valeurs d'exemple
        </Button>
      </div>
    </div>
  );
};
export default FlavoringCalculator;
