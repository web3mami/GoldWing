"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

async function revalidateBoth(slug: string) {
  revalidatePath(`/admin/tournaments/${slug}`);
  revalidatePath(`/tournaments/${slug}`);
  revalidatePath("/");
}

export type UpdateState = { error?: string; ok?: boolean };

/** Edit a tournament's details. The URL slug stays fixed so shared links keep working. */
export async function updateTournament(
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  if (!(await isAdmin())) return { error: "Not authorized." };

  const slug = (formData.get("slug") ?? "").toString();
  const name = (formData.get("name") ?? "").toString().trim();
  const description = (formData.get("description") ?? "").toString().trim();
  const advanceRaw = (formData.get("advance_per_group") ?? "").toString();
  const advance = Number.parseInt(advanceRaw, 10);

  if (!name) return { error: "Tournament name is required." };
  if (name.length > 80) return { error: "Name is too long (max 80)." };
  if (!Number.isInteger(advance) || advance < 1 || advance > 8) {
    return { error: "Advance per group must be between 1 and 8." };
  }

  await sql`
    UPDATE gw_tournaments
    SET name = ${name},
        description = ${description || null},
        advance_per_group = ${advance}
    WHERE slug = ${slug}
  `;

  await revalidateBoth(slug);
  return { ok: true };
}

/** Set a registration's status. slug is passed so we can revalidate the right pages. */
export async function setRegistrationStatus(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const id = (formData.get("registration_id") ?? "").toString();
  const status = (formData.get("status") ?? "").toString();
  const slug = (formData.get("slug") ?? "").toString();

  if (!id || !["approved", "rejected", "pending"].includes(status)) return;

  await sql`UPDATE gw_registrations SET status = ${status} WHERE id = ${id}`;
  await revalidateBoth(slug);
}

/** Close registration -> move the tournament into the groups phase. */
export async function closeRegistration(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const slug = (formData.get("slug") ?? "").toString();
  await sql`
    UPDATE gw_tournaments SET status = 'groups'
    WHERE slug = ${slug} AND status = 'registration'
  `;
  await revalidateBoth(slug);
}

/** Reopen registration (back to the registration phase). */
export async function reopenRegistration(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const slug = (formData.get("slug") ?? "").toString();
  await sql`
    UPDATE gw_tournaments SET status = 'registration'
    WHERE slug = ${slug} AND status = 'groups'
  `;
  await revalidateBoth(slug);
}
