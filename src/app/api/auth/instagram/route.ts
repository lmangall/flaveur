import { NextResponse } from "next/server";

/**
 * Instagram OAuth initiation
 * Redirects user to Instagram authorization page
 */
export async function GET() {
  const clientId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Instagram OAuth not configured. Set INSTAGRAM_APP_ID and INSTAGRAM_REDIRECT_URI." },
      { status: 500 }
    );
  }

  // Instagram Graph API OAuth URL
  // Scopes for posting: instagram_basic, instagram_content_publish, pages_read_engagement
  const scopes = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_read_engagement",
    "pages_show_list",
  ].join(",");

  const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(authUrl.toString());
}
