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
] as const;

export type DocumentTypeValue = (typeof DOCUMENT_TYPE_OPTIONS)[number]["value"];

export const isValidDocumentType = (value: string): value is DocumentTypeValue =>
  DOCUMENT_TYPE_OPTIONS.some((d) => d.value === value);

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
export const MAX_IMAGE_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5MB for Vercel Blob
export const MAX_IMAGE_SIZE_MB = 4.5;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const isAllowedImageType = (mimeType: string): mimeType is AllowedImageType =>
  ALLOWED_IMAGE_TYPES.includes(mimeType as AllowedImageType);

// Default values
export const DEFAULT_WORKSPACE_ROLE: WorkspaceRoleValue = "viewer";
export const DEFAULT_INVITE_STATUS: WorkspaceInviteStatusValue = "pending";
