import { getSession } from "@/lib/auth-server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Share2, LogIn } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { getInviteByToken, acceptInvite } from "@/actions/shares";

interface Props {
  searchParams: Promise<{ token?: string }>;
  params: Promise<{ locale: string }>;
}

export default async function InvitePage({ searchParams, params }: Props) {
  const { token } = await searchParams;
  const { locale } = await params;
  const t = await getTranslations("Sharing");
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
  const invite = await getInviteByToken(token);

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
          <Link href={`/${locale}/flavours/${invite.flavour_id}`}>
            <Button>{t("viewFlavour")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // User is logged in - try to accept the invite
  if (userId) {
    let acceptResult: { flavourId: number } | null = null;
    let acceptError: string | null = null;

    try {
      acceptResult = await acceptInvite(token);
    } catch (error) {
      // Handle error - might be wrong email, own flavour, etc.
      acceptError = error instanceof Error ? error.message : "Unknown error";
    }

    // If successful, redirect (must be outside try-catch since redirect throws)
    if (acceptResult) {
      redirect(`/${locale}/flavours/${acceptResult.flavourId}?welcome=true`);
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
    ? `https://accounts.oumamie.xyz/sign-up?redirect_url=${encodeURIComponent(`https://oumamie.xyz/${locale}/invite?token=${token}`)}`
    : `/${locale}/auth/sign-up?redirect_url=${encodeURIComponent(`/${locale}/invite?token=${token}`)}`;

  const signInUrl = process.env.NODE_ENV === "production"
    ? `https://accounts.oumamie.xyz/sign-in?redirect_url=${encodeURIComponent(`https://oumamie.xyz/${locale}/invite?token=${token}`)}`
    : `/${locale}/auth/sign-in?redirect_url=${encodeURIComponent(`/${locale}/invite?token=${token}`)}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <Share2 className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-4">{t("youreInvited")}</h1>
        <p className="text-muted-foreground mb-2">
          <strong>{invite.inviter_name}</strong> {t("invitedYouToView")}
        </p>
        <p className="text-xl font-semibold mb-6">"{invite.flavour_name}"</p>

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
