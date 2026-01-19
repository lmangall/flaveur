"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
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
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";

import { getAllJobs, deleteJob, toggleJobStatus } from "@/actions/jobs";
import type { JobOffer } from "@/app/type";

export default function AdminJobsPage() {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const router = useRouter();

  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobOffer | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAllJobs();
      setJobs(result as JobOffer[]);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    let result = jobs;

    // Filter by status
    if (statusFilter === "active") {
      result = result.filter((job) => job.status === true);
    } else if (statusFilter === "inactive") {
      result = result.filter((job) => job.status === false);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company_name?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query)
      );
    }

    setFilteredJobs(result);
  }, [jobs, statusFilter, searchQuery]);

  const handleToggleStatus = async (job: JobOffer) => {
    try {
      await toggleJobStatus(Number(job.id), !job.status);
      toast.success(t("statusUpdated"));
      fetchJobs();
    } catch {
      toast.error(t("statusUpdateError"));
    }
  };

  const handleDeleteClick = (job: JobOffer) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      await deleteJob(Number(jobToDelete.id));
      toast.success(t("deleteSuccess"));
      setDeleteDialogOpen(false);
      setJobToDelete(null);
      fetchJobs();
    } catch {
      toast.error(t("deleteError"));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("jobs")}</h1>
          <p className="text-muted-foreground">{t("jobsDescription")}</p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/admin/jobs/new`}>
            <Plus className="h-4 w-4 mr-2" />
            {t("newJob")}
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchJobs")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allJobs")}</SelectItem>
            <SelectItem value="active">{t("activeOnly")}</SelectItem>
            <SelectItem value="inactive">{t("inactiveOnly")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t("noJobsFound")}</p>
          <Button asChild>
            <Link href={`/${locale}/admin/jobs/new`}>
              <Plus className="h-4 w-4 mr-2" />
              {t("createFirst")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("title")}</TableHead>
                <TableHead>{t("company")}</TableHead>
                <TableHead>{t("location")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("posted")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.company_name || "-"}</TableCell>
                  <TableCell>{job.location || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={job.status ? "default" : "secondary"}>
                      {job.status ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(job.posted_at || job.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(job)}
                        title={job.status ? t("deactivate") : t("activate")}
                      >
                        {job.status ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/${locale}/admin/jobs/${job.id}/edit`)}
                        title={t("edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(job)}
                        title={t("delete")}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDelete")}
              <br />
              <strong>{jobToDelete?.title}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
