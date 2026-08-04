import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import RegisterForm from "./register-form";
import Countdown from "./countdown";
import KickIntro from "./kick-intro";

type Tournament = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  prize_pool: string | null;
  registration_deadline: string | null;
  status: string;
  advance_per_group: number;
};

type Entry = {
  team_name: string;
  x_username: string;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  registration: "Registration open",
  groups: "Group stage",
  knockout: "Knockout",
  completed: "Completed",
};

async function getTournament(slug: string): Promise<Tournament | null> {
  const rows = await sql`
    SELECT id, name, slug, description, prize_pool, registration_deadline, status, advance_per_group
    FROM gw_tournaments WHERE slug = ${slug} LIMIT 1
  `;
  return (rows[0] as Tournament) ?? null;
}

async function getEntries(tournamentId: string): Promise<Entry[]> {
  const rows = await sql`
    SELECT team_name, x_username, status
    FROM gw_registrations
    WHERE tournament_id = ${tournamentId} AND status IN ('pending', 'approved')
    ORDER BY created_at ASC
  `;
  return rows as Entry[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTournament(slug);
  return { title: t ? `${t.name} · GoldWing` : "Tournament · GoldWing" };
}

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tournament = await getTournament(slug);
  if (!tournament) notFound();

  const entries = await getEntries(tournament.id);
  const approved = entries.filter((e) => e.status === "approved");
  const isOpen = tournament.status === "registration";

  return (
    <div className="fut-bg flex min-h-full flex-col">
      <KickIntro slug={tournament.slug} />

      {/* Nav */}
      <header className="relative z-10 border-b border-border/80 bg-ink/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="card-frame rounded-lg p-px">
              <div className="card-inner flex h-9 w-9 items-center justify-center rounded-[7px]">
                <Image src="/goldwing-mark.svg" alt="" width={22} height={22} aria-hidden />
              </div>
            </div>
            <span className="font-display text-2xl font-bold tracking-wider text-broadcast">
              GOLDWING
            </span>
          </Link>
          <Link href="/" className="btn-fut btn-fut-secondary">
            All cups
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 px-5 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
        {/* Left: tournament info + entries */}
        <div>
          <span className="rarity-badge">
            {STATUS_LABEL[tournament.status] ?? tournament.status}
          </span>
          <h1 className="font-display mt-4 text-4xl font-bold leading-none tracking-wide text-broadcast sm:text-6xl">
            {tournament.name}
          </h1>
          {tournament.description && (
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
              {tournament.description}
            </p>
          )}

          {/* Prize pool — neon showpiece */}
          {tournament.prize_pool && (
            <div className="prize-neon mt-6 max-w-md">
              <div className="prize-neon-inner">
                <span className="prize-trophy">🏆</span>
                <div>
                  <p className="prize-label">Prize pool</p>
                  <p className="prize-value sm:text-4xl">{tournament.prize_pool}</p>
                </div>
              </div>
            </div>
          )}

          {/* Countdown */}
          {tournament.registration_deadline && (
            <div className="mt-6 rounded-xl border border-border bg-surface/60 p-4 sm:p-5">
              <p className="section-label mb-3">
                {tournament.status === "registration"
                  ? "Registration closes in"
                  : "Registration deadline passed"}
              </p>
              <Countdown deadlineIso={tournament.registration_deadline} />
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <div className="stat-block flex-1 rounded-lg px-4 py-3 text-center sm:flex-none sm:px-5">
              <p className="hero-stat text-3xl sm:text-4xl">{approved.length}</p>
              <p className="mt-1 text-[0.625rem] font-bold uppercase tracking-widest text-muted">
                Confirmed
              </p>
            </div>
            <div className="stat-block flex-1 rounded-lg px-4 py-3 text-center sm:flex-none sm:px-5">
              <p className="hero-stat text-3xl sm:text-4xl">{tournament.advance_per_group}</p>
              <p className="mt-1 text-[0.625rem] font-bold uppercase tracking-widest text-muted">
                Advance / group
              </p>
            </div>
          </div>

          {/* Confirmed entries */}
          <div className="mt-10">
            <p className="section-label mb-4">Confirmed squads</p>
            {approved.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface/40 p-6 text-sm text-muted">
                No confirmed squads yet. Approved entries appear here.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {approved.map((e) => (
                  <li
                    key={e.x_username}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
                  >
                    <span className="font-semibold text-broadcast">{e.team_name}</span>
                    <span className="text-xs text-muted">{e.x_username}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: registration */}
        <aside>
          <div className="card-frame sticky top-24">
            {isOpen ? (
              <div className="card-inner card-shine p-6">
                <p className="section-label mb-2">Enter the cup</p>
                <h2 className="font-display mb-1 text-2xl font-bold text-broadcast">
                  REGISTER YOUR SQUAD
                </h2>
                <p className="mb-6 text-xs text-muted">
                  No account needed. Team name + X handle and you&apos;re in.
                </p>
                <RegisterForm slug={tournament.slug} />
              </div>
            ) : (
              <div className="card-inner p-6 text-center">
                <p className="rarity-badge">Registration closed</p>
                <h2 className="font-display mt-4 text-2xl font-bold text-broadcast">
                  ENTRIES LOCKED
                </h2>
                <p className="mt-2 text-sm text-muted">
                  This cup has moved past the registration phase.
                </p>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
