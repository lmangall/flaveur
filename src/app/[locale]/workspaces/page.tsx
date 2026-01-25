"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/[locale]/components/ui/accordion";
import { PlusCircle, Users, Crown, Pencil, Eye, FileText, Beaker, UserPlus, Shield } from "lucide-react";
import { getMyWorkspaces } from "@/actions/workspaces";
import type { Workspace } from "@/app/type";
import type { WorkspaceRoleValue } from "@/constants";

type WorkspaceWithRole = Workspace & {
  role: WorkspaceRoleValue;
  member_count: number;
};

function WorkspaceCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-24" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-24 ml-auto" />
      </CardFooter>
    </Card>
  );
}

function getRoleBadge(role: WorkspaceRoleValue) {
  switch (role) {
    case "owner":
      return (
        <Badge className="bg-amber-100 text-amber-800">
          <Crown className="h-3 w-3 mr-1" />
          Owner
        </Badge>
      );
    case "editor":
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Pencil className="h-3 w-3 mr-1" />
          Editor
        </Badge>
      );
    case "viewer":
      return (
        <Badge variant="secondary">
          <Eye className="h-3 w-3 mr-1" />
          Viewer
        </Badge>
      );
  }
}

function WorkspaceCard({ workspace }: { workspace: WorkspaceWithRole }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            <Link
              href={`/workspaces/${workspace.workspace_id}`}
              className="hover:underline"
            >
              {workspace.name}
            </Link>
          </CardTitle>
          {getRoleBadge(workspace.role)}
        </div>
        {workspace.description && (
          <CardDescription className="line-clamp-2">
            {workspace.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          {workspace.member_count} member
          {workspace.member_count !== 1 ? "s" : ""}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="ghost" size="sm" asChild className="ml-auto">
          <Link href={`/workspaces/${workspace.workspace_id}`}>
            Open Workspace
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function WorkspacesPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const t = useTranslations("Workspaces");
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/");
      return;
    }

    async function fetchWorkspaces() {
      try {
        const data = await getMyWorkspaces();
        setWorkspaces(data);
      } catch (err) {
        console.error("Failed to fetch workspaces:", err);
        setError(
          err instanceof Error ? err.message : t("errorLoading")
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaces();
  }, [isLoaded, isSignedIn, router, t]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <Button onClick={() => router.push("/workspaces/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("newWorkspace")}
        </Button>
      </div>

      {/* Explanation accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-are-workspaces" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-base font-medium">
              <Users className="h-5 w-5 text-primary" />
              {t("whatAreWorkspaces")}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <p className="text-muted-foreground">
                {t("workspacesDescription")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span className="text-sm">{t("featureDocuments")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Beaker className="h-4 w-4 mt-0.5 text-green-500" />
                  <span className="text-sm">{t("featureFlavors")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <UserPlus className="h-4 w-4 mt-0.5 text-purple-500" />
                  <span className="text-sm">{t("featureMembers")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-amber-500" />
                  <span className="text-sm">{t("featureRoles")}</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {error ? (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
          <p className="font-medium">{t("errorLoading")}</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <WorkspaceCardSkeleton />
          <WorkspaceCardSkeleton />
          <WorkspaceCardSkeleton />
        </div>
      ) : workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.workspace_id} workspace={workspace} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            {t("noWorkspacesYet")}
          </p>
          <Button onClick={() => router.push("/workspaces/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("createFirstWorkspace")}
          </Button>
        </Card>
      )}
    </div>
  );
}
