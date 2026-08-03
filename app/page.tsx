import Image from "next/image";
import Link from "next/link";
import { sql } from "@/lib/db";

type TournamentCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  reg_count: number;
};

const STATUS_LABEL: Record<string, string> = {
  registration: "Registration",
  groups: "Group stage",
  knockout: "Knockout",
  completed: "Completed",
};

const STATUS_RARITY: Record<string, string> = {
  registration: "rarity-badge",
  groups: "rarity-badge rarity-badge-rare",
  knockout: "rarity-badge rarity-badge-rare",
};

async function getLiveTournaments(): Promise<TournamentCard[]> {
  try {
    const rows = await sql`
      SELECT t.id, t.name, t.slug, t.description, t.status,
        (SELECT COUNT(*)::int FROM gw_registrations r
         WHERE r.tournament_id = t.id AND r.status = 'approved') AS reg_count
      FROM gw_tournaments t
      WHERE t.status IN ('registration', 'groups', 'knockout')
      ORDER BY t.created_at DESC
    `;
    return rows as TournamentCard[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const tournaments = await getLiveTournaments();
  const year = new Date().getFullYear();

  return (
    <div className="fut-bg flex min-h-full flex-col">
      {/* Nav */}
      <header className="relative z-10 border-b border-border/80 bg-ink/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="card-frame rounded-lg p-px">
              <div className="card-inner flex h-9 w-9 items-center justify-center rounded-[7px]">
                <Image
                  src="/goldwing-mark.svg"
                  alt=""
                  width={22}
                  height={22}
                  aria-hidden
                />
              </div>
            </div>
            <span className="font-display text-2xl font-bold tracking-wider text-broadcast">
              GOLDWING
            </span>
          </Link>
          <a href="#pack" className="btn-fut btn-fut-primary">
            Open packs
          </a>
        </div>
      </header>

      {/* Hero card */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
        <div className="card-frame max-w-2xl">
          <div className="card-inner card-shine p-8 sm:p-10">
            <span className="rarity-badge">Special · eFootball Mobile</span>

            <h1 className="font-display mt-6 text-5xl font-bold leading-none tracking-wide text-broadcast sm:text-7xl">
              GOLDWING
              <span className="mt-1 block bg-gradient-to-r from-gold-bright via-gold to-gold-dim bg-clip-text text-transparent">
                CUP {year}
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
              Build your run. Top your group. Take the bracket. No account — just
              your team name and X handle.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-sm">
              <div className="stat-block rounded-lg px-3 py-3 text-center">
                <p className="hero-stat text-3xl sm:text-4xl">3</p>
                <p className="mt-1 text-[0.625rem] font-bold uppercase tracking-widest text-muted">
                  Phases
                </p>
              </div>
              <div className="stat-block rounded-lg px-3 py-3 text-center">
                <p className="hero-stat text-3xl sm:text-4xl">2</p>
                <p className="mt-1 text-[0.625rem] font-bold uppercase tracking-widest text-muted">
                  Advance
                </p>
              </div>
              <div className="stat-block rounded-lg px-3 py-3 text-center">
                <p className="hero-stat text-3xl sm:text-4xl">1</p>
                <p className="mt-1 text-[0.625rem] font-bold uppercase tracking-widest text-muted">
                  Trophy
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#pack" className="btn-fut btn-fut-primary">
                Enter cup
              </a>
              <a href="#format" className="btn-fut btn-fut-secondary">
                Card stats
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament pack */}
      <section id="pack" className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="section-label mb-2">Your pack</p>
            <h2 className="font-display text-4xl font-bold tracking-wide text-broadcast sm:text-5xl">
              LIVE TOURNAMENTS
            </h2>
          </div>
          <span className="hidden text-xs font-bold uppercase tracking-widest text-muted sm:block">
            {tournaments.length} cards
          </span>
        </div>

        {tournaments.length === 0 ? (
          <div className="card-frame card-frame-rare max-w-md">
            <div className="card-inner card-shine p-8 text-center">
              <p className="font-display text-3xl font-bold text-muted">EMPTY PACK</p>
              <p className="mt-3 text-sm text-muted">
                No cups live right now. Next drop coming soon — follow on X.
              </p>
              <a
                href="https://x.com/web3mami"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-rare transition hover:text-gold-bright"
              >
                @web3mami →
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.slug}`}
                className={`card-frame block ${t.status !== "registration" ? "card-frame-rare" : ""}`}
              >
                <div className="card-inner card-shine flex h-full min-h-[220px] flex-col p-6">
                  <div className="flex items-start justify-between gap-2">
                    <span className={STATUS_RARITY[t.status] ?? "rarity-badge"}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                    <div className="text-right">
                      <p className="hero-stat text-4xl">{t.reg_count}</p>
                      <p className="text-[0.625rem] font-bold uppercase tracking-widest text-muted">
                        OVR entries
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <h3 className="font-display text-2xl font-bold leading-tight tracking-wide text-broadcast">
                      {t.name}
                    </h3>
                    {t.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                        {t.description}
                      </p>
                    )}
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gold-bright">
                      Select card →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Format / card stats */}
      <section id="format" className="relative z-10 border-t border-border/60 bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="section-label mb-8">Card progression</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "01", title: "Register", stat: "Entry", desc: "Team + X handle" },
              { step: "02", title: "Groups", stat: "Form", desc: "Round robin, top 2" },
              { step: "03", title: "Knockout", stat: "Elite", desc: "Win or out" },
            ].map((c) => (
              <div key={c.step} className="format-step">
                <div className="format-step-inner">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-bold text-gold-dim">
                      {c.step}
                    </span>
                    <span className="rarity-badge">{c.stat}</span>
                  </div>
                  <h3 className="font-display mt-4 text-2xl font-bold text-broadcast">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center">
          <span className="font-display text-lg font-bold tracking-widest text-muted">
            GOLDWING {year}
          </span>
          <a
            href="https://x.com/web3mami"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-widest text-muted transition hover:text-gold-bright"
          >
            @web3mami
          </a>
        </div>
      </footer>
    </div>
  );
}
