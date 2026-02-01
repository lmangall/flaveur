// Dev-only endpoint to impersonate demo users
import { cookies } from "next/headers";

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not allowed", { status: 403 });
  }

  const { userId } = await req.json();
  const cookieStore = await cookies();
  cookieStore.set("dev_impersonate", userId);
  return new Response("OK");
}

export async function DELETE() {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not allowed", { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.delete("dev_impersonate");
  return new Response("OK");
}
