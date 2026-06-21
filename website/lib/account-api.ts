import { authedFetch } from "@/lib/auth";

export async function getEmailPrefs(): Promise<{ emailReports: boolean }> {
  const res = await authedFetch("/account/email-prefs");
  if (!res.ok) throw new Error("Failed to fetch email prefs");
  return res.json();
}

export async function updateEmailPrefs(enabled: boolean): Promise<void> {
  const res = await authedFetch("/account/email-prefs", {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
  if (res.status === 403) throw new Error("premium_required");
  if (!res.ok) throw new Error("Failed to update email prefs");
}
