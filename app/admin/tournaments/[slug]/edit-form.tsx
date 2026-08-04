"use client";

import { useActionState } from "react";
import { updateTournament, type UpdateState } from "./actions";

const initialState: UpdateState = {};

type Props = {
  slug: string;
  name: string;
  description: string | null;
  prizePool: string | null;
  registrationDeadline: string | null; // ISO string or null
  advancePerGroup: number;
};

// Convert a stored ISO timestamp to the "YYYY-MM-DDTHH:mm" datetime-local needs (UTC).
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

export default function EditForm({
  slug,
  name,
  description,
  prizePool,
  registrationDeadline,
  advancePerGroup,
}: Props) {
  const [state, action, pending] = useActionState(updateTournament, initialState);

  return (
    <details className="card-frame group">
      <summary className="card-inner flex cursor-pointer items-center justify-between p-5 [&::-webkit-details-marker]:hidden">
        <span className="font-display text-lg font-bold text-broadcast">
          Edit details
        </span>
        <span className="text-sm text-muted transition group-open:rotate-180">▾</span>
      </summary>

      <div className="border-t border-border/60 px-5 pb-5 pt-4">
        <form action={action} className="space-y-4">
          <input type="hidden" name="slug" value={slug} />

          <div>
            <label htmlFor="edit-name" className="section-label mb-2 block">
              Tournament name
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              required
              maxLength={80}
              defaultValue={name}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-gold-bright"
            />
          </div>

          <div>
            <label htmlFor="edit-desc" className="section-label mb-2 block">
              Description <span className="normal-case text-muted">(optional)</span>
            </label>
            <textarea
              id="edit-desc"
              name="description"
              rows={3}
              maxLength={500}
              defaultValue={description ?? ""}
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-gold-bright"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-prize" className="section-label mb-2 block">
                Prize pool <span className="normal-case text-muted">(optional)</span>
              </label>
              <input
                id="edit-prize"
                name="prize_pool"
                type="text"
                maxLength={60}
                defaultValue={prizePool ?? ""}
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-gold-bright"
                placeholder="e.g. $100 + trophy"
              />
            </div>
            <div>
              <label htmlFor="edit-deadline" className="section-label mb-2 block">
                Registration closes <span className="normal-case text-muted">(optional)</span>
              </label>
              <input
                id="edit-deadline"
                name="registration_deadline"
                type="datetime-local"
                defaultValue={toLocalInput(registrationDeadline)}
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-gold-bright [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-advance" className="section-label mb-2 block">
              Advance per group
            </label>
            <input
              id="edit-advance"
              name="advance_per_group"
              type="number"
              min={1}
              max={8}
              required
              defaultValue={advancePerGroup}
              className="w-32 rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-gold-bright"
            />
            <p className="mt-1.5 text-xs text-muted">
              How many top squads from each group reach the knockout.
            </p>
          </div>

          {state.error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {state.error}
            </p>
          )}
          {state.ok && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              Saved.
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-fut btn-fut-primary disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </details>
  );
}
