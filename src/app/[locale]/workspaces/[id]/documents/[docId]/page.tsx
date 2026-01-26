"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Card, CardContent } from "@/app/[locale]/components/ui/card";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Table,
  Image as ImageIcon,
  Pencil,
  Eye,
  File,
  FileType,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { getDocumentById, updateDocument } from "@/actions/documents";
import { getUserWorkspaceRole } from "@/actions/workspaces";
import { MarkdownEditor } from "@/app/[locale]/components/markdown-editor";
import { CSVEditor } from "@/app/[locale]/components/csv-editor";
import type { WorkspaceDocument } from "@/app/type";
import type { WorkspaceRoleValue } from "@/constants";
import { cn } from "@/app/lib/utils";

function getDocumentIcon(type: string) {
  switch (type) {
    case "image":
      return <ImageIcon className="h-5 w-5" />;
    case "csv":
      return <Table className="h-5 w-5" />;
    case "markdown":
      return <FileText className="h-5 w-5" />;
    case "pdf":
      return <FileType className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
}

function getDocumentTypeLabel(type: string): string {
  switch (type) {
    case "image":
      return "Image";
    case "csv":
      return "Spreadsheet";
    case "markdown":
      return "Document";
    case "pdf":
      return "PDF";
    default:
      return "File";
  }
}

function getDocumentTypeStyle(type: string) {
  switch (type) {
    case "image":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
    case "csv":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
    case "markdown":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "pdf":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session;
  const isLoaded = !isPending;

  const workspaceId = Number(params.id);
  const documentId = Number(params.docId);

  const [document, setDocument] = useState<WorkspaceDocument | null>(null);
  const [role, setRole] = useState<WorkspaceRoleValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editedName, setEditedName] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [imageZoom, setImageZoom] = useState(100);

  const canEdit = role === "owner" || role === "editor";
  const isEditable = document?.type === "markdown" || document?.type === "csv";

  const loadDocument = useCallback(async () => {
    try {
      const [doc, userRole] = await Promise.all([
        getDocumentById(documentId),
        getUserWorkspaceRole(workspaceId),
      ]);

      if (!doc) {
        setError("Document not found or you don't have access");
        return;
      }

      setDocument(doc);
      setRole(userRole);
      setEditedName(doc.name);
      setEditedContent(doc.content || "");
    } catch (err) {
      console.error("Failed to load document:", err);
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setIsLoading(false);
    }
  }, [documentId, workspaceId]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/");
      return;
    }
    loadDocument();
  }, [isLoaded, isSignedIn, router, loadDocument]);

  const handleSave = async () => {
    if (!document) return;

    setIsSaving(true);
    try {
      const updated = await updateDocument({
        documentId: document.document_id,
        name: editedName !== document.name ? editedName : undefined,
        content:
          isEditable && editedContent !== document.content
            ? editedContent
            : undefined,
      });

      setDocument(updated);
      setHasChanges(false);
      toast.success("Document saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (content: string) => {
    setEditedContent(content);
    setHasChanges(content !== document?.content || editedName !== document?.name);
  };

  const handleNameChange = (name: string) => {
    setEditedName(name);
    setHasChanges(name !== document?.name || editedContent !== document?.content);
  };

  const handleDownload = () => {
    if (document?.url) {
      window.open(document.url, "_blank");
    }
  };

  const handleOpenExternal = () => {
    if (document?.url) {
      // Use Google Docs viewer for PDFs and other documents
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`;
      window.open(viewerUrl, "_blank");
    }
  };

  if (!isLoaded || !isSignedIn) return null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/workspaces/${workspaceId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workspace
        </Button>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error || "Document not found"}</p>
          <Button
            onClick={() => router.push(`/workspaces/${workspaceId}`)}
            className="mt-4"
          >
            Go to Workspace
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/workspaces/${workspaceId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", getDocumentTypeStyle(document.type).replace("text-", "bg-").split(" ")[0] + "/20")}>
              {getDocumentIcon(document.type)}
            </div>
            <div>
              {canEdit && isEditable ? (
                <Input
                  value={editedName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="text-xl font-semibold border-none shadow-none px-0 h-auto bg-transparent focus-visible:ring-0"
                />
              ) : (
                <h1 className="text-xl font-semibold">{document.name}</h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={cn("text-xs border-0", getDocumentTypeStyle(document.type))}>
                  {getDocumentTypeLabel(document.type)}
                </Badge>
                {document.file_size && (
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(document.file_size)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          {isEditable && (
            <Badge variant="outline" className="gap-1">
              {canEdit ? (
                <>
                  <Pencil className="h-3 w-3" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  View
                </>
              )}
            </Badge>
          )}
          {canEdit && hasChanges && (
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          )}
          {document.url && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="min-h-[500px]">
        {/* Image Viewer */}
        {document.type === "image" && document.url && (
          <div className="space-y-3">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImageZoom(Math.max(25, imageZoom - 25))}
                disabled={imageZoom <= 25}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12 text-center">
                {imageZoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImageZoom(Math.min(200, imageZoom + 25))}
                disabled={imageZoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-xl border overflow-auto bg-muted/20 p-4">
              <img
                src={document.url}
                alt={document.name}
                className="mx-auto rounded-lg shadow-sm transition-transform"
                style={{ width: `${imageZoom}%`, maxWidth: "none" }}
              />
            </div>
          </div>
        )}

        {/* Markdown Editor */}
        {document.type === "markdown" && (
          <MarkdownEditor
            value={editedContent}
            onChange={handleContentChange}
            editable={canEdit}
            placeholder="Start writing your document..."
            minHeight="min-h-[500px]"
            className="rounded-xl"
          />
        )}

        {/* CSV Editor */}
        {document.type === "csv" && (
          <CSVEditor
            value={editedContent}
            onChange={handleContentChange}
            editable={canEdit}
          />
        )}

        {/* PDF Viewer */}
        {document.type === "pdf" && document.url && (
          <div className="space-y-3">
            <div className="flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in new tab
              </Button>
            </div>
            <div className="rounded-xl border overflow-hidden bg-muted/20">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`}
                className="w-full h-[700px]"
                title={document.name}
              />
            </div>
          </div>
        )}

        {/* Generic File Viewer */}
        {document.type === "file" && document.url && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                <File className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{document.name}</h3>
                {document.mime_type && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {document.mime_type}
                  </p>
                )}
                {document.file_size && (
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(document.file_size)}
                  </p>
                )}
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={handleOpenExternal}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Try to preview
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Metadata Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <p>
          Updated{" "}
          {new Date(document.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {document.mime_type && document.type !== "file" && (
          <p className="text-xs">{document.mime_type}</p>
        )}
      </div>
    </div>
  );
}
