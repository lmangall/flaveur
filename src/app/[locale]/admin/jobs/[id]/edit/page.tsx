import { notFound } from "next/navigation";
import { getJobById } from "@/actions/jobs";
import { JobForm } from "../../components/job-form";
import type { JobOffer } from "@/app/type";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;

  try {
    const job = await getJobById(id);
    return <JobForm job={job as JobOffer} mode="edit" />;
  } catch {
    notFound();
  }
}
