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
  Table,
  PlusCircle,
  UserPlus,
  FileType,
  File,
} from "lucide-react";
import {
  getWorkspaceById,
  getWorkspaceFlavours,
  getWorkspaceInvites,
} from "@/actions/workspaces";
import { getWorkspaceDocuments } from "@/actions/documents";
import { WorkspaceMemberDialog } from "@/app/[locale]/components/workspace-member-dialog";
import { DocumentUploadDialog } from "@/app/[locale]/components/document-upload-dialog";
import { LinkFlavourDialog } from "@/app/[locale]/components/link-flavour-dialog";
import type { Workspace, WorkspaceMember, WorkspaceDocument, WorkspaceFlavour, Flavour, WorkspaceInvite } from "@/app/type";
import type { WorkspaceRoleValue } from "@/constants";

type MemberWithDetails = WorkspaceMember & { email: string; username: string | null };

type WorkspaceWithMembers = Omit<Workspace, 'members'> & {
  role: WorkspaceRoleValue;
  members: MemberWithDetails[];
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

function getDocumentTypeStyle(type: string) {
  switch (type) {
    case "image":
      return { bg: "bg-purple-50 dark:bg-purple-950/30", icon: "text-purple-600 dark:text-purple-400", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" };
    case "csv":
      return { bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" };
    case "markdown":
      return { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" };
    case "pdf":
      return { bg: "bg-red-50 dark:bg-red-950/30", icon: "text-red-600 dark:text-red-400", badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" };
    default:
      return { bg: "bg-gray-50 dark:bg-gray-950/30", icon: "text-gray-600 dark:text-gray-400", badge: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300" };
  }
}

function getDocumentIcon(type: string) {
  switch (type) {
    case "csv":
      return <Table className="h-8 w-8" />;
    case "pdf":
      return <FileType className="h-8 w-8" />;
    case "file":
      return <File className="h-8 w-8" />;
    default:
      return <FileText className="h-8 w-8" />;
  }
}

function getDocumentTypeLabel(type: string): string {
  switch (type) {
    case "image": return "Image";
    case "csv": return "Table";
    case "markdown": return "Doc";
    case "pdf": return "PDF";
    default: return "File";
  }
}

function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function DocumentCard({ document }: { document: WorkspaceDocument }) {
  const style = getDocumentTypeStyle(document.type);

  return (
    <Link href={`/workspaces/${document.workspace_id}/documents/${document.document_id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
        {/* Image thumbnail or type icon header */}
        {document.type === "image" && document.url ? (
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={document.url}
              alt={document.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ) : (
          <div className={`flex items-center justify-center py-8 ${style.bg}`}>
            <div className={`rounded-full p-3 bg-white/80 dark:bg-black/20 ${style.icon}`}>
              {getDocumentIcon(document.type)}
            </div>
          </div>
        )}

        <CardHeader className="pb-2 pt-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-medium line-clamp-1 group-hover:text-primary transition-colors">
              {document.name}
            </CardTitle>
            <Badge variant="secondary" className={`shrink-0 text-xs ${style.badge} border-0`}>
              {getDocumentTypeLabel(document.type)}
            </Badge>
          </div>
          {document.description && (
            <CardDescription className="line-clamp-2 text-xs">
              {document.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pt-0 pb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatRelativeDate(document.created_at)}</span>
            {document.file_size && (
              <span>{(document.file_size / 1024).toFixed(1)} KB</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
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
  member: MemberWithDetails;
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
  const { user, isSignedIn, isLoaded } = useUser();
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
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [flavourDialogOpen, setFlavourDialogOpen] = useState(false);

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
              <Button size="sm" onClick={() => setDocumentDialogOpen(true)}>
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
                <Button onClick={() => setDocumentDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add First Document
                </Button>
              )}
            </Card>
          )}

          {workspace && (
            <DocumentUploadDialog
              open={documentDialogOpen}
              onOpenChange={setDocumentDialogOpen}
              workspaceId={workspace.workspace_id}
              onDocumentCreated={fetchDocuments}
            />
          )}
        </TabsContent>

        <TabsContent value="flavours" className="space-y-4">
          {canEdit && (
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setFlavourDialogOpen(true)}>
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
                <Button onClick={() => setFlavourDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Link First Flavour
                </Button>
              )}
            </Card>
          )}

          {workspace && (
            <LinkFlavourDialog
              open={flavourDialogOpen}
              onOpenChange={setFlavourDialogOpen}
              workspaceId={workspace.workspace_id}
              linkedFlavourIds={flavourLinks.map((l) => l.flavour_id)}
              onFlavourLinked={fetchFlavours}
            />
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
                  <Button size="sm" onClick={() => setMemberDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Members
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

          {user && workspace && (
            <WorkspaceMemberDialog
              open={memberDialogOpen}
              onOpenChange={setMemberDialogOpen}
              workspaceId={workspace.workspace_id}
              workspaceName={workspace.name}
              currentUserRole={workspace.role}
              members={workspace.members}
              currentUserId={user.id}
              onMembersChange={fetchWorkspace}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
