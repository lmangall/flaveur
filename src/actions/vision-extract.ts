"use server";

import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import { getUserId } from "@/lib/auth-server";
import { FORMULATION_EXTRACTION_PROMPT } from "@/lib/vision-prompt";
import type { VisionExtractionResult, ExtractedIngredient } from "@/types/vision-extract";

const VALID_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type ValidMimeType = (typeof VALID_MIME_TYPES)[number];

function isValidMimeType(mimeType: string): mimeType is ValidMimeType {
  return VALID_MIME_TYPES.includes(mimeType as ValidMimeType);
}

function createErrorResult(error: string): VisionExtractionResult {
  return {
    success: false,
    metadata: { studentName: null, formulaName: null, formulationDate: null },
    ingredients: [],
    confidence: "low",
    warnings: [],
    error,
  };
}

/**
 * Extract formulation data from an image using Claude's vision capabilities
 *
 * @param imageBase64 - Base64-encoded image data (without data URL prefix)
 * @param mimeType - MIME type of the image (image/jpeg, image/png, image/webp, image/gif)
 * @returns Extraction result with ingredients and metadata
 */
export async function extractFormulationFromImage(
  imageBase64: string,
  mimeType: string
): Promise<VisionExtractionResult> {
  // Verify user is authenticated
  try {
    await getUserId();
  } catch {
    return createErrorResult("Authentication required");
  }

  // Validate input
  if (!imageBase64 || imageBase64.trim().length === 0) {
    return createErrorResult("No image provided");
  }

  if (!isValidMimeType(mimeType)) {
    return createErrorResult(
      `Invalid image type: ${mimeType}. Supported formats: JPEG, PNG, WebP, GIF`
    );
  }

  try {
    // Create data URL from base64 for the AI SDK
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const { text } = await generateText({
      model: gateway("anthropic/claude-sonnet-4-20250514"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: dataUrl,
            },
            {
              type: "text",
              text: FORMULATION_EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    });

    // Parse JSON response - look for JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Vision extraction: No JSON found in response", text);
      return createErrorResult("Failed to parse AI response - no valid JSON found");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Vision extraction: JSON parse error", parseError, jsonMatch[0]);
      return createErrorResult("Failed to parse AI response - invalid JSON");
    }

    // Validate and type the response
    const result = validateExtractionResult(parsed);
    if (!result.success) {
      return createErrorResult(result.error);
    }

    return {
      ...result.data,
      success: true,
    };
  } catch (error) {
    console.error("Vision extraction error:", error);

    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return createErrorResult("AI service not configured. Please contact support.");
      }
      if (error.message.includes("rate limit")) {
        return createErrorResult("Service busy. Please try again in a moment.");
      }
      return createErrorResult(`Extraction failed: ${error.message}`);
    }

    return createErrorResult("Unknown error during extraction");
  }
}

/**
 * Validate and type-check the extraction result from the AI
 */
function validateExtractionResult(
  data: unknown
): { success: true; data: Omit<VisionExtractionResult, "success"> } | { success: false; error: string } {
  if (!data || typeof data !== "object") {
    return { success: false, error: "Invalid response structure" };
  }

  const obj = data as Record<string, unknown>;

  // Validate metadata
  const metadata = obj.metadata as Record<string, unknown> | undefined;
  const validatedMetadata = {
    studentName: typeof metadata?.studentName === "string" ? metadata.studentName : null,
    formulaName: typeof metadata?.formulaName === "string" ? metadata.formulaName : null,
    formulationDate: typeof metadata?.formulationDate === "string" ? metadata.formulationDate : null,
  };

  // Validate ingredients array
  const rawIngredients = obj.ingredients;
  if (!Array.isArray(rawIngredients)) {
    return { success: false, error: "Invalid ingredients format" };
  }

  const ingredients: ExtractedIngredient[] = rawIngredients
    .filter((ing): ing is Record<string, unknown> => ing && typeof ing === "object")
    .map((ing, idx) => ({
      rowNumber: typeof ing.rowNumber === "number" ? ing.rowNumber : idx + 1,
      name: typeof ing.name === "string" ? ing.name : "",
      supplier: typeof ing.supplier === "string" ? ing.supplier : null,
      dilution: typeof ing.dilution === "string" ? ing.dilution : null,
      pricePerKg: typeof ing.pricePerKg === "number" ? ing.pricePerKg : null,
      concentrationA: typeof ing.concentrationA === "number" ? ing.concentrationA : null,
      concentrationB: typeof ing.concentrationB === "number" ? ing.concentrationB : null,
      concentrationC: typeof ing.concentrationC === "number" ? ing.concentrationC : null,
      concentrationD: typeof ing.concentrationD === "number" ? ing.concentrationD : null,
    }))
    .filter((ing) => ing.name.trim().length > 0); // Only keep ingredients with names

  // Validate confidence
  const rawConfidence = obj.confidence;
  const confidence: "high" | "medium" | "low" =
    rawConfidence === "high" || rawConfidence === "medium" || rawConfidence === "low"
      ? rawConfidence
      : "low";

  // Validate warnings
  const rawWarnings = obj.warnings;
  const warnings: string[] = Array.isArray(rawWarnings)
    ? rawWarnings.filter((w): w is string => typeof w === "string")
    : [];

  return {
    success: true,
    data: {
      metadata: validatedMetadata,
      ingredients,
      confidence,
      warnings,
    },
  };
}
