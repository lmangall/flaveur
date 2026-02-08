import { getSession } from "@/lib/auth-server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Users, LogIn } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { sql } from "@/lib/db";
import { acceptWorkspaceInvite } from "@/actions/workspaces";

interface Props {
  searchParams: Promise<{ token?: string }>;
  params: Promise<{ locale: string }>;
}

async function getWorkspaceInviteByToken(token: string) {
  const result = await sql`
    SELECT
      wi.invite_id,
      wi.workspace_id,
      wi.invited_email,
      wi.role,
      wi.status,
      w.name as workspace_name,
      u.username as inviter_name,
      u.email as inviter_email
    FROM workspace_invite wi
    JOIN workspace w ON wi.workspace_id = w.workspace_id
    JOIN users u ON wi.invited_by_user_id = u.user_id
    WHERE wi.invite_token = ${token}
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    invite_id: Number(row.invite_id),
    workspace_id: Number(row.workspace_id),
    invited_email: String(row.invited_email),
    role: String(row.role),
    status: String(row.status),
    workspace_name: String(row.workspace_name),
    inviter_name: row.inviter_name ? String(row.inviter_name) : String(row.inviter_email),
  };
}

export default async function WorkspaceInvitePage({ searchParams, params }: Props) {
  const { token } = await searchParams;
  const { locale } = await params;
  const t = await getTranslations("WorkspaceInvite");
  const session = await getSession();
  const userId = session?.user?.id;

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t("invalidInvite")}</h1>
          <p className="text-muted-foreground mb-6">{t("invalidInviteDescription")}</p>
          <Link href={`/${locale}`}>
            <Button>{t("backToHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get invite details
  const invite = await getWorkspaceInviteByToken(token);

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t("inviteNotFound")}</h1>
          <p className="text-muted-foreground mb-6">{t("inviteNotFoundDescription")}</p>
          <Link href={`/${locale}`}>
            <Button>{t("backToHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Invite already accepted
  if (invite.status === "accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t("inviteAlreadyAccepted")}</h1>
          <p className="text-muted-foreground mb-6">{t("inviteAlreadyAcceptedDescription")}</p>
          <Link href={`/${locale}/workspaces/${invite.workspace_id}`}>
            <Button>{t("viewWorkspace")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // User is logged in - try to accept the invite
  if (userId) {
    let acceptResult: { workspaceId: number } | null = null;
    let acceptError: string | null = null;

    try {
      acceptResult = await acceptWorkspaceInvite(token);
    } catch (error) {
      acceptError = error instanceof Error ? error.message : "Unknown error";
    }

    // If successful, redirect
    if (acceptResult) {
      redirect(`/${locale}/workspaces/${acceptResult.workspaceId}?welcome=true`);
    }

    // Show error page
    if (acceptError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6 flex justify-center">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">{t("inviteError")}</h1>
            <p className="text-muted-foreground mb-6">{acceptError}</p>
            <Link href={`/${locale}/dashboard`}>
              <Button>{t("goToDashboard")}</Button>
            </Link>
          </div>
        </div>
      );
    }
  }

  // User is not logged in - show invite info and sign-up button
  const signUpUrl = process.env.NODE_ENV === "production"
    ? `https://accounts.oumamie.xyz/sign-up?redirect_url=${encodeURIComponent(`https://oumamie.xyz/${locale}/invite/workspace?token=${token}`)}`
    : `/${locale}/auth/sign-up?redirect_url=${encodeURIComponent(`/${locale}/invite/workspace?token=${token}`)}`;

  const signInUrl = process.env.NODE_ENV === "production"
    ? `https://accounts.oumamie.xyz/sign-in?redirect_url=${encodeURIComponent(`https://oumamie.xyz/${locale}/invite/workspace?token=${token}`)}`
    : `/${locale}/auth/sign-in?redirect_url=${encodeURIComponent(`/${locale}/invite/workspace?token=${token}`)}`;

  const roleLabel = locale === "fr"
    ? (invite.role === "editor" ? "éditeur" : "observateur")
    : invite.role;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <Users className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-4">{t("youreInvited")}</h1>
        <p className="text-muted-foreground mb-2">
          <strong>{invite.inviter_name}</strong> {t("invitedYouToJoin")}
        </p>
        <p className="text-xl font-semibold mb-2">"{invite.workspace_name}"</p>
        <p className="text-sm text-muted-foreground mb-6">
          {t("asRole", { role: roleLabel })}
        </p>

        <div className="bg-muted rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            {t("signUpToAccess")}
          </p>
        </div>

        <div className="space-y-3">
          <Link href={signUpUrl} className="block">
            <Button className="w-full" size="lg">
              {t("createAccount")}
            </Button>
          </Link>
          <Link href={signInUrl} className="block">
            <Button variant="outline" className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              {t("signInExisting")}
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          {t("inviteSentTo")} <strong>{invite.invited_email}</strong>
        </p>
      </div>
    </div>
  );
}
