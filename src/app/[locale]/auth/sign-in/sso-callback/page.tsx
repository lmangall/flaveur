import { redirect } from "next/navigation";

// Better Auth handles OAuth callbacks differently, so this page just redirects to home
export default function SSOCallbackPage() {
  redirect("/");
}
