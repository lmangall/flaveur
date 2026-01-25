"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/[locale]/components/ui/tabs";
import {
  ArrowLeft,
  FileText,
  FlaskConical,
  Users,
  Settings,
  Crown,
  Pencil,
  Eye,
  Image,
  Table,
  File,
  PlusCircle,
  UserPlus,
} from "lucide-react";
import {
  getWorkspaceById,
  getWorkspaceFlavours,
  getWorkspaceInvites,
} from "@/actions/workspaces";
import { getWorkspaceDocuments } from "@/actions/documents";
import type { Workspace, WorkspaceMember, WorkspaceDocument, WorkspaceFlavour, Flavour, WorkspaceInvite } from "@/app/type";
import type { WorkspaceRoleValue } from "@/constants";

type WorkspaceWithMembers = Workspace & {
  role: WorkspaceRoleValue;
  members: (WorkspaceMember & { email: string; username: string | null })[];
};

function getRoleIcon(role: WorkspaceRoleValue) {
  switch (role) {
    case "owner":
      return <Crown className="h-4 w-4 text-amber-500" />;
    case "editor":
      return <Pencil className="h-4 w-4 text-blue-500" />;
    case "viewer":
      return <Eye className="h-4 w-4 text-gray-500" />;
  }
}

function getRoleBadge(role: WorkspaceRoleValue) {
  switch (role) {
    case "owner":
      return <Badge className="bg-amber-100 text-amber-800">Owner</Badge>;
    case "editor":
      return <Badge className="bg-blue-100 text-blue-800">Editor</Badge>;
    case "viewer":
      return <Badge variant="secondary">Viewer</Badge>;
  }
}

function getDocumentIcon(type: string) {
  switch (type) {
    case "image":
      return <Image className="h-4 w-4" />;
    case "csv":
      return <Table className="h-4 w-4" />;
    case "markdown":
      return <FileText className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
}

function DocumentCard({ document }: { document: WorkspaceDocument }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {getDocumentIcon(document.type)}
          <CardTitle className="text-base">{document.name}</CardTitle>
        </div>
        {document.description && (
          <CardDescription className="line-clamp-2">
            {document.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{document.type}</Badge>
          {document.file_size && (
            <span>{(document.file_size / 1024).toFixed(1)} KB</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <Button variant="ghost" size="sm" asChild className="ml-auto">
          <Link
            href={`/workspaces/${document.workspace_id}/documents/${document.document_id}`}
          >
            View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function FlavourCard({
  link,
}: {
  link: WorkspaceFlavour & { flavour: Flavour };
}) {
  const flavour = link.flavour;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4" />
          <CardTitle className="text-base">{flavour.name}</CardTitle>
        </div>
        {flavour.description && (
          <CardDescription className="line-clamp-2">
            {flavour.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <Badge variant="outline">{flavour.status}</Badge>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <Button variant="ghost" size="sm" asChild className="ml-auto">
          <Link href={`/flavours/${flavour.flavour_id}`}>View Flavour</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function MemberRow({
  member,
}: {
  member: WorkspaceMember & { email: string; username: string | null };
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        {getRoleIcon(member.role)}
        <div>
          <p className="font-medium">
            {member.username || member.email}
          </p>
          {member.username && (
            <p className="text-sm text-muted-foreground">{member.email}</p>
          )}
        </div>
      </div>
      {getRoleBadge(member.role)}
    </div>
  );
}

function InviteRow({ invite }: { invite: WorkspaceInvite }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <UserPlus className="h-4 w-4 text-gray-400" />
        <div>
          <p className="font-medium">{invite.invited_email}</p>
          <p className="text-sm text-muted-foreground">Pending invitation</p>
        </div>
      </div>
      <Badge variant="outline">{invite.role}</Badge>
    </div>
  );
}

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const workspaceId = Number(params.id);

  const [workspace, setWorkspace] = useState<WorkspaceWithMembers | null>(null);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [flavourLinks, setFlavourLinks] = useState<
    (WorkspaceFlavour & { flavour: Flavour })[]
  >([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("documents");

  const canEdit = workspace?.role === "owner" || workspace?.role === "editor";

  const fetchWorkspace = useCallback(async () => {
    try {
      const data = await getWorkspaceById(workspaceId);
      if (!data) {
        setError("Workspace not found or you don't have access");
        return;
      }
      setWorkspace(data);
    } catch (err) {
      console.error("Failed to fetch workspace:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load workspace"
      );
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await getWorkspaceDocuments(workspaceId);
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  }, [workspaceId]);

  const fetchFlavours = useCallback(async () => {
    try {
      const data = await getWorkspaceFlavours(workspaceId);
      setFlavourLinks(data);
    } catch (err) {
      console.error("Failed to fetch flavours:", err);
    }
  }, [workspaceId]);

  const fetchInvites = useCallback(async () => {
    if (!canEdit) return;
    try {
      const data = await getWorkspaceInvites(workspaceId);
      setInvites(data);
    } catch (err) {
      console.error("Failed to fetch invites:", err);
    }
  }, [workspaceId, canEdit]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/");
      return;
    }
    fetchWorkspace();
  }, [isLoaded, isSignedIn, router, fetchWorkspace]);

  useEffect(() => {
    if (!workspace) return;

    if (activeTab === "documents" && documents.length === 0) {
      fetchDocuments();
    } else if (activeTab === "flavours" && flavourLinks.length === 0) {
      fetchFlavours();
    } else if (activeTab === "members" && canEdit && invites.length === 0) {
      fetchInvites();
    }
  }, [
    activeTab,
    workspace,
    documents.length,
    flavourLinks.length,
    invites.length,
    canEdit,
    fetchDocuments,
    fetchFlavours,
    fetchInvites,
  ]);

  if (!isLoaded || !isSignedIn) return null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/workspaces")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workspaces
        </Button>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error || "Workspace not found"}</p>
          <Button
            onClick={() => router.push("/workspaces")}
            className="mt-4"
          >
            Go to Workspaces
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/workspaces")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-muted-foreground">{workspace.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getRoleBadge(workspace.role)}
          {workspace.role === "owner" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/workspaces/${workspace.workspace_id}/settings`)
              }
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="flavours">
            <FlaskConical className="h-4 w-4 mr-2" />
            Flavours
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {canEdit && (
            <div className="flex justify-end">
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </div>
          )}
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <DocumentCard key={doc.document_id} document={doc} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No documents yet. {canEdit && "Add images, spreadsheets, or documents to get started."}
              </p>
              {canEdit && (
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add First Document
                </Button>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flavours" className="space-y-4">
          {canEdit && (
            <div className="flex justify-end">
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Link Flavour
              </Button>
            </div>
          )}
          {flavourLinks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flavourLinks.map((link) => (
                <FlavourCard key={link.flavour_id} link={link} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No flavours linked. {canEdit && "Link your personal flavours to collaborate on them."}
              </p>
              {canEdit && (
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Link First Flavour
                </Button>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>
                    {workspace.members.length} member
                    {workspace.members.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                {canEdit && (
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {workspace.members.map((member) => (
                  <MemberRow key={member.member_id} member={member} />
                ))}
              </div>
              {invites.length > 0 && (
                <>
                  <div className="mt-6 mb-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Pending Invitations
                    </h4>
                  </div>
                  <div className="divide-y">
                    {invites.map((invite) => (
                      <InviteRow key={invite.invite_id} invite={invite} />
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
