"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuth } from "@clerk/nextjs"; // Import useAuth

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Filter,
  Star,
  StarOff,
} from "lucide-react";

type Flavour = {
  id: number;
  name: string;
  description: string;
  status: string;
  category: string;
  unit: string;
  createdAt: string;
  isPublic: boolean;
  version: number;
};

export default function FlavoursPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth(); // Move useAuth here

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/");
      return;
    }

    // Fetch flavours from the API
    const fetchFlavours = async () => {
      try {
        const token = await getToken(); // Get Clerk token
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/flavours`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send token
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setFlavours(data);
      } catch (error) {
        console.error("Failed to fetch flavours:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlavours();
  }, [isSignedIn, router]);

  const filteredFlavours = flavours.filter((flavour) => {
    const matchesSearch = flavour.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || flavour.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  if (!isSignedIn) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Flavors</h1>
        <Button onClick={() => router.push("/flavours/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Flavor
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search flavors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredFlavours.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlavours.map((flavour) => (
                <TableRow key={flavour.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/flavours/${flavour.id}`}
                      className="hover:underline"
                    >
                      {flavour.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusBadgeClasses(
                        flavour.status
                      )}`}
                    >
                      {flavour.status.charAt(0).toUpperCase() +
                        flavour.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{flavour.category}</TableCell>
                  <TableCell>v{flavour.version}</TableCell>
                  <TableCell>
                    {flavour.isPublic ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" /> Public
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <StarOff className="h-4 w-4 text-muted-foreground" />{" "}
                        Private
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/flavours/${flavour.id}`)}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/flavours/${flavour.id}/edit`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/flavours/${flavour.id}/duplicate`)
                          }
                        >
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">
            No flavors found matching your criteria
          </p>
          <Button onClick={() => router.push("/flavours/new")}>
            Create a new flavor
          </Button>
        </div>
      )}
    </div>
  );
}
