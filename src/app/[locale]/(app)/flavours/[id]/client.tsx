"use client";

import { useSession } from "@/lib/auth-client";
import { Flavour } from "@/app/type";
import { toast } from "sonner";
import useSWR from "swr";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";

export default function FlavorClient({ flavor }: { flavor: Flavour }) {
  const { data: session } = useSession();
  const { mutate } = useSWR(`/api/flavours/${flavor.flavour_id}`);

  const handleRemoveSubstance = async (substanceId: number) => {
    try {
      // Better Auth uses cookies for authentication, no need to pass token explicitly
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/flavours/${flavor.flavour_id}/substances/${substanceId}`,
        {
          method: "DELETE",
          credentials: "include", // Include cookies for Better Auth session
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove substance");
      }

      // Refresh the flavor data
      mutate();
    } catch (error) {
      console.error("Error removing substance:", error);
      toast.error("Failed to remove substance");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{flavor.name}</h1>
          <p className="text-muted-foreground">{flavor.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={flavor.is_public ? "default" : "secondary"}>
            {flavor.is_public ? "Public" : "Private"}
          </Badge>
          <Badge variant="outline">{flavor.status}</Badge>
          {flavor.version !== undefined && (
            <Badge variant="outline">v{flavor.version}</Badge>
          )}
          {flavor.base_unit && (
            <Badge variant="outline">{flavor.base_unit}</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flavor.base_unit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(flavor.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(flavor.updated_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flavor.user_id ? "User" : "System"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Category ID: {flavor.category_id}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Substances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flavor.substances?.map((substance) => (
              <div
                key={substance.substance_id}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {substance.substance?.common_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    FEMA {substance.substance?.fema_number}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    {substance.concentration} {substance.unit}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleRemoveSubstance(substance.substance_id)
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
