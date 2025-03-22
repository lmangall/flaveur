"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/[locale]/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { Label } from "@/app/[locale]/components/ui/label";
import { Search, PlusCircle, MoreHorizontal, ChevronRight } from "lucide-react";

type Category = {
  category_id: number;
  name: string;
  description: string;
  parent_category_id: number | null;
  parent_name: string | null | undefined;
  children: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    parent_category_id: "",
  });

  useEffect(() => {
    // Simulate fetching categories
    setTimeout(() => {
      const mockCategories = [
        {
          category_id: 1,
          name: "Fruit",
          description: "All fruit flavor profiles",
          parent_category_id: null,
          parent_name: null,
          children: 3,
        },
        {
          category_id: 2,
          name: "Citrus",
          description: "Lemon, lime, orange, and other citrus flavors",
          parent_category_id: 1,
          parent_name: "Fruit",
          children: 0,
        },
        {
          category_id: 3,
          name: "Berry",
          description: "Strawberry, blueberry, and other berry flavors",
          parent_category_id: 1,
          parent_name: "Fruit",
          children: 0,
        },
        {
          category_id: 4,
          name: "Tropical",
          description: "Pineapple, mango, and other tropical flavors",
          parent_category_id: 1,
          parent_name: "Fruit",
          children: 0,
        },
        {
          category_id: 5,
          name: "Dessert",
          description: "Sweet dessert flavors",
          parent_category_id: null,
          parent_name: null,
          children: 2,
        },
        {
          category_id: 6,
          name: "Chocolate",
          description: "Various chocolate flavors",
          parent_category_id: 5,
          parent_name: "Dessert",
          children: 0,
        },
        {
          category_id: 7,
          name: "Vanilla",
          description: "Various vanilla flavors",
          parent_category_id: 5,
          parent_name: "Dessert",
          children: 0,
        },
        {
          category_id: 8,
          name: "Beverage",
          description: "Flavors for drinks",
          parent_category_id: null,
          parent_name: null,
          children: 0,
        },
        {
          category_id: 9,
          name: "Spice",
          description: "Spicy and warm flavor profiles",
          parent_category_id: null,
          parent_name: null,
          children: 0,
        },
      ];
      setCategories(mockCategories);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleSubmitCategory = () => {
    // In a real app, you would submit this to an API
    // For now, just add it to the local state
    const newCategoryData = {
      ...newCategory,
      category_id: Math.max(...categories.map((cat) => cat.category_id)) + 1,
      parent_category_id: newCategory.parent_category_id
        ? Number.parseInt(newCategory.parent_category_id)
        : null,
      parent_name: newCategory.parent_category_id
        ? categories.find(
            (cat) =>
              cat.category_id ===
              Number.parseInt(newCategory.parent_category_id)
          )?.name
        : null,
      children: 0,
    };

    setCategories([...categories, newCategoryData]);
    setOpenDialog(false);
    // Reset form
    setNewCategory({
      name: "",
      description: "",
      parent_category_id: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category for organizing flavors.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newCategory.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Fruit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newCategory.description}
                  onChange={handleInputChange}
                  placeholder="Describe this category"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_category_id">
                  Parent Category (Optional)
                </Label>
                <Select
                  value={newCategory.parent_category_id}
                  onValueChange={(value) =>
                    setNewCategory({
                      ...newCategory,
                      parent_category_id: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {categories
                      .filter((cat) => cat.parent_category_id === null)
                      .map((category) => (
                        <SelectItem
                          key={category.category_id}
                          value={category.category_id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
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
      ) : filteredCategories.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead>Sub-categories</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.category_id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    {category.parent_name ? (
                      category.parent_name
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        None (Top Level)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.children > 0 ? (
                      <span className="inline-flex items-center">
                        {category.children}{" "}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        None
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Add Subcategory</DropdownMenuItem>
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
            No categories found matching your criteria
          </p>
          <Button onClick={() => setOpenDialog(true)}>
            Add a new category
          </Button>
        </div>
      )}
    </div>
  );
}
