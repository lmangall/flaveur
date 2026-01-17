import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("https://accounts.oumamie.xyz/sign-in");
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
