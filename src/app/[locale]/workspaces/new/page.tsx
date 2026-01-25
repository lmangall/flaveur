"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createWorkspace } from "@/actions/workspaces";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewWorkspacePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      const workspace = await createWorkspace({
        name: data.name,
        description: data.description,
      });
      toast.success("Workspace created successfully");
      router.push(`/workspaces/${workspace.workspace_id}`);
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create workspace"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoaded) return null;
  if (!isSignedIn) {
    router.push("/");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/workspaces")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Workspaces
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Workspace</CardTitle>
          <CardDescription>
            Create a new workspace to collaborate with your team on flavours and
            documents.
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
                      <Input placeholder="My Team Workspace" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your workspace a descriptive name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A workspace for our flavor development team..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the purpose of this workspace.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/workspaces")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Workspace"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
