// Demo user for sample flavors
// This user owns all sample/example flavors that are shown in /samples

export const DEMO_USER = {
  user_id: "demo_arthur_dent",
  email: "arthur.dent@example.com",
  username: "Arthur Dent",
} as const;

export type DemoUserId = typeof DEMO_USER.user_id;

export const isDemoUser = (userId: string): boolean =>
  userId === DEMO_USER.user_id;
