"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

export type RegisterState = { error?: string; ok?: boolean };

/** Normalize an X handle: strip URL/@, lowercase, keep a single leading @. */
function normalizeHandle(raw: string): string {
  let h = raw.trim();
  h = h.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "");
  h = h.replace(/^@+/, "").replace(/\/.*$/, "").trim().toLowerCase();
  return h ? `@${h}` : "";
}

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const slug = (formData.get("slug") ?? "").toString();
  const teamName = (formData.get("team_name") ?? "").toString().trim();
  const xUsername = normalizeHandle((formData.get("x_username") ?? "").toString());
  const efootballId = (formData.get("efootball_id") ?? "").toString().trim();

  if (!teamName) return { error: "Team name is required." };
  if (teamName.length > 60) return { error: "Team name is too long (max 60)." };
  if (!xUsername || xUsername.length < 2) {
    return { error: "A valid X username is required." };
  }
  if (!/^@[a-z0-9_]{1,15}$/.test(xUsername)) {
    return { error: "That doesn't look like a valid X handle." };
  }

  const rows = await sql`
    SELECT id, status FROM gw_tournaments WHERE slug = ${slug} LIMIT 1
  `;
  const tournament = rows[0] as { id: string; status: string } | undefined;
  if (!tournament) return { error: "Tournament not found." };
  if (tournament.status !== "registration") {
    return { error: "Registration for this cup is closed." };
  }

  try {
    await sql`
      INSERT INTO gw_registrations (tournament_id, team_name, x_username, efootball_id, status)
      VALUES (${tournament.id}, ${teamName}, ${xUsername}, ${efootballId || null}, 'pending')
    `;
  } catch (err) {
    // 23505 = unique_violation on (tournament_id, x_username)
    const message = err instanceof Error ? err.message : "";
    if (message.includes("gw_registrations") || message.includes("duplicate") || message.includes("23505")) {
      return { error: "That X username is already registered for this cup." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/tournaments/${slug}`);
  return { ok: true };
}
