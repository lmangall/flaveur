import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import {
  MAX_FILE_SIZE_BYTES,
  getDocumentTypeFromMime,
} from "@/constants/workspace";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authenticate user
        const { userId } = await auth();
        if (!userId) {
          throw new Error("Unauthorized");
        }

        // Parse workspace ID from client payload
        const workspaceId = clientPayload
          ? JSON.parse(clientPayload).workspaceId
          : null;

        if (!workspaceId) {
          throw new Error("Workspace ID is required");
        }

        // Verify user has edit permission in workspace
        const memberCheck = await sql`
          SELECT role FROM workspace_member
          WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        `;

        if (memberCheck.length === 0) {
          throw new Error("Workspace not found or you are not a member");
        }

        const role = memberCheck[0].role;
        if (role === "viewer") {
          throw new Error("Viewers cannot upload files");
        }

        return {
          // Allow all content types
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          tokenPayload: JSON.stringify({
            userId,
            workspaceId,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Parse the token payload
        const { userId, workspaceId } = JSON.parse(tokenPayload || "{}");

        if (!userId || !workspaceId) {
          console.error("[Upload] Missing userId or workspaceId in token");
          return;
        }

        // Extract filename without extension for document name
        const filename = blob.pathname.split("/").pop() || "Untitled";
        const name = filename.replace(/\.[^/.]+$/, "");

        // Detect mime type and document type
        const mimeType = blob.contentType || "application/octet-stream";
        const documentType = getDocumentTypeFromMime(mimeType);

        // Create document record
        try {
          await sql`
            INSERT INTO workspace_document (
              workspace_id, name, type, url, mime_type, created_by
            )
            VALUES (
              ${workspaceId}, ${name}, ${documentType}, ${blob.url}, ${mimeType}, ${userId}
            )
          `;
          console.log(
            `[Upload] Document created for blob ${blob.url} in workspace ${workspaceId}`
          );
        } catch (error) {
          console.error("[Upload] Failed to create document record:", error);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
