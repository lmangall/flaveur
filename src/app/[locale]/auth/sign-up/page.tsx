import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("https://accounts.oumamie.xyz/sign-up");
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
