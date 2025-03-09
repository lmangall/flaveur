"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, PlusCircle, MoreHorizontal } from "lucide-react";

type Substance = {
  fema_number: number;
  common_name: string;
  is_natural: boolean;
  cas_id: string;
  odor: string;
  functional_groups: string;
  flavor_profile: string;
};

export default function SubstancesPage() {
  const router = useRouter();
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newSubstance, setNewSubstance] = useState({
    fema_number: "",
    common_name: "",
    is_natural: true,
    cas_id: "",
    odor: "",
    functional_groups: "",
    flavor_profile: "",
  });

  useEffect(() => {
    // Simulate fetching substances
    setTimeout(() => {
      const mockSubstances = [
        {
          fema_number: 2219,
          common_name: "Cinnamaldehyde",
          is_natural: true,
          cas_id: "104-55-2",
          odor: "Cinnamon, spicy",
          functional_groups: "Aldehyde",
          flavor_profile: "Warm, sweet, spicy",
        },
        {
          fema_number: 2454,
          common_name: "Ethyl vanillin",
          is_natural: false,
          cas_id: "121-32-4",
          odor: "Intense vanilla",
          functional_groups: "Phenolic aldehyde",
          flavor_profile: "Strong vanilla, creamy",
        },
        {
          fema_number: 2491,
          common_name: "Benzaldehyde",
          is_natural: true,
          cas_id: "100-52-7",
          odor: "Almond, cherry",
          functional_groups: "Aldehyde",
          flavor_profile: "Fruity, nutty",
        },
        {
          fema_number: 2622,
          common_name: "γ-Undecalactone",
          is_natural: true,
          cas_id: "104-67-6",
          odor: "Peach, apricot",
          functional_groups: "Lactone",
          flavor_profile: "Fruity, creamy, peach",
        },
        {
          fema_number: 3078,
          common_name: "2-Acetylpyrazine",
          is_natural: true,
          cas_id: "22047-25-2",
          odor: "Popcorn, nutty",
          functional_groups: "Ketone, pyrazine",
          flavor_profile: "Toasted, nutty, bready",
        },
      ];
      setSubstances(mockSubstances);
      setIsLoading(false);
    }, 1000);
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/substances`)
      .then((res) => res.json())
      .then((data) => {
        setSubstances(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching substances:", error);
        setIsLoading(false);
      });
  }, [API_URL]);

  const filteredSubstances = substances.filter(
    (substance) =>
      substance.common_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      substance.fema_number.toString().includes(searchQuery) ||
      substance.cas_id.includes(searchQuery) ||
      substance.flavor_profile.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewSubstance({ ...newSubstance, [name]: value });
  };

  const handleSubmitSubstance = () => {
    // Convert FEMA number to integer
    const femaNumber = Number.parseInt(newSubstance.fema_number);
    // In a real app, you would submit this to an API
    // For now, just add it to the local state
    const newSubstanceData = {
      ...newSubstance,
      fema_number: femaNumber,
    };

    setSubstances([newSubstanceData, ...substances]);
    setOpenDialog(false);
    // Reset form
    setNewSubstance({
      fema_number: "",
      common_name: "",
      is_natural: true,
      cas_id: "",
      odor: "",
      functional_groups: "",
      flavor_profile: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Substances</h1>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Substance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Substance</DialogTitle>
              <DialogDescription>
                Enter the details of the substance to add to the database.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fema_number">FEMA Number</Label>
                  <Input
                    id="fema_number"
                    name="fema_number"
                    value={newSubstance.fema_number}
                    onChange={handleInputChange}
                    placeholder="e.g. 2219"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cas_id">CAS ID</Label>
                  <Input
                    id="cas_id"
                    name="cas_id"
                    value={newSubstance.cas_id}
                    onChange={handleInputChange}
                    placeholder="e.g. 104-55-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="common_name">Common Name</Label>
                <Input
                  id="common_name"
                  name="common_name"
                  value={newSubstance.common_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Cinnamaldehyde"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odor">Odor Description</Label>
                <Input
                  id="odor"
                  name="odor"
                  value={newSubstance.odor}
                  onChange={handleInputChange}
                  placeholder="e.g. Cinnamon, spicy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="functional_groups">Functional Groups</Label>
                <Input
                  id="functional_groups"
                  name="functional_groups"
                  value={newSubstance.functional_groups}
                  onChange={handleInputChange}
                  placeholder="e.g. Aldehyde"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flavor_profile">Flavor Profile</Label>
                <Input
                  id="flavor_profile"
                  name="flavor_profile"
                  value={newSubstance.flavor_profile}
                  onChange={handleInputChange}
                  placeholder="e.g. Warm, sweet, spicy"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitSubstance}>Add Substance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search substances..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredSubstances.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>FEMA #</TableHead>
                <TableHead>Common Name</TableHead>
                <TableHead>Natural/Synthetic</TableHead>
                <TableHead>CAS ID</TableHead>
                <TableHead>Odor</TableHead>
                <TableHead>Flavor Profile</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubstances.map((substance) => (
                <TableRow key={substance.fema_number}>
                  <TableCell className="font-medium">
                    {substance.fema_number}
                  </TableCell>
                  <TableCell>{substance.common_name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        substance.is_natural
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {substance.is_natural ? "Natural" : "Synthetic"}
                    </span>
                  </TableCell>
                  <TableCell>{substance.cas_id}</TableCell>
                  <TableCell>{substance.odor}</TableCell>
                  <TableCell>{substance.flavor_profile}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/api/substances/${substance.fema_number}`
                            )
                          }
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/api/substances/${substance.fema_number}/edit`
                            )
                          }
                        >
                          Edit
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
            No substances found matching your criteria
          </p>
          <Button onClick={() => setOpenDialog(true)}>
            Add a new substance
          </Button>
        </div>
      )}
    </div>
  );
}
