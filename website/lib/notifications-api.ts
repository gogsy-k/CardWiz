import { authedFetch } from "@/lib/auth";

export type Notif = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export async function getNotifications(): Promise<{ items: Notif[]; unread: number }> {
  const res = await authedFetch("/notifications");
  if (!res.ok) throw new Error(`Notifications failed (${res.status})`);
  return res.json();
}

export async function markNotificationsRead(): Promise<void> {
  await authedFetch("/notifications/read", { method: "POST" });
}
