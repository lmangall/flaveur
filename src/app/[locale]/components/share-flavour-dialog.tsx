"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Share2, X, Loader2, Mail, Clock } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/[locale]/components/ui/dialog";
import { Input } from "@/app/[locale]/components/ui/input";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { toast } from "sonner";
import {
  shareFlavour,
  revokeShare,
  getFlavourShares,
  type ShareInfo,
  type InviteInfo,
} from "@/actions/shares";
import { useParams } from "next/navigation";

interface ShareFlavourDialogProps {
  flavourId: number;
  flavourName: string;
}

export function ShareFlavourDialog({ flavourId, flavourName }: ShareFlavourDialogProps) {
  const t = useTranslations("Sharing");
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [shares, setShares] = useState<(ShareInfo | InviteInfo)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShares, setIsLoadingShares] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  // Load existing shares when dialog opens
  const loadShares = useCallback(async () => {
    setIsLoadingShares(true);
    try {
      const data = await getFlavourShares(flavourId);
      setShares(data);
    } catch (error) {
      console.error("Error loading shares:", error);
      toast.error(t("loadSharesError"));
    } finally {
      setIsLoadingShares(false);
    }
  }, [flavourId, t]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      loadShares();
      setEmail("");
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const result = await shareFlavour({ flavourId, email: email.trim(), locale });

      if (result.type === "share") {
        // Direct share to existing user
        setShares((prev) => [
          {
            type: "share",
            share_id: result.share.share_id,
            user_id: result.user.user_id,
            email: result.user.email,
            username: result.user.username,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        toast.success(t("shareSuccess"));
      } else {
        // Invite sent to non-user
        setShares((prev) => [
          {
            type: "invite",
            invite_id: result.invite.invite_id,
            email: result.invite.email,
            status: result.invite.status,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        toast.success(t("inviteSent"));
      }
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("shareError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (item: ShareInfo | InviteInfo) => {
    const id = item.type === "share" ? item.share_id : item.invite_id;
    setRevokingId(id);

    try {
      await revokeShare({
        flavourId,
        shareId: item.type === "share" ? item.share_id : undefined,
        inviteId: item.type === "invite" ? item.invite_id : undefined,
      });

      setShares((prev) =>
        prev.filter((s) =>
          s.type === "share"
            ? (s as ShareInfo).share_id !== id
            : (s as InviteInfo).invite_id !== id
        )
      );
      toast.success(item.type === "share" ? t("revokeSuccess") : t("inviteCancelled"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("revokeError"));
    } finally {
      setRevokingId(null);
    }
  };

  const activeShares = shares.filter((s) => s.type === "share") as ShareInfo[];
  const pendingInvites = shares.filter((s) => s.type === "invite") as InviteInfo[];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          {t("share")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("shareTitle")}</DialogTitle>
          <DialogDescription>
            {t("shareDescription", { name: flavourName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email input form */}
          <form onSubmit={handleShare} className="flex gap-2">
            <Input
              type="email"
              placeholder={t("enterEmail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </Button>
          </form>

          {isLoadingShares ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Active shares */}
              {activeShares.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("sharedWith")}</p>
                  <div className="space-y-2">
                    {activeShares.map((share) => (
                      <div
                        key={share.share_id}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm truncate">
                            {share.username || share.email}
                          </p>
                          {share.username && (
                            <p className="text-xs text-muted-foreground truncate">
                              {share.email}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="secondary">{t("viewOnly")}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => handleRevoke(share)}
                            disabled={revokingId === share.share_id}
                          >
                            {revokingId === share.share_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending invites */}
              {pendingInvites.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("pendingInvites")}</p>
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.invite_id}
                        className="flex items-center justify-between p-2 bg-muted/50 border border-dashed rounded-md"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm truncate">{invite.email}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {t("pending")}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => handleRevoke(invite)}
                            disabled={revokingId === invite.invite_id}
                          >
                            {revokingId === invite.invite_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {activeShares.length === 0 && pendingInvites.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("noSharesYet")}
                </p>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
