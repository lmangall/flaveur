"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  Award,
  Users,
  Linkedin,
  Instagram,
  Twitter,
  Github,
  Globe,
  ExternalLink,
  ArrowLeft,
  Settings,
  Calendar,
} from "lucide-react";

import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/[locale]/components/ui/avatar";

import { getUserProfile, type ProfileWithLinks } from "@/actions/profile";
import {
  PROFILE_TYPE_OPTIONS,
  YEARS_OF_EXPERIENCE_OPTIONS,
  FIELD_OF_STUDY_OPTIONS,
} from "@/constants";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const t = useTranslations("Profile");
  const locale = useLocale();
  const { data: session } = useSession();

  const [profile, setProfile] = useState<ProfileWithLinks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const profileData = await getUserProfile(userId);
        if (!profileData) {
          setNotFound(true);
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "linkedin": return <Linkedin className="h-5 w-5" />;
      case "instagram": return <Instagram className="h-5 w-5" />;
      case "twitter": return <Twitter className="h-5 w-5" />;
      case "github": return <Github className="h-5 w-5" />;
      case "website": return <Globe className="h-5 w-5" />;
      default: return <ExternalLink className="h-5 w-5" />;
    }
  };

  const getProfileTypeLabel = (type: string | null) => {
    if (!type) return null;
    const option = PROFILE_TYPE_OPTIONS.find((o) => o.value === type);
    return option ? t(`profileType_${option.value}`) : type;
  };

  const getExperienceLabel = (exp: string | null) => {
    if (!exp) return null;
    const option = YEARS_OF_EXPERIENCE_OPTIONS.find((o) => o.value === exp);
    return option ? option.label : exp;
  };

  const getFieldOfStudyLabel = (field: string | null) => {
    if (!field) return null;
    const option = FIELD_OF_STUDY_OPTIONS.find((o) => o.value === field);
    return option ? t(`fieldOfStudy_${option.value}`) : field;
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">{t("profileNotFound")}</h2>
            <p className="text-muted-foreground mb-4">{t("profileNotFoundDescription")}</p>
            <Link href={`/${locale}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("goBack")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        {isOwnProfile && (
          <Link href={`/${locale}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {t("editProfile")}
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar - Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.image || undefined} alt={profile?.username || ""} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile?.username)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h1 className="text-xl font-bold">{profile?.username}</h1>
                {profile?.job_title && (
                  <p className="text-muted-foreground">{profile.job_title}</p>
                )}
              </div>

              {profile?.profile_type && (
                <Badge variant="secondary">
                  {getProfileTypeLabel(profile.profile_type)}
                </Badge>
              )}

              {profile?.open_to_opportunities && (
                <Badge variant="default" className="bg-green-500">
                  {t("openToOpportunities")}
                </Badge>
              )}

              {/* Location */}
              {profile?.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}

              {/* Organization */}
              {profile?.organization && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  {profile.organization}
                </div>
              )}

              {/* Social Links */}
              {profile?.social_links && profile.social_links.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 pt-4 border-t w-full">
                  {profile.social_links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      title={link.platform}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          {profile?.bio && (
            <Card>
              <CardHeader>
                <CardTitle>{t("about")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Professional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {t("professionalInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Experience */}
              {profile?.years_of_experience && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">{t("experience")}: </span>
                    <span className="text-sm text-muted-foreground">
                      {getExperienceLabel(profile.years_of_experience)}
                    </span>
                  </div>
                </div>
              )}

              {/* Field of Study */}
              {profile?.field_of_study && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">{t("fieldOfStudy")}: </span>
                    <span className="text-sm text-muted-foreground">
                      {getFieldOfStudyLabel(profile.field_of_study)}
                    </span>
                  </div>
                </div>
              )}

              {/* Specializations */}
              {profile?.specializations && profile.specializations.length > 0 && (
                <div>
                  <span className="text-sm font-medium block mb-2">{t("specializations")}</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map((spec) => (
                      <Badge key={spec} variant="outline">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {profile?.certifications && profile.certifications.length > 0 && (
                <div>
                  <span className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4" />
                    {t("certifications")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Memberships */}
              {profile?.professional_memberships && profile.professional_memberships.length > 0 && (
                <div>
                  <span className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    {t("memberships")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {profile.professional_memberships.map((membership) => (
                      <Badge key={membership} variant="outline">
                        {membership}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state if no professional info */}
              {!profile?.years_of_experience &&
                !profile?.field_of_study &&
                (!profile?.specializations || profile.specializations.length === 0) &&
                (!profile?.certifications || profile.certifications.length === 0) &&
                (!profile?.professional_memberships || profile.professional_memberships.length === 0) && (
                  <p className="text-sm text-muted-foreground">{t("noInfoYet")}</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
