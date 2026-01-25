"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Table,
  Image as ImageIcon,
  Pencil,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { getDocumentById, updateDocument } from "@/actions/documents";
import { getUserWorkspaceRole } from "@/actions/workspaces";
import { MarkdownEditor } from "@/app/[locale]/components/markdown-editor";
import { CSVEditor } from "@/app/[locale]/components/csv-editor";
import type { WorkspaceDocument } from "@/app/type";
import type { WorkspaceRoleValue } from "@/constants";

function getDocumentIcon(type: string) {
  switch (type) {
    case "image":
      return <ImageIcon className="h-5 w-5" />;
    case "csv":
      return <Table className="h-5 w-5" />;
    case "markdown":
      return <FileText className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

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

  const canEdit = role === "owner" || role === "editor";

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
          document.type !== "image" && editedContent !== document.content
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

  if (!isLoaded || !isSignedIn) return null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
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
        <div className="rounded-lg border p-8 text-center">
          <p className="text-red-600">{error || "Document not found"}</p>
          <Button
            onClick={() => router.push(`/workspaces/${workspaceId}`)}
            className="mt-4"
          >
            Go to Workspace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/workspaces/${workspaceId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {getDocumentIcon(document.type)}
            {canEdit ? (
              <Input
                value={editedName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="text-lg font-semibold border-none shadow-none px-1 h-auto"
              />
            ) : (
              <h1 className="text-xl font-semibold">{document.name}</h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {canEdit ? (
              <>
                <Pencil className="h-3 w-3" />
                Edit mode
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                View only
              </>
            )}
          </Badge>
          {canEdit && hasChanges && (
            <Button onClick={handleSave} disabled={isSaving}>
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
        </div>
      </div>

      {/* Document Content */}
      <div className="min-h-[500px]">
        {document.type === "image" && document.url && (
          <div className="rounded-lg border overflow-hidden bg-muted/20">
            <img
              src={document.url}
              alt={document.name}
              className="max-w-full h-auto mx-auto"
            />
          </div>
        )}

        {document.type === "markdown" && (
          <MarkdownEditor
            value={editedContent}
            onChange={handleContentChange}
            editable={canEdit}
            placeholder="Start writing your document..."
            minHeight="min-h-[500px]"
          />
        )}

        {document.type === "csv" && (
          <CSVEditor
            value={editedContent}
            onChange={handleContentChange}
            editable={canEdit}
          />
        )}
      </div>

      {/* Metadata */}
      <div className="text-sm text-muted-foreground border-t pt-4">
        <p>
          Last updated:{" "}
          {new Date(document.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {document.file_size && (
          <p>Size: {(document.file_size / 1024).toFixed(1)} KB</p>
        )}
      </div>
    </div>
  );
}
