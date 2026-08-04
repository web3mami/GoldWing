"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { slugify } from "@/lib/slug";
import {
  checkPassword,
  startAdminSession,
  endAdminSession,
  isAdmin,
} from "@/lib/auth";

export type ActionState = { error?: string };

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = (formData.get("password") ?? "").toString();
  if (!checkPassword(password)) {
    return { error: "Incorrect password." };
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}

export async function createTournamentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return { error: "Not authorized." };

  const name = (formData.get("name") ?? "").toString().trim();
  const description = (formData.get("description") ?? "").toString().trim();
  const prizePool = (formData.get("prize_pool") ?? "").toString().trim();
  const deadlineRaw = (formData.get("registration_deadline") ?? "").toString().trim();
  if (!name) return { error: "Tournament name is required." };

  // datetime-local gives "YYYY-MM-DDTHH:mm" (no zone). Append Z so it parses as UTC
  // deterministically on any server (local dev or Vercel).
  const deadline = deadlineRaw ? new Date(`${deadlineRaw}Z`) : null;
  if (deadline && Number.isNaN(deadline.getTime())) {
    return { error: "Registration deadline is not a valid date." };
  }

  // Build a unique slug, appending -2, -3, ... on collision.
  const base = slugify(name) || "cup";
  let slug = base;
  for (let n = 2; ; n++) {
    const existing = await sql`SELECT 1 FROM gw_tournaments WHERE slug = ${slug} LIMIT 1`;
    if (existing.length === 0) break;
    slug = `${base}-${n}`;
  }

  await sql`
    INSERT INTO gw_tournaments (name, slug, description, prize_pool, registration_deadline, status)
    VALUES (${name}, ${slug}, ${description || null}, ${prizePool || null}, ${deadline ? deadline.toISOString() : null}, 'registration')
  `;

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
