"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, ChevronDown, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs"; // Import useAuth
import { Flavour } from "@/app/type"; // Adjust the path as necessary

function FlavorContent({ flavor }: { flavor: Flavour }) {
  // Move the table-related state and logic here
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      fema_number: true,
      common_name: true,
      is_natural: true,
      odor: true,
      functional_groups: true,
      flavor_profile: true,
      cas_id: true,
      molecular_weight: false,
      exact_mass: false,
      smile: false,
      iupac_name: false,
      xlogp: false,
      fema_flavor_profile: false,
      pubchem_id: false,
    }
  );

  // All possible columns for the dropdown
  const allColumns = [
    { key: "fema_number", label: "FEMA #" },
    { key: "common_name", label: "Common Name" },
    { key: "is_natural", label: "Natural/Synthetic" },
    { key: "odor", label: "Odor" },
    { key: "functional_groups", label: "Functional Groups" },
    { key: "flavor_profile", label: "Flavor Profile" },
    { key: "cas_id", label: "CAS ID" },
    { key: "molecular_weight", label: "Molecular Weight" },
    { key: "exact_mass", label: "Exact Mass" },
    { key: "smile", label: "SMILE" },
    { key: "iupac_name", label: "IUPAC Name" },
    { key: "xlogp", label: "XLogP" },
    { key: "fema_flavor_profile", label: "FEMA Flavor Profile" },
    { key: "pubchem_id", label: "PubChem ID" },
  ];

  // Toggle column visibility
  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Show all columns
  const showAllColumns = () => {
    const allVisible = Object.fromEntries(
      allColumns.map(({ key }) => [key, true])
    );
    setVisibleColumns(allVisible);
  };

  // Hide all optional columns (keep essential ones visible)
  const hideOptionalColumns = () => {
    setVisibleColumns({
      fema_number: true,
      common_name: true,
      is_natural: true,
      odor: true,
      functional_groups: false,
      flavor_profile: true,
      cas_id: true,
      molecular_weight: false,
      exact_mass: false,
      smile: false,
      iupac_name: false,
      xlogp: false,
      fema_flavor_profile: false,
      pubchem_id: false,
    });
  };

  const { getToken } = useAuth();
  const [substanceIdToAdd, setSubstanceIdToAdd] = useState("");
  const [concentration, setConcentration] = useState("");
  const [unit, setUnit] = useState("");

  const handleAddSubstance = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/flavours/${flavor.id}/substances`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            substance_id: parseInt(substanceIdToAdd),
            concentration: parseFloat(concentration),
            unit,
            order_index: flavor.substances.length,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add substance");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error adding substance:", error);
    }
  };

  const handleRemoveSubstance = async (substanceId: number) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/flavours/${flavor.id}/substances/${substanceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove substance");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error removing substance:", error);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{flavor.name}</h1>
        <p className="text-muted-foreground">{flavor.description}</p>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">
            {flavor.status.charAt(0).toUpperCase() + flavor.status.slice(1)}
          </Badge>
          <Badge variant="outline">
            {flavor.isPublic ? "Public" : "Private"}
          </Badge>
          {flavor.version !== null && (
            <Badge variant="outline">v{flavor.version}</Badge>
          )}
          {flavor.baseUnit && (
            <Badge variant="outline">{flavor.baseUnit}</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flavor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {new Date(flavor.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(flavor.updatedAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">User ID:</span> {flavor.userId}
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Category ID:</span>{" "}
                {flavor.categoryId || "None"}
              </div>
              <div>
                <span className="font-medium">Base Unit:</span>{" "}
                {flavor.baseUnit || "None"}
              </div>
              <div>
                <span className="font-medium">Version:</span>{" "}
                {flavor.version !== null ? `v${flavor.version}` : "None"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Substances ({flavor.substances.length})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Substance ID"
                className="px-2 py-1 border rounded"
                value={substanceIdToAdd}
                onChange={(e) => setSubstanceIdToAdd(e.target.value)}
              />
              <input
                type="text"
                placeholder="Concentration"
                className="px-2 py-1 border rounded"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
              />
              <input
                type="text"
                placeholder="Unit"
                className="px-2 py-1 border rounded"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSubstance}
                disabled={!substanceIdToAdd || !concentration || !unit}
              >
                Add Substance
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={showAllColumns}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Show All</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={hideOptionalColumns}
              className="flex items-center gap-1"
            >
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">Hide Optional</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={visibleColumns[column.key]}
                    onCheckedChange={() => toggleColumn(column.key)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {flavor.substances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No substances added to this flavor yet.</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {allColumns.map(
                      (column) =>
                        visibleColumns[column.key] && (
                          <TableHead key={column.key}>{column.label}</TableHead>
                        )
                    )}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flavor.substances.map((substance) => (
                    <TableRow key={substance.fema_number}>
                      {visibleColumns.fema_number && (
                        <TableCell className="font-medium">
                          {substance.fema_number}
                        </TableCell>
                      )}
                      {visibleColumns.common_name && (
                        <TableCell>{substance.common_name}</TableCell>
                      )}
                      {visibleColumns.is_natural && (
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              substance.is_natural
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                            }
                          >
                            {substance.is_natural ? "Natural" : "Synthetic"}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.odor && (
                        <TableCell>{substance.odor}</TableCell>
                      )}
                      {visibleColumns.functional_groups && (
                        <TableCell>{substance.functional_groups}</TableCell>
                      )}
                      {visibleColumns.flavor_profile && (
                        <TableCell>{substance.flavor_profile}</TableCell>
                      )}
                      {visibleColumns.cas_id && (
                        <TableCell>{substance.cas_id}</TableCell>
                      )}
                      {visibleColumns.molecular_weight && (
                        <TableCell>{substance.molecular_weight}</TableCell>
                      )}
                      {visibleColumns.exact_mass && (
                        <TableCell>{substance.exact_mass}</TableCell>
                      )}
                      {visibleColumns.smile && (
                        <TableCell>
                          <code className="bg-muted px-1 py-0.5 rounded text-xs">
                            {substance.smile}
                          </code>
                        </TableCell>
                      )}
                      {visibleColumns.iupac_name && (
                        <TableCell>{substance.iupac_name}</TableCell>
                      )}
                      {visibleColumns.xlogp && (
                        <TableCell>{substance.xlogp}</TableCell>
                      )}
                      {visibleColumns.fema_flavor_profile && (
                        <TableCell>{substance.fema_flavor_profile}</TableCell>
                      )}
                      {visibleColumns.pubchem_id && (
                        <TableCell>{substance.pubchem_id}</TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveSubstance(substance.substance_id)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}

export default function FlavorDetailPage() {
  const params = useParams();
  const flavorId = parseInt(params.id as string, 10);
  const [flavor, setFlavor] = useState<Flavour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchFlavorData() {
      if (isNaN(flavorId)) {
        setError("Invalid flavor ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = await getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/flavours/${flavorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const transformedData: Flavour = {
          id: Number(data.flavour.flavour_id),
          name: data.flavour.name || "Unnamed Flavor",
          description: data.flavour.description || "",
          substances: Array.isArray(data.substances) ? data.substances : [],
          status: data.flavour.status || "draft",
          isPublic: Boolean(data.flavour.is_public),
          version:
            data.flavour.version !== null ? Number(data.flavour.version) : null,
          baseUnit: data.flavour.base_unit || "",
          categoryId:
            data.flavour.category_id !== null
              ? Number(data.flavour.category_id)
              : null,
          createdAt: data.flavour.created_at || new Date().toISOString(),
          updatedAt: data.flavour.updated_at || new Date().toISOString(),
          userId: data.flavour.user_id || "Unknown",
        };

        setFlavor(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching flavor:", err);
        setError("Failed to load flavor data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFlavorData();
  }, [flavorId, getToken]);

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!flavor) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">Flavor not found</h2>
            <p className="text-muted-foreground">
              The flavor you are looking for does not exist or has been removed.
            </p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <FlavorContent flavor={flavor} />
    </Suspense>
  );
}
