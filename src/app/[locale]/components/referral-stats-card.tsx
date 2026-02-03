"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Gift, Users, Star, Trophy, Sparkles, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { getUserReferralStats, getUserReferrals, type ReferralInfo, type ReferralStats } from "@/actions/referrals";
import { cn } from "@/app/lib/utils";

interface ReferralStatsCardProps {
  compact?: boolean;
}

export function ReferralStatsCard({ compact = false }: ReferralStatsCardProps) {
  const t = useTranslations("Invite");

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsData, referralsData] = await Promise.all([
          getUserReferralStats(),
          getUserReferrals(),
        ]);
        setStats(statsData);
        setReferrals(referralsData);
      } catch (error) {
        console.error("Failed to load referral stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return compact ? (
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    ) : (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const conversions = stats?.total_conversions || 0;
  const invites = stats?.total_referrals || 0;

  // Determine achievement level
  const getLevel = () => {
    if (conversions >= 10) return { level: 3, name: t("levelChampion"), icon: Trophy, color: "text-yellow-500" };
    if (conversions >= 5) return { level: 2, name: t("levelAdvocate"), icon: Star, color: "text-purple-500" };
    if (conversions >= 1) return { level: 1, name: t("levelStarter"), icon: Sparkles, color: "text-blue-500" };
    return { level: 0, name: t("levelNewcomer"), icon: Gift, color: "text-muted-foreground" };
  };

  const level = getLevel();
  const LevelIcon = level.icon;

  // Get encouraging message based on stats
  const getMessage = () => {
    if (conversions >= 10) return t("messageChampion");
    if (conversions >= 5) return t("messageAdvocate");
    if (conversions >= 1) return t("messageStarter", { count: conversions });
    if (invites >= 1) return t("messagePending");
    return t("messageStart");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <LevelIcon className={cn("h-4 w-4", level.color)} />
        <span className="text-muted-foreground">
          {conversions > 0 ? (
            t("compactStats", { friends: conversions })
          ) : (
            t("compactNoStats")
          )}
        </span>
      </div>
    );
  }

  const recentReferrals = referrals.slice(0, 5);

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LevelIcon className={cn("h-5 w-5", level.color)} />
            <CardTitle className="text-base">{t("yourImpact")}</CardTitle>
          </div>
          <Badge variant="outline" className={level.color}>
            {level.name}
          </Badge>
        </div>
        <CardDescription className="text-xs">{getMessage()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{invites}</div>
            <div className="text-xs text-muted-foreground">{t("invitesSent")}</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{conversions}</div>
            <div className="text-xs text-muted-foreground">{t("friendsJoined")}</div>
          </div>
        </div>

        {/* Future Benefits */}
        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-start gap-2">
            <Gift className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                {t("futureBenefitsTitle")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("futureBenefitsDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        {referrals.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <Users className="h-3 w-3" />
              {t("referralHistory")}
              {showHistory ? (
                <ChevronUp className="h-3 w-3 ml-auto" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-auto" />
              )}
            </button>

            {showHistory && (
              <div className="mt-2 space-y-2">
                {recentReferrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded"
                  >
                    <div className="flex items-center gap-2">
                      {ref.referred_user ? (
                        <>
                          <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Users className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="truncate max-w-[120px]">
                            {ref.referred_user.name || ref.referred_user.email || t("anonymousUser")}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className="text-muted-foreground">{t("pendingInvite")}</span>
                        </>
                      )}
                    </div>
                    <Badge variant={ref.referred_user ? "default" : "secondary"} className="text-[10px]">
                      {ref.platform}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
