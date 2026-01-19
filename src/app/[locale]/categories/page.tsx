"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
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
} from "@/app/[locale]/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/[locale]/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { Label } from "@/app/[locale]/components/ui/label";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { Search, PlusCircle, MoreHorizontal, ChevronRight, Pencil, Trash2, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryWithDetails,
} from "@/actions/categories";

function TableSkeleton() {
  return (
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
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function CategoriesPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_category_id: "",
  });
  const [editingCategory, setEditingCategory] = useState<CategoryWithDetails | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn) {
      fetchCategories();
    }
  }, [isSignedIn, isLoaded, router, fetchCategories]);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const topLevelCategories = categories.filter((cat) => cat.parent_category_id === null);

  const resetForm = () => {
    setFormData({ name: "", description: "", parent_category_id: "" });
    setEditingCategory(null);
  };

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const parentId = formData.parent_category_id && formData.parent_category_id !== "none"
        ? parseInt(formData.parent_category_id)
        : null;

      await createCategory({
        name: formData.name,
        description: formData.description || undefined,
        parent_category_id: parentId,
      });

      toast.success("Category created successfully");
      setOpenCreateDialog(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const parentId = formData.parent_category_id && formData.parent_category_id !== "none"
        ? parseInt(formData.parent_category_id)
        : null;

      await updateCategory(editingCategory.category_id, {
        name: formData.name,
        description: formData.description || undefined,
        parent_category_id: parentId,
      });

      toast.success("Category updated successfully");
      setOpenEditDialog(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    setIsSubmitting(true);
    try {
      await deleteCategory(deletingCategory.category_id);
      toast.success("Category deleted successfully");
      setOpenDeleteDialog(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditMode = (category: CategoryWithDetails) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parent_category_id: category.parent_category_id?.toString() || "none",
    });
    setOpenEditDialog(true);
  };

  const openCreateWithParent = (parentCategory: CategoryWithDetails) => {
    setFormData({
      name: "",
      description: "",
      parent_category_id: parentCategory.category_id.toString(),
    });
    setOpenCreateDialog(true);
  };

  const openDeleteMode = (category: CategoryWithDetails) => {
    setDeletingCategory(category);
    setOpenDeleteDialog(true);
  };

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>

        <Button onClick={() => { resetForm(); setOpenCreateDialog(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
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
        <TableSkeleton />
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
                  <TableCell className="max-w-xs truncate">
                    {category.description || <span className="text-muted-foreground text-xs">No description</span>}
                  </TableCell>
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
                    {category.children_count > 0 ? (
                      <span className="inline-flex items-center">
                        {category.children_count}
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
                        <DropdownMenuItem onClick={() => openEditMode(category)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openCreateWithParent(category)}>
                          <FolderPlus className="mr-2 h-4 w-4" />
                          Add Subcategory
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteMode(category)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
            {searchQuery ? "No categories found matching your search" : "No categories yet"}
          </p>
          <Button onClick={() => { resetForm(); setOpenCreateDialog(true); }}>
            Add a new category
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for organizing flavors.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Category Name *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Fruit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this category"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-parent">Parent Category (Optional)</Label>
              <Select
                value={formData.parent_category_id}
                onValueChange={(value) => setFormData({ ...formData, parent_category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {topLevelCategories.map((category) => (
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
            <Button variant="outline" onClick={() => setOpenCreateDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Fruit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this category"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">Parent Category</Label>
              <Select
                value={formData.parent_category_id}
                onValueChange={(value) => setFormData({ ...formData, parent_category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {topLevelCategories
                    .filter((cat) => cat.category_id !== editingCategory?.category_id)
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
            <Button variant="outline" onClick={() => setOpenEditDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingCategory?.name}&quot;?
              {deletingCategory?.children_count && deletingCategory.children_count > 0 && (
                <span className="block mt-2 text-destructive">
                  This category has {deletingCategory.children_count} subcategories that must be deleted or reassigned first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
