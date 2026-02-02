"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { Label } from "@/app/[locale]/components/ui/label";
import { Switch } from "@/app/[locale]/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";

import { createJob, updateJob } from "@/actions/jobs";
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  type EmploymentTypeValue,
  type ExperienceLevelValue,
  type ContactPerson,
} from "@/constants";
import type { JobOffer } from "@/app/type";

interface JobFormProps {
  job?: JobOffer;
  mode: "create" | "edit";
}

export function JobForm({ job, mode }: JobFormProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: job?.title || "",
    description: job?.description || "",
    company_name: job?.company_name || "",
    original_company_name: job?.original_company_name || "",
    through_recruiter: job?.through_recruiter || false,
    location: job?.location || "",
    employment_type: job?.employment_type || "",
    experience_level: job?.experience_level || "",
    salary: job?.salary || "",
    industry: job?.industry || "",
    requirements: job?.requirements?.join("\n") || "",
    tags: job?.tags?.join(", ") || "",
    contact_name: job?.contact_person?.name || "",
    contact_email: job?.contact_person?.email || "",
    contact_phone: job?.contact_person?.phone || "",
    source_website: job?.source_website || "",
    source_url: job?.source_url || "",
    expires_at: job?.expires_at ? job.expires_at.split("T")[0] : "",
    status: job?.status ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const contactPerson: ContactPerson = {
        name: formData.contact_name || undefined,
        email: formData.contact_email || undefined,
        phone: formData.contact_phone || undefined,
      };

      const jobData = {
        title: formData.title,
        description: formData.description || undefined,
        company_name: formData.company_name || undefined,
        original_company_name: formData.original_company_name || undefined,
        through_recruiter: formData.through_recruiter,
        location: formData.location || undefined,
        employment_type: formData.employment_type as EmploymentTypeValue | undefined,
        experience_level: formData.experience_level as ExperienceLevelValue | undefined,
        salary: formData.salary || undefined,
        industry: formData.industry || undefined,
        requirements: formData.requirements
          ? formData.requirements.split("\n").filter((r) => r.trim())
          : undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
        contact_person:
          contactPerson.name || contactPerson.email || contactPerson.phone
            ? contactPerson
            : undefined,
        source_website: formData.source_website || undefined,
        source_url: formData.source_url || undefined,
        expires_at: formData.expires_at || undefined,
        status: formData.status,
      };

      if (mode === "create") {
        await createJob(jobData);
        toast.success(t("jobCreated"));
      } else if (job) {
        await updateJob(String(job.id), jobData);
        toast.success(t("jobUpdated"));
      }

      router.push(`/${locale}/admin/jobs`);
    } catch (error) {
      console.error("Failed to save job:", error);
      toast.error(mode === "create" ? t("jobCreateError") : t("jobUpdateError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/admin/jobs`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {mode === "create" ? t("createJob") : t("editJob")}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("jobDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">{t("jobTitle")} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("jobTitlePlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">{t("companyName")}</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder={t("companyNamePlaceholder")}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Switch
                id="through_recruiter"
                checked={formData.through_recruiter}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, through_recruiter: checked })
                }
              />
              <Label htmlFor="through_recruiter">{t("throughRecruiter")}</Label>
            </div>

            {formData.through_recruiter && (
              <div className="space-y-2">
                <Label htmlFor="original_company_name">{t("originalCompany")}</Label>
                <Input
                  id="original_company_name"
                  value={formData.original_company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, original_company_name: e.target.value })
                  }
                  placeholder={t("originalCompanyPlaceholder")}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("descriptionPlaceholder")}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">{t("requirements")}</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder={t("requirementsPlaceholder")}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t("jobDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">{t("location")}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Paris, France"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("employmentType")}</Label>
              <Select
                value={formData.employment_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, employment_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectEmploymentType")} />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("experienceLevel")}</Label>
              <Select
                value={formData.experience_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, experience_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectExperienceLevel")} />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">{t("salary")}</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder={t("salaryPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">{t("industry")}</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder={t("industryPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">{t("tags")}</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder={t("tagsPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">{t("expiresAt")}</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
              />
              <Label htmlFor="status">
                {formData.status ? t("active") : t("inactive")}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Source */}
        <Card>
          <CardHeader>
            <CardTitle>{t("contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">{t("contactName")}</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">{t("contactEmail")}</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">{t("contactPhone")}</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-4">{t("source")}</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source_website">{t("sourceWebsite")}</Label>
                  <Input
                    id="source_website"
                    value={formData.source_website}
                    onChange={(e) =>
                      setFormData({ ...formData, source_website: e.target.value })
                    }
                    placeholder="LinkedIn"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source_url">{t("sourceUrl")}</Label>
                  <Input
                    id="source_url"
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href={`/${locale}/admin/jobs`}>{t("cancel")}</Link>
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
