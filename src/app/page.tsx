"use client";

import { Button } from "@/components/ui/button";
import { SignIn, useUser } from "@clerk/nextjs";

export default function Home() {
  const { user, isSignedIn } = useUser();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {!isSignedIn ? (
          <SignIn routing="hash" />
        ) : (
          <div>
            <h1>Welcome, {user?.fullName}</h1>
            <p>Your User ID: {user?.id}</p>
            <Button>Click me</Button>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        footer
      </footer>
    </div>
  );
}
