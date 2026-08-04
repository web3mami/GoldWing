import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import {
  setRegistrationStatus,
  closeRegistration,
  reopenRegistration,
} from "./actions";
import EditForm from "./edit-form";

type Tournament = {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  prize_pool: string | null;
  registration_deadline: string | null;
  advance_per_group: number;
};

type Registration = {
  id: string;
  team_name: string;
  x_username: string;
  efootball_id: string | null;
  status: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  registration: "Registration open",
  groups: "Group stage",
  knockout: "Knockout",
  completed: "Completed",
};

async function getTournament(slug: string): Promise<Tournament | null> {
  const rows = await sql`
    SELECT id, name, slug, status, description, prize_pool, registration_deadline, advance_per_group
    FROM gw_tournaments WHERE slug = ${slug} LIMIT 1
  `;
  return (rows[0] as Tournament) ?? null;
}

async function getRegistrations(tournamentId: string): Promise<Registration[]> {
  const rows = await sql`
    SELECT id, team_name, x_username, efootball_id, status, created_at
    FROM gw_registrations
    WHERE tournament_id = ${tournamentId}
    ORDER BY created_at ASC
  `;
  return rows as Registration[];
}

export const metadata = { title: "Manage · GoldWing Admin" };

export default async function ManageTournament({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { slug } = await params;
  const tournament = await getTournament(slug);
  if (!tournament) notFound();

  const regs = await getRegistrations(tournament.id);
  const pending = regs.filter((r) => r.status === "pending");
  const approved = regs.filter((r) => r.status === "approved");
  const rejected = regs.filter((r) => r.status === "rejected");
  const isOpen = tournament.status === "registration";

  return (
    <div className="fut-bg flex min-h-full flex-col">
      {/* Header */}
      <header className="relative z-10 border-b border-border/80 bg-ink/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-muted transition hover:text-primary-bright">
            ← Dashboard
          </Link>
          <Link href={`/tournaments/${slug}`} className="btn-fut btn-fut-secondary">
            View public page
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-6 py-10">
        {/* Title + phase control */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="rarity-badge">{STATUS_LABEL[tournament.status] ?? tournament.status}</span>
            <h1 className="font-display mt-3 text-4xl font-bold tracking-wide text-broadcast">
              {tournament.name}
            </h1>
          </div>
          {isOpen ? (
            <form action={closeRegistration}>
              <input type="hidden" name="slug" value={slug} />
              <button className="btn-fut btn-fut-primary">Close registration</button>
            </form>
          ) : tournament.status === "groups" ? (
            <form action={reopenRegistration}>
              <input type="hidden" name="slug" value={slug} />
              <button className="btn-fut btn-fut-secondary">Reopen registration</button>
            </form>
          ) : null}
        </div>

        {/* Edit details */}
        <div className="mb-10">
          <EditForm
            slug={tournament.slug}
            name={tournament.name}
            description={tournament.description}
            prizePool={tournament.prize_pool}
            registrationDeadline={tournament.registration_deadline}
            advancePerGroup={tournament.advance_per_group}
          />
        </div>

        {/* Stat row */}
        <div className="mb-10 grid grid-cols-3 gap-3 sm:max-w-md">
          {[
            { n: pending.length, label: "Pending" },
            { n: approved.length, label: "Approved" },
            { n: rejected.length, label: "Rejected" },
          ].map((s) => (
            <div key={s.label} className="stat-block rounded-lg px-3 py-3 text-center">
              <p className="hero-stat text-3xl">{s.n}</p>
              <p className="mt-1 text-[0.625rem] font-bold uppercase tracking-widest text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Pending — needs action */}
        <RegSection
          title="Pending approval"
          empty="No pending registrations right now."
          regs={pending}
          slug={slug}
          actions={["approve", "reject"]}
        />

        {/* Approved */}
        <RegSection
          title="Approved squads"
          empty="No approved squads yet."
          regs={approved}
          slug={slug}
          actions={["reject"]}
        />

        {/* Rejected */}
        {rejected.length > 0 && (
          <RegSection
            title="Rejected"
            empty=""
            regs={rejected}
            slug={slug}
            actions={["approve"]}
          />
        )}
      </main>
    </div>
  );
}

function RegSection({
  title,
  empty,
  regs,
  slug,
  actions,
}: {
  title: string;
  empty: string;
  regs: Registration[];
  slug: string;
  actions: ("approve" | "reject")[];
}) {
  return (
    <section className="mb-10">
      <p className="section-label mb-4">
        {title} <span className="text-muted">({regs.length})</span>
      </p>
      {regs.length === 0 ? (
        empty ? (
          <p className="rounded-lg border border-dashed border-border bg-surface/40 p-5 text-sm text-muted">
            {empty}
          </p>
        ) : null
      ) : (
        <ul className="space-y-3">
          {regs.map((r) => (
            <li key={r.id} className="card-frame">
              <div className="card-inner flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-display text-xl font-bold text-broadcast">
                    {r.team_name}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    <a
                      href={`https://x.com/${r.x_username.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rare transition hover:text-primary-bright"
                    >
                      {r.x_username}
                    </a>
                    {r.efootball_id && (
                      <span className="ml-3 text-muted">ID: {r.efootball_id}</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  {actions.includes("approve") && (
                    <form action={setRegistrationStatus}>
                      <input type="hidden" name="registration_id" value={r.id} />
                      <input type="hidden" name="status" value="approved" />
                      <input type="hidden" name="slug" value={slug} />
                      <button className="btn-fut btn-fut-primary !px-4 !py-2">
                        Approve
                      </button>
                    </form>
                  )}
                  {actions.includes("reject") && (
                    <form action={setRegistrationStatus}>
                      <input type="hidden" name="registration_id" value={r.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <input type="hidden" name="slug" value={slug} />
                      <button className="btn-fut btn-fut-secondary !px-4 !py-2">
                        Reject
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
