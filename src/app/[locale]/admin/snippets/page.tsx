import { SnippetRenderer } from "./SnippetRenderer";
import { AROME_FACTS, FACT_CATEGORIES } from "@/constants/arome-facts";
import { getSnippetPosts } from "@/actions/admin/snippets";

export default async function AdminSnippetsPage() {
  const posts = await getSnippetPosts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Snippet Renderer</h1>
        <p className="text-muted-foreground">
          Pick knowledge snippets and render them in Instagram format for screenshots.
          {" "}{AROME_FACTS.length} facts across {FACT_CATEGORIES.length} categories.
        </p>
      </div>

      <SnippetRenderer initialPosts={posts} />
    </div>
  );
}
