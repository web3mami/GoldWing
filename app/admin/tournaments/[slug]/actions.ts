"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

async function revalidateBoth(slug: string) {
  revalidatePath(`/admin/tournaments/${slug}`);
  revalidatePath(`/tournaments/${slug}`);
  revalidatePath("/");
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
