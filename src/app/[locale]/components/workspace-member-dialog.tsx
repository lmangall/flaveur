"use client";

import { useState, useCallback } from "react";
import { UserPlus, X, Loader2, Mail, Clock, Crown, Pencil, Eye, Trash2 } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/[locale]/components/ui/dialog";
import { Input } from "@/app/[locale]/components/ui/input";
import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { toast } from "sonner";
import {
  addWorkspaceMember,
  cancelWorkspaceInvite,
  removeWorkspaceMember,
  updateMemberRole,
  getWorkspaceInvites,
} from "@/actions/workspaces";
import type { WorkspaceInvite } from "@/app/type";
import type { WorkspaceRoleValue } from "@/constants";

type MemberWithDetails = {
  member_id: number;
  workspace_id: number;
  user_id: string;
  role: WorkspaceRoleValue;
  created_at: string;
  email: string;
  username: string | null;
};

interface WorkspaceMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number;
  workspaceName: string;
  currentUserRole: WorkspaceRoleValue;
  members: MemberWithDetails[];
  currentUserId: string;
  onMembersChange: () => void;
}

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
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Owner</Badge>;
    case "editor":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Editor</Badge>;
    case "viewer":
      return <Badge variant="secondary">Viewer</Badge>;
  }
}

export function WorkspaceMemberDialog({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
  currentUserRole,
  members,
  currentUserId,
  onMembersChange,
}: WorkspaceMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"editor" | "viewer">("viewer");
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [removingId, setRemovingId] = useState<string | number | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const isOwner = currentUserRole === "owner";
  const canInvite = currentUserRole === "owner" || currentUserRole === "editor";

  const loadInvites = useCallback(async () => {
    if (!canInvite) return;
    setIsLoadingInvites(true);
    try {
      const data = await getWorkspaceInvites(workspaceId);
      setInvites(data);
    } catch (error) {
      console.error("Error loading invites:", error);
    } finally {
      setIsLoadingInvites(false);
    }
  }, [workspaceId, canInvite]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (newOpen && canInvite) {
      loadInvites();
      setEmail("");
      setSelectedRole("viewer");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const result = await addWorkspaceMember({
        workspaceId,
        email: email.trim(),
        role: selectedRole,
      });

      if (result.type === "member") {
        toast.success(`${result.email} has been added to the workspace`);
        onMembersChange();
      } else {
        toast.success(`Invitation sent to ${result.email}`);
        await loadInvites();
      }
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to invite member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    setRemovingId(targetUserId);
    try {
      await removeWorkspaceMember({ workspaceId, targetUserId });
      toast.success("Member removed from workspace");
      onMembersChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCancelInvite = async (inviteId: number) => {
    setRemovingId(inviteId);
    try {
      await cancelWorkspaceInvite(inviteId);
      toast.success("Invitation cancelled");
      setInvites((prev) => prev.filter((i) => i.invite_id !== inviteId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
    } finally {
      setRemovingId(null);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: WorkspaceRoleValue) => {
    setEditingMemberId(targetUserId);
    try {
      await updateMemberRole({ workspaceId, targetUserId, newRole });
      toast.success("Role updated");
      onMembersChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setEditingMemberId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription>
            Invite people to collaborate on {workspaceName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite form */}
          {canInvite && (
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Select
                  value={selectedRole}
                  onValueChange={(value: "editor" | "viewer") => setSelectedRole(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUserRole === "owner" && (
                      <SelectItem value="editor">Editor</SelectItem>
                    )}
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={isLoading || !email.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {currentUserRole === "editor" && (
                <p className="text-xs text-muted-foreground">
                  As an editor, you can only invite viewers
                </p>
              )}
            </form>
          )}

          {/* Current members */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Members ({members.length})
            </p>
            <div className="space-y-2">
              {members.map((member) => {
                const isCurrentUser = member.user_id === currentUserId;
                const canRemove = isOwner && !isCurrentUser && member.role !== "owner";
                const canEditRole = isOwner && !isCurrentUser && member.role !== "owner";

                return (
                  <div
                    key={member.member_id}
                    className="flex items-center justify-between p-3 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getRoleIcon(member.role)}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.username || member.email}
                          {isCurrentUser && (
                            <span className="text-muted-foreground ml-1">(you)</span>
                          )}
                        </p>
                        {member.username && (
                          <p className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {canEditRole ? (
                        <Select
                          value={member.role}
                          onValueChange={(value: WorkspaceRoleValue) =>
                            handleRoleChange(member.user_id, value)
                          }
                          disabled={editingMemberId === member.user_id}
                        >
                          <SelectTrigger className="w-24 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getRoleBadge(member.role)
                      )}
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={removingId === member.user_id}
                        >
                          {removingId === member.user_id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending invites */}
          {canInvite && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Pending Invitations</p>
              {isLoadingInvites ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : invites.length > 0 ? (
                <div className="space-y-2">
                  {invites.map((invite) => (
                    <div
                      key={invite.invite_id}
                      className="flex items-center justify-between p-3 bg-muted/50 border border-dashed rounded-md"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm truncate">{invite.invited_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {invite.role}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => handleCancelInvite(invite.invite_id)}
                          disabled={removingId === invite.invite_id}
                        >
                          {removingId === invite.invite_id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-3 border border-dashed rounded-md">
                  No pending invitations
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
