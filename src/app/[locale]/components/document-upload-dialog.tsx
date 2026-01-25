"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { upload } from "@vercel/blob/client";
import {
  FileText,
  Image,
  Table,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/[locale]/components/ui/dialog";
import { Input } from "@/app/[locale]/components/ui/input";
import { Label } from "@/app/[locale]/components/ui/label";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { toast } from "sonner";
import { createTextDocument } from "@/actions/documents";
import {
  MAX_IMAGE_SIZE_MB,
  ALLOWED_IMAGE_TYPES,
} from "@/constants/workspace";
import { cn } from "@/app/lib/utils";

type DocumentType = "image" | "markdown" | "csv";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number;
  onDocumentCreated: () => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  workspaceId,
  onDocumentCreated,
}: DocumentUploadDialogProps) {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetForm = () => {
    setSelectedType(null);
    setName("");
    setDescription("");
    setUploadProgress(0);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);
      setUploadProgress(0);

      try {
        await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/workspace/upload",
          clientPayload: JSON.stringify({ workspaceId }),
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round(progress.percentage));
          },
        });

        toast.success("Image uploaded successfully");
        onDocumentCreated();
        handleOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload image"
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [workspaceId, onDocumentCreated]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
    },
    maxSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
    multiple: false,
    disabled: isUploading,
  });

  const handleCreateTextDocument = async () => {
    if (!name.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    if (!selectedType || selectedType === "image") return;

    setIsUploading(true);
    try {
      const initialContent =
        selectedType === "markdown"
          ? "# New Document\n\nStart writing here..."
          : "Column 1,Column 2,Column 3\nValue 1,Value 2,Value 3";

      await createTextDocument({
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        type: selectedType,
        content: initialContent,
      });

      toast.success(
        `${selectedType === "markdown" ? "Document" : "Spreadsheet"} created successfully`
      );
      onDocumentCreated();
      handleOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create document"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const documentTypes = [
    {
      type: "image" as const,
      label: "Image",
      description: "Upload an image file (JPG, PNG, GIF, WebP)",
      icon: Image,
    },
    {
      type: "markdown" as const,
      label: "Document",
      description: "Create a rich text document with formatting",
      icon: FileText,
    },
    {
      type: "csv" as const,
      label: "Spreadsheet",
      description: "Create a data table with rows and columns",
      icon: Table,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Upload an image or create a new document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedType ? (
            <div className="grid grid-cols-3 gap-3">
              {documentTypes.map((docType) => (
                <button
                  key={docType.type}
                  onClick={() => setSelectedType(docType.type)}
                  className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted transition-colors"
                >
                  <docType.icon className="h-8 w-8 text-muted-foreground" />
                  <span className="font-medium text-sm">{docType.label}</span>
                </button>
              ))}
            </div>
          ) : selectedType === "image" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  <span className="font-medium">Upload Image</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedType(null)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>

              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive && "border-primary bg-primary/5",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : isDragActive ? (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-sm text-primary">Drop your image here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop an image, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max {MAX_IMAGE_SIZE_MB}MB - JPG, PNG, GIF, WebP
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedType === "markdown" ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <Table className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {selectedType === "markdown"
                      ? "Create Document"
                      : "Create Spreadsheet"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedType(null)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="doc-name">Name</Label>
                  <Input
                    id="doc-name"
                    placeholder={
                      selectedType === "markdown"
                        ? "My Document"
                        : "My Spreadsheet"
                    }
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-description">
                    Description{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="doc-description"
                    placeholder="A brief description of this document"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isUploading}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          {selectedType && selectedType !== "image" && (
            <Button
              onClick={handleCreateTextDocument}
              disabled={isUploading || !name.trim()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
