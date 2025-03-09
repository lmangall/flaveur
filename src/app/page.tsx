"use client";

import { Button } from "@/components/ui/button";
import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {!isSignedIn ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">FlavorLab</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              Create, manage, and share your custom flavor compositions with our
              comprehensive flavor management system.
            </p>
            <SignIn routing="hash" />
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Welcome, {user?.fullName}
            </h1>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm text-muted-foreground">
        <span>© 2025 FlavorLab</span>
        <a href="#" className="hover:text-foreground">
          Terms
        </a>
        <a href="#" className="hover:text-foreground">
          Privacy
        </a>
      </footer>
    </div>
  );
}
