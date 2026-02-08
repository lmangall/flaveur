"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  Loader2,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/[locale]/components/ui/dialog";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { toast } from "sonner";
import { extractFormulationFromImage } from "@/actions/vision-extract";
import type { VisionExtractionResult } from "@/types/vision-extract";
import { cn } from "@/lib/utils";

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtractionComplete: (result: VisionExtractionResult) => void;
}

const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
  onExtractionComplete,
}: PhotoUploadDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<VisionExtractionResult | null>(null);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setExtractionResult(null);

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);

      // Call vision API
      const result = await extractFormulationFromImage(base64, file.type);

      setExtractionResult(result);

      if (result.success) {
        toast.success(`Extracted ${result.ingredients.length} ingredients`);
      } else {
        toast.error(result.error || "Extraction failed");
      }
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error("Failed to process image");
      setExtractionResult({
        success: false,
        metadata: { studentName: null, formulaName: null, formulationDate: null },
        ingredients: [],
        confidence: "low",
        warnings: [],
        error: "Failed to process image",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    await processImage(file);
  }, []);

  const dropzone = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxSize: MAX_IMAGE_SIZE_BYTES,
    multiple: false,
    disabled: isProcessing,
    onDropRejected: (rejections) => {
      const rejection = rejections[0];
      if (rejection?.errors[0]?.code === "file-too-large") {
        toast.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`);
      } else {
        toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
      }
    },
  });

  const handleConfirm = () => {
    if (extractionResult?.success) {
      onExtractionComplete(extractionResult);
      onOpenChange(false);
      resetState();
    }
  };

  const handleRetry = async () => {
    if (selectedFile) {
      await processImage(selectedFile);
    }
  };

  const resetState = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setExtractionResult(null);
  };

  const handleClose = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetState();
    }
  };

  const confidenceBadge = extractionResult?.confidence && (
    <Badge
      variant={
        extractionResult.confidence === "high"
          ? "default"
          : extractionResult.confidence === "medium"
            ? "secondary"
            : "destructive"
      }
      className={cn(
        extractionResult.confidence === "high" && "bg-green-500 hover:bg-green-600"
      )}
    >
      {extractionResult.confidence === "high"
        ? "High confidence"
        : extractionResult.confidence === "medium"
          ? "Medium confidence"
          : "Low confidence"}
    </Badge>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Import from Photo
          </DialogTitle>
          <DialogDescription>
            Take a photo or upload an image of your formulation sheet. The AI will extract
            the ingredients and fill the table automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone or Preview */}
          {!imagePreview ? (
            <div
              {...dropzone.getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                dropzone.isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <input {...dropzone.getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Drag photo here or click to upload</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports JPEG, PNG, WebP (max {MAX_IMAGE_SIZE_MB}MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Formulation sheet preview"
                className={cn(
                  "w-full h-48 object-contain rounded-lg bg-muted",
                  isProcessing && "opacity-50"
                )}
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 bg-background/80 rounded-lg p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm font-medium">Analyzing formulation...</span>
                  </div>
                </div>
              )}
              {!isProcessing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={resetState}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Results */}
          {extractionResult && !isProcessing && (
            <div
              className={cn(
                "rounded-lg border p-4",
                extractionResult.success ? "border-green-500/50 bg-green-50/50" : "border-red-500/50 bg-red-50/50"
              )}
            >
              {extractionResult.success ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Extraction successful</span>
                    {confidenceBadge}
                  </div>

                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Ingredients found:</span>{" "}
                      <strong>{extractionResult.ingredients.length}</strong>
                    </p>
                    {extractionResult.metadata.formulaName && (
                      <p>
                        <span className="text-muted-foreground">Formula:</span>{" "}
                        <strong>{extractionResult.metadata.formulaName}</strong>
                      </p>
                    )}
                    {extractionResult.metadata.studentName && (
                      <p>
                        <span className="text-muted-foreground">Student:</span>{" "}
                        {extractionResult.metadata.studentName}
                      </p>
                    )}
                  </div>

                  {extractionResult.warnings.length > 0 && (
                    <div className="flex items-start gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Warnings:</p>
                        <ul className="list-disc list-inside">
                          {extractionResult.warnings.slice(0, 3).map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                          {extractionResult.warnings.length > 3 && (
                            <li>+{extractionResult.warnings.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{extractionResult.error || "Extraction failed"}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {extractionResult && !extractionResult.success && selectedFile && (
              <Button variant="outline" onClick={handleRetry} disabled={isProcessing}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            {extractionResult?.success && (
              <Button onClick={handleConfirm}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Use Extracted Data
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
