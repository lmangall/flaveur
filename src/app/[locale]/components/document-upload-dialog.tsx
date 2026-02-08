"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { upload } from "@vercel/blob/client";
import {
  FileText,
  Table,
  Loader2,
  Upload,
  ArrowLeft,
  Plus,
  FileUp,
  File,
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
import { createTextDocument, createFileDocument } from "@/actions/documents";
import { MAX_FILE_SIZE_MB, getDocumentTypeFromMime } from "@/constants/workspace";
import { cn } from "@/lib/utils";

type ActionType = "upload" | "create-doc" | "create-csv";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number;
  onDocumentCreated: () => void;
}

const actionOptions = [
  {
    type: "upload" as const,
    label: "Upload File",
    description: "Images, PDFs, documents, spreadsheets, and more",
    icon: FileUp,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    hoverBg: "hover:bg-violet-100 dark:hover:bg-violet-950/60",
    border: "border-violet-200 dark:border-violet-800",
  },
  {
    type: "create-doc" as const,
    label: "New Document",
    description: "Create a rich text document",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    hoverBg: "hover:bg-blue-100 dark:hover:bg-blue-950/60",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    type: "create-csv" as const,
    label: "New Spreadsheet",
    description: "Create a data table",
    icon: Table,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    hoverBg: "hover:bg-emerald-100 dark:hover:bg-emerald-950/60",
    border: "border-emerald-200 dark:border-emerald-800",
  },
];

export function DocumentUploadDialog({
  open,
  onOpenChange,
  workspaceId,
  onDocumentCreated,
}: DocumentUploadDialogProps) {
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const selectedConfig = actionOptions.find((a) => a.type === actionType);

  const resetForm = () => {
    setActionType(null);
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
    setActionType(null);
    setName("");
    setDescription("");
  };

  // Handle file upload to Vercel Blob
  const onFileDrop = useCallback(
    async (acceptedFiles: globalThis.File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Upload to Vercel Blob
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/workspace/upload",
          clientPayload: JSON.stringify({ workspaceId }),
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round(progress.percentage));
          },
        });

        // Create document record in database
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const mimeType = file.type || "application/octet-stream";
        const docType = getDocumentTypeFromMime(mimeType);

        await createFileDocument({
          workspaceId,
          name: fileName,
          url: blob.url,
          fileSize: file.size,
          mimeType,
          type: docType,
        });

        toast.success("File uploaded successfully");
        onDocumentCreated();
        handleOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload file"
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [workspaceId, onDocumentCreated]
  );

  const fileDropzone = useDropzone({
    onDrop: onFileDrop,
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    multiple: false,
    disabled: isUploading,
  });

  const handleCreateDocument = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const type = actionType === "create-doc" ? "markdown" : "csv";

    setIsUploading(true);
    try {
      const initialContent =
        type === "markdown"
          ? "# New Document\n\nStart writing here..."
          : "Column 1,Column 2,Column 3\nValue 1,Value 2,Value 3";

      await createTextDocument({
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        content: initialContent,
      });

      toast.success(
        `${type === "markdown" ? "Document" : "Spreadsheet"} created successfully`
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

  const getDialogTitle = () => {
    if (!actionType) return "Add Document";
    if (actionType === "upload") return "Upload File";
    if (actionType === "create-doc") return "New Document";
    return "New Spreadsheet";
  };

  const getDialogDescription = () => {
    if (!actionType) return "Upload a file or create a new document";
    if (actionType === "upload") return `Upload any file up to ${MAX_FILE_SIZE_MB}MB`;
    if (actionType === "create-doc") return "Create a rich text document with formatting";
    return "Create a data table with rows and columns";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {actionType && (
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
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {/* Step 1: Choose action */}
          {!actionType && (
            <div className="grid gap-3">
              {actionOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setActionType(option.type)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                    option.bg,
                    option.border,
                    option.hoverBg
                  )}
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/80 dark:bg-black/20">
                    <option.icon className={cn("h-6 w-6", option.color)} />
                  </div>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* File upload dropzone */}
          {actionType === "upload" && (
            <div
              {...fileDropzone.getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                fileDropzone.isDragActive && "border-primary bg-primary/5 scale-[1.02]",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...fileDropzone.getInputProps()} />
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
              ) : fileDropzone.isDragActive ? (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-primary" />
                  <p className="text-sm font-medium text-primary">
                    Drop your file here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className={cn(
                      "mx-auto w-14 h-14 rounded-full flex items-center justify-center",
                      selectedConfig?.bg
                    )}
                  >
                    <File className={cn("h-6 w-6", selectedConfig?.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Drag and drop or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Any file type • Max {MAX_FILE_SIZE_MB}MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create document/spreadsheet form */}
          {(actionType === "create-doc" || actionType === "create-csv") && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">Name</Label>
                <Input
                  id="doc-name"
                  placeholder={
                    actionType === "create-doc" ? "My Document" : "My Spreadsheet"
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
                  placeholder="A brief description"
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
          {(actionType === "create-doc" || actionType === "create-csv") && (
            <Button
              onClick={handleCreateDocument}
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
