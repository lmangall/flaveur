// Demo users for sample flavors and testing
// These users own sample/example flavors shown in /samples
// Must match the users created by scripts/seed-demo-users.ts

export const DEMO_USERS = [
  {
    user_id: "demo_arthur_dent",
    email: "arthur.dent@example.com",
    username: "Arthur Dent",
  },
  {
    user_id: "demo_ford_prefect",
    email: "ford.prefect@example.com",
    username: "Ford Prefect",
  },
  {
    user_id: "demo_trillian",
    email: "trillian@example.com",
    username: "Trillian",
  },
] as const;

// Primary demo user (for backwards compatibility)
export const DEMO_USER = DEMO_USERS[0];

export type DemoUserId = (typeof DEMO_USERS)[number]["user_id"];

export const isDemoUser = (userId: string): boolean =>
  DEMO_USERS.some((u) => u.user_id === userId);
