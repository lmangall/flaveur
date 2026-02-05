import { JobSocialRenderer } from "./JobSocialRenderer";
import { getActiveJobOffers, getJobSocialPosts } from "@/actions/admin/job-social";

export default async function AdminJobsSocialPage() {
  const [jobs, posts] = await Promise.all([
    getActiveJobOffers(),
    getJobSocialPosts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job Social Posts</h1>
        <p className="text-muted-foreground">
          Generate social media content from job offers.
          {" "}{jobs.length} active jobs available.
        </p>
      </div>

      <JobSocialRenderer initialJobs={jobs} initialPosts={posts} />
    </div>
  );
}
