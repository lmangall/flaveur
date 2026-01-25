"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { del } from "@vercel/blob";
import type { WorkspaceDocument } from "@/app/type";
import type { DocumentTypeValue } from "@/constants";
import { canEditInWorkspace, getUserWorkspaceRole } from "./workspaces";

// ===========================================
// DOCUMENT CRUD
// ===========================================

/**
 * Get all documents in a workspace.
 */
export async function getWorkspaceDocuments(
  workspaceId: number
): Promise<WorkspaceDocument[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify membership
  const role = await getUserWorkspaceRole(workspaceId);
  if (!role) {
    throw new Error("Workspace not found or you are not a member");
  }

  const documents = await sql`
    SELECT * FROM workspace_document
    WHERE workspace_id = ${workspaceId}
    ORDER BY updated_at DESC
  `;

  return documents.map((d) => ({
    document_id: Number(d.document_id),
    workspace_id: Number(d.workspace_id),
    name: String(d.name),
    description: d.description ? String(d.description) : null,
    type: String(d.type) as DocumentTypeValue,
    content: d.content ? String(d.content) : null,
    url: d.url ? String(d.url) : null,
    file_size: d.file_size ? Number(d.file_size) : null,
    mime_type: d.mime_type ? String(d.mime_type) : null,
    created_by: d.created_by ? String(d.created_by) : null,
    created_at: String(d.created_at),
    updated_at: String(d.updated_at),
  }));
}

/**
 * Get a single document by ID.
 */
export async function getDocumentById(
  documentId: number
): Promise<WorkspaceDocument | null> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const result = await sql`
    SELECT * FROM workspace_document
    WHERE document_id = ${documentId}
  `;

  if (result.length === 0) return null;

  const d = result[0];

  // Verify membership
  const role = await getUserWorkspaceRole(Number(d.workspace_id));
  if (!role) {
    throw new Error("Access denied");
  }

  return {
    document_id: Number(d.document_id),
    workspace_id: Number(d.workspace_id),
    name: String(d.name),
    description: d.description ? String(d.description) : null,
    type: String(d.type) as DocumentTypeValue,
    content: d.content ? String(d.content) : null,
    url: d.url ? String(d.url) : null,
    file_size: d.file_size ? Number(d.file_size) : null,
    mime_type: d.mime_type ? String(d.mime_type) : null,
    created_by: d.created_by ? String(d.created_by) : null,
    created_at: String(d.created_at),
    updated_at: String(d.updated_at),
  };
}

/**
 * Create a markdown or CSV document.
 */
export async function createTextDocument(data: {
  workspaceId: number;
  name: string;
  description?: string;
  type: "markdown" | "csv";
  content: string;
}): Promise<WorkspaceDocument> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { workspaceId, name, description, type, content } = data;

  // Verify edit permission
  const canEdit = await canEditInWorkspace(workspaceId);
  if (!canEdit) {
    throw new Error("You don't have permission to create documents");
  }

  const result = await sql`
    INSERT INTO workspace_document (
      workspace_id, name, description, type, content, created_by
    )
    VALUES (
      ${workspaceId}, ${name.trim()}, ${description?.trim() || null},
      ${type}, ${content}, ${userId}
    )
    RETURNING *
  `;

  const d = result[0];
  return {
    document_id: Number(d.document_id),
    workspace_id: Number(d.workspace_id),
    name: String(d.name),
    description: d.description ? String(d.description) : null,
    type: String(d.type) as DocumentTypeValue,
    content: d.content ? String(d.content) : null,
    url: null,
    file_size: null,
    mime_type: null,
    created_by: d.created_by ? String(d.created_by) : null,
    created_at: String(d.created_at),
    updated_at: String(d.updated_at),
  };
}

/**
 * Create a file document (after Vercel Blob upload).
 * Works for images, PDFs, and any other file type.
 */
export async function createFileDocument(data: {
  workspaceId: number;
  name: string;
  description?: string;
  url: string;
  fileSize?: number;
  mimeType: string;
  type: DocumentTypeValue;
}): Promise<WorkspaceDocument> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { workspaceId, name, description, url, fileSize, mimeType, type } = data;

  // Verify edit permission
  const canEdit = await canEditInWorkspace(workspaceId);
  if (!canEdit) {
    throw new Error("You don't have permission to upload documents");
  }

  const result = await sql`
    INSERT INTO workspace_document (
      workspace_id, name, description, type, url, file_size, mime_type, created_by
    )
    VALUES (
      ${workspaceId}, ${name.trim()}, ${description?.trim() || null},
      ${type}, ${url}, ${fileSize || null}, ${mimeType}, ${userId}
    )
    RETURNING *
  `;

  const d = result[0];
  return {
    document_id: Number(d.document_id),
    workspace_id: Number(d.workspace_id),
    name: String(d.name),
    description: d.description ? String(d.description) : null,
    type: String(d.type) as DocumentTypeValue,
    content: null,
    url: String(d.url),
    file_size: d.file_size ? Number(d.file_size) : null,
    mime_type: String(d.mime_type),
    created_by: d.created_by ? String(d.created_by) : null,
    created_at: String(d.created_at),
    updated_at: String(d.updated_at),
  };
}

/**
 * @deprecated Use createFileDocument instead
 */
export async function createImageDocument(data: {
  workspaceId: number;
  name: string;
  description?: string;
  url: string;
  fileSize: number;
  mimeType: string;
}): Promise<WorkspaceDocument> {
  return createFileDocument({ ...data, type: "image" });
}

/**
 * Update document metadata and/or content.
 */
export async function updateDocument(data: {
  documentId: number;
  name?: string;
  description?: string;
  content?: string;
}): Promise<WorkspaceDocument> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { documentId, name, description, content } = data;

  // Get document and verify workspace membership
  const docResult = await sql`
    SELECT * FROM workspace_document
    WHERE document_id = ${documentId}
  `;

  if (docResult.length === 0) {
    throw new Error("Document not found");
  }

  const doc = docResult[0];

  // Verify edit permission
  const canEdit = await canEditInWorkspace(Number(doc.workspace_id));
  if (!canEdit) {
    throw new Error("You don't have permission to edit this document");
  }

  // Don't allow content update for image documents
  if (doc.type === "image" && content !== undefined) {
    throw new Error("Cannot update content for image documents");
  }

  const result = await sql`
    UPDATE workspace_document
    SET
      name = COALESCE(${name?.trim()}, name),
      description = COALESCE(${description?.trim()}, description),
      content = COALESCE(${content}, content),
      updated_at = NOW()
    WHERE document_id = ${documentId}
    RETURNING *
  `;

  const d = result[0];
  return {
    document_id: Number(d.document_id),
    workspace_id: Number(d.workspace_id),
    name: String(d.name),
    description: d.description ? String(d.description) : null,
    type: String(d.type) as DocumentTypeValue,
    content: d.content ? String(d.content) : null,
    url: d.url ? String(d.url) : null,
    file_size: d.file_size ? Number(d.file_size) : null,
    mime_type: d.mime_type ? String(d.mime_type) : null,
    created_by: d.created_by ? String(d.created_by) : null,
    created_at: String(d.created_at),
    updated_at: String(d.updated_at),
  };
}

/**
 * Delete a document. For images, also deletes the blob.
 */
export async function deleteDocument(documentId: number): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get document
  const docResult = await sql`
    SELECT * FROM workspace_document
    WHERE document_id = ${documentId}
  `;

  if (docResult.length === 0) {
    throw new Error("Document not found");
  }

  const doc = docResult[0];

  // Verify edit permission
  const canEdit = await canEditInWorkspace(Number(doc.workspace_id));
  if (!canEdit) {
    throw new Error("You don't have permission to delete this document");
  }

  // Delete blob if it's an image
  if (doc.type === "image" && doc.url) {
    try {
      await del(doc.url);
    } catch (error) {
      console.error("[deleteDocument] Failed to delete blob:", error);
      // Continue with database deletion even if blob deletion fails
    }
  }

  await sql`
    DELETE FROM workspace_document WHERE document_id = ${documentId}
  `;
}

/**
 * Get documents by type in a workspace.
 */
export async function getWorkspaceDocumentsByType(
  workspaceId: number,
  type: DocumentTypeValue
): Promise<WorkspaceDocument[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify membership
  const role = await getUserWorkspaceRole(workspaceId);
  if (!role) {
    throw new Error("Workspace not found or you are not a member");
  }

  const documents = await sql`
    SELECT * FROM workspace_document
    WHERE workspace_id = ${workspaceId} AND type = ${type}
    ORDER BY updated_at DESC
  `;

  return documents.map((d) => ({
    document_id: Number(d.document_id),
    workspace_id: Number(d.workspace_id),
    name: String(d.name),
    description: d.description ? String(d.description) : null,
    type: String(d.type) as DocumentTypeValue,
    content: d.content ? String(d.content) : null,
    url: d.url ? String(d.url) : null,
    file_size: d.file_size ? Number(d.file_size) : null,
    mime_type: d.mime_type ? String(d.mime_type) : null,
    created_by: d.created_by ? String(d.created_by) : null,
    created_at: String(d.created_at),
    updated_at: String(d.updated_at),
  }));
}
