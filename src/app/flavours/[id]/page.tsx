"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, ChevronDown } from "lucide-react";

// Define the Substance type based on the example provided
type Substance = {
  fema_number: number;
  common_name: string;
  synthetic: boolean;
  molecular_weight: number;
  exact_mass: number;
  smile: string;
  iupac_name: string;
  unknown_natural: boolean;
  odor: string;
  functional_groups: string;
  inchi: string;
  xlogp: number;
  is_natural: boolean;
  flavor_profile: string;
  fema_flavor_profile: string;
  pubchem_id: number;
  cas_id: string;
};

// Define the Flavor type
type Flavor = {
  id: string;
  name: string;
  description: string;
  substances: Substance[];
};

export default function FlavorDetailPage() {
  const params = useParams();
  const flavorId = params.id as string;
  const [flavor, setFlavor] = useState<Flavor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Define which columns are visible
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

  useEffect(() => {
    setIsLoading(true);
    // In a real app, you would fetch the flavor data from your API
    fetch(`${API_URL}/api/flavours/${flavorId}`)
      .then((res) => res.json())
      .then((data) => {
        setFlavor(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching flavor:", error);
        setIsLoading(false);
        // For demo purposes, create mock data if API fails
        const mockFlavor = {
          id: flavorId,
          name: "Vanilla Blend",
          description: "A rich vanilla flavor with sweet undertones",
          substances: [
            {
              fema_number: 1003,
              common_name: "Vanillin",
              synthetic: true,
              molecular_weight: 152.15,
              exact_mass: 152.05,
              smile: "C8H8O3",
              iupac_name: "4-Hydroxy-3-methoxybenzaldehyde",
              unknown_natural: false,
              odor: "Vanilla",
              functional_groups: "Aldehyde, Hydroxyl, Methoxy",
              inchi: "InChI=1S/C8H8O3/c1-11-8-4-6(5-9)7(10)3-2-8/h2-5,10H,1H3",
              xlogp: 1.21,
              is_natural: true,
              flavor_profile: "Sweet, Vanilla",
              fema_flavor_profile: "Vanilla, Creamy",
              pubchem_id: 1183,
              cas_id: "121-33-5",
            },
            {
              fema_number: 2470,
              common_name: "Ethyl Vanillin",
              synthetic: true,
              molecular_weight: 166.18,
              exact_mass: 166.06,
              smile: "C9H10O3",
              iupac_name: "3-Ethoxy-4-hydroxybenzaldehyde",
              unknown_natural: false,
              odor: "Intense vanilla",
              functional_groups: "Aldehyde, Hydroxyl, Ethoxy",
              inchi:
                "InChI=1S/C9H10O3/c1-2-12-9-6-5-7(3-4-10)8(11)6-9/h3-6,11H,2H2,1H3",
              xlogp: 1.58,
              is_natural: false,
              flavor_profile: "Strong vanilla, Sweet",
              fema_flavor_profile: "Vanilla, Intense",
              pubchem_id: 8467,
              cas_id: "121-32-4",
            },
          ],
        };
        setFlavor(mockFlavor);
        setIsLoading(false);
      });
  }, [API_URL, flavorId]);

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

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-12 w-3/4 max-w-md" />
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="border rounded-md">
          <div className="p-4 border-b">
            <Skeleton className="h-8 w-full" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b">
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
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
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{flavor.name}</h1>
        <p className="text-muted-foreground">{flavor.description}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Substances ({flavor.substances.length})</CardTitle>
          <div className="flex items-center gap-2">
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
