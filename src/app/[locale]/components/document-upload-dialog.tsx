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
  ArrowLeft,
  Plus,
  FileUp,
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
import { MAX_IMAGE_SIZE_MB } from "@/constants/workspace";
import { cn } from "@/app/lib/utils";

type DocumentType = "image" | "markdown" | "csv";
type ActionMode = "upload" | "create";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number;
  onDocumentCreated: () => void;
}

const documentTypes = [
  {
    type: "image" as const,
    label: "Image",
    description: "JPG, PNG, GIF, WebP",
    icon: Image,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    hoverBg: "hover:bg-purple-100 dark:hover:bg-purple-950/60",
    border: "border-purple-200 dark:border-purple-800",
    uploadOnly: true,
  },
  {
    type: "markdown" as const,
    label: "Document",
    description: "Rich text with formatting",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    hoverBg: "hover:bg-blue-100 dark:hover:bg-blue-950/60",
    border: "border-blue-200 dark:border-blue-800",
    uploadOnly: false,
  },
  {
    type: "csv" as const,
    label: "Spreadsheet",
    description: "Tables and data",
    icon: Table,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    hoverBg: "hover:bg-emerald-100 dark:hover:bg-emerald-950/60",
    border: "border-emerald-200 dark:border-emerald-800",
    uploadOnly: false,
  },
];

export function DocumentUploadDialog({
  open,
  onOpenChange,
  workspaceId,
  onDocumentCreated,
}: DocumentUploadDialogProps) {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [actionMode, setActionMode] = useState<ActionMode | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const selectedConfig = documentTypes.find((d) => d.type === selectedType);

  const resetForm = () => {
    setSelectedType(null);
    setActionMode(null);
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

  const goBack = () => {
    if (actionMode) {
      setActionMode(null);
      setName("");
      setDescription("");
    } else {
      setSelectedType(null);
    }
  };

  // Handle image upload to Vercel Blob
  const onImageDrop = useCallback(
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

  // Handle text file upload (CSV/Markdown)
  const onTextFileDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0 || !selectedType) return;

      const file = acceptedFiles[0];
      setIsUploading(true);

      try {
        const content = await file.text();
        const fileName = file.name.replace(/\.(md|csv)$/i, "");

        await createTextDocument({
          workspaceId,
          name: fileName,
          type: selectedType,
          content,
        });

        toast.success(
          `${selectedType === "markdown" ? "Document" : "Spreadsheet"} uploaded successfully`
        );
        onDocumentCreated();
        handleOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload file"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [workspaceId, selectedType, onDocumentCreated]
  );

  const imageDropzone = useDropzone({
    onDrop: onImageDrop,
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

  const textFileDropzone = useDropzone({
    onDrop: onTextFileDrop,
    accept:
      selectedType === "markdown"
        ? { "text/markdown": [".md", ".markdown"] }
        : { "text/csv": [".csv"] },
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

  const renderDropzone = (
    dropzone: ReturnType<typeof useDropzone>,
    fileTypes: string,
    maxSize?: string
  ) => (
    <div
      {...dropzone.getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
        dropzone.isDragActive && "border-primary bg-primary/5 scale-[1.02]",
        isUploading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...dropzone.getInputProps()} />
      {isUploading ? (
        <div className="space-y-3">
          <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Uploading... {uploadProgress > 0 ? `${uploadProgress}%` : ""}
          </p>
          {uploadProgress > 0 && (
            <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      ) : dropzone.isDragActive ? (
        <div className="space-y-2">
          <Upload className="h-10 w-10 mx-auto text-primary" />
          <p className="text-sm font-medium text-primary">Drop your file here</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={cn(
              "mx-auto w-14 h-14 rounded-full flex items-center justify-center",
              selectedConfig?.bg
            )}
          >
            <Upload className={cn("h-6 w-6", selectedConfig?.color)} />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {fileTypes}
              {maxSize && ` • Max ${maxSize}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(selectedType || actionMode) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 -ml-2"
                onClick={goBack}
                disabled={isUploading}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {!selectedType
              ? "Add Document"
              : actionMode === "create"
                ? `New ${selectedConfig?.label}`
                : actionMode === "upload"
                  ? `Upload ${selectedConfig?.label}`
                  : selectedConfig?.label}
          </DialogTitle>
          <DialogDescription>
            {!selectedType
              ? "Choose the type of document to add"
              : !actionMode && !selectedConfig?.uploadOnly
                ? "Upload a file or create from scratch"
                : actionMode === "create"
                  ? `Create a new ${selectedType === "markdown" ? "document" : "spreadsheet"}`
                  : `Upload a ${selectedType === "markdown" ? ".md" : selectedType === "csv" ? ".csv" : ""} file`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {/* Step 1: Choose document type */}
          {!selectedType && (
            <div className="grid gap-3">
              {documentTypes.map((docType) => (
                <button
                  key={docType.type}
                  onClick={() => {
                    setSelectedType(docType.type);
                    if (docType.uploadOnly) {
                      setActionMode("upload");
                    }
                  }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                    docType.bg,
                    docType.border,
                    docType.hoverBg
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center bg-white/80 dark:bg-black/20"
                    )}
                  >
                    <docType.icon className={cn("h-6 w-6", docType.color)} />
                  </div>
                  <div>
                    <p className="font-medium">{docType.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {docType.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Choose action (upload or create) - for non-image types */}
          {selectedType && !actionMode && !selectedConfig?.uploadOnly && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActionMode("upload")}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border transition-all",
                  selectedConfig?.bg,
                  selectedConfig?.border,
                  selectedConfig?.hoverBg
                )}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/80 dark:bg-black/20">
                  <FileUp className={cn("h-6 w-6", selectedConfig?.color)} />
                </div>
                <div className="text-center">
                  <p className="font-medium">Upload File</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedType === "markdown" ? ".md file" : ".csv file"}
                  </p>
                </div>
              </button>
              <button
                onClick={() => setActionMode("create")}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border transition-all",
                  selectedConfig?.bg,
                  selectedConfig?.border,
                  selectedConfig?.hoverBg
                )}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/80 dark:bg-black/20">
                  <Plus className={cn("h-6 w-6", selectedConfig?.color)} />
                </div>
                <div className="text-center">
                  <p className="font-medium">Create New</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start from scratch
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Image upload dropzone */}
          {selectedType === "image" && actionMode === "upload" && (
            <div className="space-y-4">
              {renderDropzone(
                imageDropzone,
                "JPG, PNG, GIF, WebP",
                `${MAX_IMAGE_SIZE_MB}MB`
              )}
            </div>
          )}

          {/* Text file upload dropzone */}
          {selectedType &&
            selectedType !== "image" &&
            actionMode === "upload" && (
              <div className="space-y-4">
                {renderDropzone(
                  textFileDropzone,
                  selectedType === "markdown"
                    ? "Markdown (.md) files"
                    : "CSV (.csv) files"
                )}
              </div>
            )}

          {/* Create new document form */}
          {selectedType &&
            selectedType !== "image" &&
            actionMode === "create" && (
              <div className="space-y-4">
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
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-description">
                    Description{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
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
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          {actionMode === "create" && (
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
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
