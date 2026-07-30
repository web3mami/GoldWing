import Link from "next/link";
import { sql } from "@/lib/db";

type TournamentCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  registration: "Registration open",
  groups: "Group stage",
  knockout: "Knockout",
  completed: "Completed",
};

async function getLiveTournaments(): Promise<TournamentCard[]> {
  const rows = await sql`
    SELECT id, name, slug, description, status
    FROM gw_tournaments
    WHERE status IN ('registration', 'groups', 'knockout')
    ORDER BY created_at DESC
  `;
  return rows as TournamentCard[];
}

export default async function Home() {
  const tournaments = await getLiveTournaments();

  return (
    <>
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="text-gold">◆</span>
            <span className="text-lg">
              Gold<span className="text-gold">Wing</span>
            </span>
          </Link>
          <a
            href="#tournaments"
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft"
          >
            Join a cup
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-glow relative">
        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:py-32">
          <p className="mb-4 inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-widest text-gold">
            eFootball Mobile
          </p>
          <h1 className="text-balance text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">
            The <span className="text-gold">GoldWing</span> Cup
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted">
            Group stage into knockout. Bring your squad, climb your group, and
            fight through the bracket to lift the trophy.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#tournaments"
              className="rounded-full bg-gold px-6 py-3 font-semibold text-ink transition hover:bg-gold-soft"
            >
              View tournaments
            </a>
            <a
              href="#how"
              className="rounded-full border border-border px-6 py-3 font-semibold transition hover:border-gold hover:text-gold"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
          How the cup runs
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Register",
              body: "Enter with your team name and X handle. No account, no password — you're in.",
            },
            {
              step: "02",
              title: "Group stage",
              body: "You're drawn into a group and play everyone once. Win = 3, draw = 1. Top 2 advance.",
            },
            {
              step: "03",
              title: "Knockout",
              body: "Qualifiers enter a single-elimination bracket. Win or go home, all the way to the final.",
            },
          ].map((c) => (
            <div
              key={c.step}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <div className="mb-3 font-mono text-sm text-gold-dark">{c.step}</div>
              <h3 className="mb-2 text-lg font-semibold">{c.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tournaments */}
      <section id="tournaments" className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
          Tournaments
        </h2>

        {tournaments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <p className="text-lg font-semibold">No cups live right now</p>
            <p className="mt-2 text-sm text-muted">
              The next GoldWing cup is being prepared. Follow along on X so you
              don&apos;t miss the drop.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {tournaments.map((t) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.slug}`}
                className="group rounded-2xl border border-border bg-surface p-6 transition hover:border-gold"
              >
                <div className="mb-3 inline-block rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-gold">
                  {STATUS_LABEL[t.status] ?? t.status}
                </div>
                <h3 className="text-xl font-semibold group-hover:text-gold">
                  {t.name}
                </h3>
                {t.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {t.description}
                  </p>
                )}
                <span className="mt-4 inline-block text-sm font-medium text-gold">
                  View cup →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row">
          <span>
            © {new Date().getFullYear()} Gold<span className="text-gold">Wing</span>
          </span>
          <a
            href="https://x.com/web3mami"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-gold"
          >
            Follow on X
          </a>
        </div>
      </footer>
    </>
  );
}
