// Workspace domain constants
// Single source of truth for workspace-related enum values

export const WORKSPACE_ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
] as const;

export type WorkspaceRoleValue = (typeof WORKSPACE_ROLE_OPTIONS)[number]["value"];

export const isValidWorkspaceRole = (value: string): value is WorkspaceRoleValue =>
  WORKSPACE_ROLE_OPTIONS.some((r) => r.value === value);

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "image", label: "Image" },
  { value: "csv", label: "Spreadsheet" },
  { value: "markdown", label: "Document" },
  { value: "pdf", label: "PDF" },
  { value: "file", label: "File" },
] as const;

export type DocumentTypeValue = (typeof DOCUMENT_TYPE_OPTIONS)[number]["value"];

export const isValidDocumentType = (value: string): value is DocumentTypeValue =>
  DOCUMENT_TYPE_OPTIONS.some((d) => d.value === value);

// File types that can be visualized in the app
export const VISUALIZABLE_TYPES: DocumentTypeValue[] = ["image", "csv", "markdown", "pdf"];

// File types that can be edited in the app
export const EDITABLE_TYPES: DocumentTypeValue[] = ["csv", "markdown"];

export const WORKSPACE_INVITE_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "expired", label: "Expired" },
] as const;

export type WorkspaceInviteStatusValue =
  (typeof WORKSPACE_INVITE_STATUS_OPTIONS)[number]["value"];

export const isValidWorkspaceInviteStatus = (
  value: string
): value is WorkspaceInviteStatusValue =>
  WORKSPACE_INVITE_STATUS_OPTIONS.some((s) => s.value === value);

// File upload limits
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB for Vercel Blob
export const MAX_FILE_SIZE_MB = 10;

// Legacy - kept for backwards compatibility
export const MAX_IMAGE_SIZE_BYTES = MAX_FILE_SIZE_BYTES;
export const MAX_IMAGE_SIZE_MB = MAX_FILE_SIZE_MB;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const isAllowedImageType = (mimeType: string): mimeType is AllowedImageType =>
  ALLOWED_IMAGE_TYPES.includes(mimeType as AllowedImageType);

// Map MIME types to document types
export function getDocumentTypeFromMime(mimeType: string): DocumentTypeValue {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "text/csv" || mimeType === "application/csv") return "csv";
  if (mimeType === "text/markdown" || mimeType === "text/x-markdown") return "markdown";
  return "file";
}

// Default values
export const DEFAULT_WORKSPACE_ROLE: WorkspaceRoleValue = "viewer";
export const DEFAULT_INVITE_STATUS: WorkspaceInviteStatusValue = "pending";
