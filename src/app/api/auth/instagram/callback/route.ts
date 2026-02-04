import { NextRequest, NextResponse } from "next/server";

/**
 * Instagram OAuth callback
 * Exchanges authorization code for access tokens
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    return NextResponse.json(
      { error, errorReason, errorDescription },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "No authorization code received" },
      { status: 400 }
    );
  }

  const clientId = process.env.INSTAGRAM_APP_ID;
  const clientSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Instagram OAuth not configured" },
      { status: 500 }
    );
  }

  try {
    // Step 1: Exchange code for short-lived access token
    const tokenResponse = await fetch(
      "https://graph.facebook.com/v21.0/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.json(
        { error: "Token exchange failed", details: tokenData.error },
        { status: 400 }
      );
    }

    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: clientId,
          client_secret: clientSecret,
          fb_exchange_token: shortLivedToken,
        })
    );

    const longLivedData = await longLivedResponse.json();

    if (longLivedData.error) {
      return NextResponse.json(
        { error: "Long-lived token exchange failed", details: longLivedData.error },
        { status: 400 }
      );
    }

    const longLivedToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in; // seconds (usually ~60 days)

    // Step 3: Get Facebook Pages the user manages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${longLivedToken}`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      return NextResponse.json(
        { error: "Failed to get pages", details: pagesData.error },
        { status: 400 }
      );
    }

    // Step 4: Get Instagram Business Account ID for each page
    const pagesWithInstagram = await Promise.all(
      (pagesData.data || []).map(async (page: { id: string; name: string; access_token: string }) => {
        const igResponse = await fetch(
          `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${longLivedToken}`
        );
        const igData = await igResponse.json();

        return {
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          instagramBusinessAccountId: igData.instagram_business_account?.id || null,
        };
      })
    );

    // Filter to pages with Instagram connected
    const instagramAccounts = pagesWithInstagram.filter(
      (p) => p.instagramBusinessAccountId
    );

    // Return all the info needed for curl posting
    return NextResponse.json({
      success: true,
      message: "OAuth complete! Save these values for posting via curl.",
      longLivedToken,
      expiresInDays: Math.round(expiresIn / 86400),
      instagramAccounts,
      curlExample: instagramAccounts[0]
        ? `# Step 1: Create media container
curl -X POST "https://graph.facebook.com/v21.0/${instagramAccounts[0].instagramBusinessAccountId}/media" \\
  -d "image_url=YOUR_IMAGE_URL" \\
  -d "caption=Your caption here" \\
  -d "access_token=${longLivedToken}"

# Step 2: Publish the container (use creation_id from step 1)
curl -X POST "https://graph.facebook.com/v21.0/${instagramAccounts[0].instagramBusinessAccountId}/media_publish" \\
  -d "creation_id=CONTAINER_ID_FROM_STEP_1" \\
  -d "access_token=${longLivedToken}"`
        : "No Instagram Business Account found. Make sure your Instagram is connected to a Facebook Page.",
    });
  } catch (err) {
    console.error("Instagram OAuth error:", err);
    return NextResponse.json(
      { error: "OAuth flow failed", details: String(err) },
      { status: 500 }
    );
  }
}
