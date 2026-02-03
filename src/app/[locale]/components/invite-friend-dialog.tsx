"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Share2, Mail, Copy, Check, Loader2, Link2 } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/[locale]/components/ui/dialog";
import { Input } from "@/app/[locale]/components/ui/input";
import { Separator } from "@/app/[locale]/components/ui/separator";
import { toast } from "sonner";
import { createReferral, type ReferralPlatform } from "@/actions/referrals";
import { ReferralStatsCard } from "./referral-stats-card";

// WhatsApp icon (not in lucide-react by default)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Facebook icon
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

interface InviteFriendDialogProps {
  collapsed?: boolean;
}

export function InviteFriendDialog({ collapsed = false }: InviteFriendDialogProps) {
  const t = useTranslations("Invite");

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<ReferralPlatform | null>(null);
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Generate a referral link when dialog opens
  const generateReferralLink = async () => {
    if (referralLink) return;
    setIsGeneratingLink(true);
    try {
      const { shareUrl } = await createReferral("email");
      setReferralLink(shareUrl);
    } catch (error) {
      console.error("Failed to generate referral link:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      generateReferralLink();
    }
  };

  const handleShare = async (platform: ReferralPlatform) => {
    setIsLoading(platform);
    try {
      const { shareUrl, userName } = await createReferral(platform);
      const message = t("inviteMessage", { name: userName });
      const fullMessage = `${message}\n${shareUrl}`;

      switch (platform) {
        case "email": {
          const subject = encodeURIComponent("Join Oumamie");
          const body = encodeURIComponent(fullMessage);
          window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
          break;
        }
        case "whatsapp": {
          const whatsappText = encodeURIComponent(fullMessage);
          window.open(`https://wa.me/?text=${whatsappText}`, "_blank");
          break;
        }
        case "facebook": {
          const fbUrl = encodeURIComponent(shareUrl);
          const fbQuote = encodeURIComponent(message);
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${fbUrl}&quote=${fbQuote}`,
            "_blank",
            "width=600,height=400"
          );
          break;
        }
      }

      toast.success(t("shareStarted"));
    } catch (error) {
      console.error("Error creating referral:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create share link");
    } finally {
      setIsLoading(null);
    }
  };

  const handleCopyLink = async () => {
    setIsLoading("email"); // Reuse loading state
    try {
      const { shareUrl, userName } = await createReferral("email");
      const message = t("inviteMessage", { name: userName });
      const fullText = `${message}\n${shareUrl}`;

      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success(t("linkCopied"));

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
      toast.error("Failed to copy link");
    } finally {
      setIsLoading(null);
    }
  };

  const triggerButton = (
    <Button
      variant="outline"
      size={collapsed ? "icon" : "sm"}
      className={`
        ${collapsed ? "" : "w-full"}
        border-pink-500
        bg-pink-500
        hover:bg-pink-600
        dark:bg-pink-600
        dark:hover:bg-pink-700
        text-white font-medium
        animate-pink-glow
        transition-all duration-300
      `}
    >
      <Share2 className={collapsed ? "h-4 w-4" : "h-4 w-4 mr-2"} />
      {!collapsed && t("inviteFriend")}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("inviteTitle")}</DialogTitle>
          <DialogDescription>{t("inviteDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Your referral link */}
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              {t("yourReferralLink")}
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={isGeneratingLink ? t("generatingLink") : (referralLink || "")}
                className="text-xs font-mono bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                disabled={isLoading !== null || !referralLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          <p className="text-sm font-medium">{t("shareVia")}</p>

          <div className="grid grid-cols-3 gap-3">
            {/* Email */}
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleShare("email")}
              disabled={isLoading !== null}
            >
              {isLoading === "email" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Mail className="h-6 w-6" />
              )}
              <span className="text-xs">{t("email")}</span>
            </Button>

            {/* WhatsApp */}
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleShare("whatsapp")}
              disabled={isLoading !== null}
            >
              {isLoading === "whatsapp" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <WhatsAppIcon className="h-6 w-6" />
              )}
              <span className="text-xs">{t("whatsapp")}</span>
            </Button>

            {/* Facebook */}
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleShare("facebook")}
              disabled={isLoading !== null}
            >
              {isLoading === "facebook" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <FacebookIcon className="h-6 w-6" />
              )}
              <span className="text-xs">{t("facebook")}</span>
            </Button>
          </div>

          <Separator />

          {/* Referral Stats */}
          <ReferralStatsCard />
        </div>
      </DialogContent>
    </Dialog>
  );
}
