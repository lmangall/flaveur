import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth-server";
import { sql } from "@/lib/db";
import { MAX_FILE_SIZE_BYTES } from "@/constants/workspace";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authenticate user
        const userId = await getUserId();

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
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          tokenPayload: JSON.stringify({
            userId,
            workspaceId,
          }),
        };
      },
      // Document record is created client-side after upload completes
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
