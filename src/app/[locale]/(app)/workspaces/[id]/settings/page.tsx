"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/[locale]/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/[locale]/components/ui/alert-dialog";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { toast } from "sonner";
import {
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from "@/actions/workspaces";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session;
  const isLoaded = !isPending;
  const workspaceId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const fetchWorkspace = useCallback(async () => {
    try {
      const data = await getWorkspaceById(workspaceId);
      if (!data) {
        setError("Workspace not found or you don't have access");
        return;
      }
      if (data.role !== "owner" && data.role !== "editor") {
        setError("Only workspace owners and editors can access settings");
        return;
      }
      setIsOwner(data.role === "owner");
      form.reset({
        name: data.name,
        description: data.description || "",
      });
    } catch (err) {
      console.error("Failed to fetch workspace:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load workspace"
      );
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, form]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/");
      return;
    }
    fetchWorkspace();
  }, [isLoaded, isSignedIn, router, fetchWorkspace]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      await updateWorkspace({
        workspaceId,
        name: data.name,
        description: data.description,
      });
      toast.success("Workspace updated successfully");
      router.push(`/workspaces/${workspaceId}`);
    } catch (error) {
      console.error("Failed to update workspace:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update workspace"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteWorkspace(workspaceId);
      toast.success("Workspace deleted successfully");
      router.push("/workspaces");
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete workspace"
      );
      setIsDeleting(false);
    }
  }

  if (!isLoaded || !isSignedIn) return null;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/workspaces/${workspaceId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workspace
        </Button>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => router.push(`/workspaces/${workspaceId}`)}
            className="mt-4"
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/workspaces/${workspaceId}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Workspace
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Settings</CardTitle>
          <CardDescription>
            Manage your workspace settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" rows={3} {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional description for the workspace.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that will permanently affect your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Workspace</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this workspace and all its documents.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this workspace? This action
                      cannot be undone. All documents and linked formulas will be
                      removed from this workspace.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete Workspace"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
