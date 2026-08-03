import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "./actions";
import CreateTournamentForm from "./create-form";

export const metadata = { title: "Dashboard · GoldWing Admin" };

type Row = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  reg_count: number;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  registration: "Registration",
  groups: "Group stage",
  knockout: "Knockout",
  completed: "Completed",
};

async function getTournaments(): Promise<Row[]> {
  const rows = await sql`
    SELECT t.id, t.name, t.slug, t.status, t.created_at,
      (SELECT COUNT(*)::int FROM gw_registrations r WHERE r.tournament_id = t.id) AS reg_count
    FROM gw_tournaments t
    ORDER BY t.created_at DESC
  `;
  return rows as Row[];
}

export default async function AdminDashboard() {
  if (!(await isAdmin())) redirect("/admin/login");

  const tournaments = await getTournaments();

  return (
    <div className="fut-bg flex min-h-full flex-col">
      {/* Header */}
      <header className="relative z-10 border-b border-border/80 bg-ink/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="card-frame rounded-lg p-px">
              <div className="card-inner flex h-9 w-9 items-center justify-center rounded-[7px]">
                <Image src="/goldwing-mark.svg" alt="" width={22} height={22} aria-hidden />
              </div>
            </div>
            <span className="font-display text-2xl font-bold tracking-wider text-broadcast">
              GOLDWING
            </span>
            <span className="rarity-badge">Admin</span>
          </Link>
          <form action={logoutAction}>
            <button className="btn-fut btn-fut-secondary">Log out</button>
          </form>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-6 py-10">
        {/* Create */}
        <section className="card-frame mb-12">
          <div className="card-inner card-shine p-8">
            <p className="section-label mb-2">New card</p>
            <h1 className="font-display mb-1 text-3xl font-bold tracking-wide text-broadcast">
              CREATE A TOURNAMENT
            </h1>
            <p className="mb-6 text-sm text-muted">
              It opens in registration mode and appears on the homepage right away.
            </p>
            <CreateTournamentForm />
          </div>
        </section>

        {/* List */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="section-label mb-2">Your pack</p>
              <h2 className="font-display text-3xl font-bold tracking-wide text-broadcast">
                TOURNAMENTS
              </h2>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted">
              {tournaments.length} cards
            </span>
          </div>

          {tournaments.length === 0 ? (
            <div className="card-frame max-w-md">
              <div className="card-inner p-8 text-center">
                <p className="font-display text-2xl font-bold text-muted">EMPTY PACK</p>
                <p className="mt-2 text-sm text-muted">
                  No tournaments yet. Create your first one above.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {tournaments.map((t) => (
                <li key={t.id} className="card-frame">
                  <div className="card-inner flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="hero-stat text-3xl">{t.reg_count}</p>
                        <p className="text-[0.625rem] font-bold uppercase tracking-widest text-muted">
                          Entries
                        </p>
                      </div>
                      <div>
                        <p className="font-display text-xl font-bold text-broadcast">
                          {t.name}
                        </p>
                        <span className="rarity-badge mt-1 inline-block">
                          {STATUS_LABEL[t.status] ?? t.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/tournaments/${t.slug}`}
                        className="btn-fut btn-fut-secondary !px-4 !py-2"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/tournaments/${t.slug}`}
                        className="btn-fut btn-fut-primary !px-4 !py-2"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
