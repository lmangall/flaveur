import { SignIn } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn redirectUrl="/" />
    </div>
  );
}
