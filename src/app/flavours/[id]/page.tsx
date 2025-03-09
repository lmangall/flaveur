"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Copy,
  MoreHorizontal,
  Star,
  Trash2,
  Calendar,
  User,
  Tag,
  FlaskRoundIcon as Flask,
  BarChart4,
} from "lucide-react";
import React from "react";

type Flavour = {
  id: number;
  name: string;
  description: string;
  status: string;
  category: string;
  category_id: number;
  baseUnit: string;
  version: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  user: {
    id: string;
    name: string;
  };
  substances: Array<{
    substance_id: number;
    name: string;
    concentration: number;
    unit: string;
  }>;
  ingredients: Array<{
    flavour_id: number;
    name: string;
    concentration: number;
    unit: string;
  }>;
};

export default function FlavourDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [flavour, setFlavour] = useState<Flavour | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlavour = async () => {
      try {
        const response = await fetch(`/api/flavours/${id}`);
        const data = await response.json();
        console.log("Fetched data:", data);
        setFlavour(data);
      } catch (error) {
        console.error("Error fetching flavour data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlavour();
  }, [id]);

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-amber-100 text-amber-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!flavour) {
    return <div>No flavour data found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-auto md:mr-4 h-8 w-8 p-0 md:h-10 md:w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:mr-auto">
          <h1 className="text-2xl md:text-3xl font-bold">{flavour.name}</h1>
          <div className="flex items-center gap-2">
            <Badge
              className={getStatusBadgeClasses(flavour.status)}
              variant="outline"
            >
              {flavour.status.charAt(0).toUpperCase() + flavour.status.slice(1)}
            </Badge>
            {flavour.is_public && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Star className="h-3 w-3 mr-1 fill-current" /> Public
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/flavours/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/flavours/${id}/duplicate`)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  // In a real app, you would show a confirmation dialog
                  router.push("/flavours");
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Flavor Details</CardTitle>
            <CardDescription>{flavour.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="composition" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="composition">Composition</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
              </TabsList>

              <TabsContent value="composition" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mt-4">Substances</h3>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Substance</TableHead>
                          <TableHead>FEMA #</TableHead>
                          <TableHead>Concentration</TableHead>
                          <TableHead>Unit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flavour.substances.map((substance) => (
                          <TableRow key={substance.substance_id}>
                            <TableCell className="font-medium">
                              {substance.name}
                            </TableCell>
                            <TableCell>{substance.substance_id}</TableCell>
                            <TableCell>{substance.concentration}</TableCell>
                            <TableCell>{substance.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {flavour.ingredients.length > 0 && (
                    <>
                      <h3 className="text-lg font-medium mt-4">
                        Flavor Ingredients
                      </h3>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Flavor</TableHead>
                              <TableHead>Concentration</TableHead>
                              <TableHead>Unit</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {flavour.ingredients.map((ingredient) => (
                              <TableRow key={ingredient.flavour_id}>
                                <TableCell className="font-medium">
                                  {ingredient.name}
                                </TableCell>
                                <TableCell>
                                  {ingredient.concentration}
                                </TableCell>
                                <TableCell>{ingredient.unit}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="properties">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Base Unit
                    </h3>
                    <p>{flavour.baseUnit}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Version
                    </h3>
                    <p>{flavour.version}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Creation Date
                    </h3>
                    <p>{formatDate(flavour.created_at)}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </h3>
                    <p>{formatDate(flavour.updated_at)}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Visibility
                    </h3>
                    <p>{flavour.is_public ? "Public" : "Private"}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Created By
                    </h3>
                    <p>{flavour.user.name}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Flavor Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(flavour.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Author</p>
                    <p className="text-sm text-muted-foreground">
                      {flavour.user.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground">
                      {flavour.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Flask className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Substances</p>
                    <p className="text-sm text-muted-foreground">
                      {flavour.substances.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart4 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Components</p>
                    <p className="text-sm text-muted-foreground">
                      {flavour.substances.length + flavour.ingredients.length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" size="sm">
                  Export as PDF
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  Clone Flavor
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  Print Label
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
