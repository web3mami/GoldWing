"use client";

import { useActionState } from "react";
import { createTournamentAction, type ActionState } from "./actions";

const initialState: ActionState = {};

export default function CreateTournamentForm() {
  const [state, action, pending] = useActionState(
    createTournamentAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="section-label mb-2 block">
          Tournament name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={80}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-gold-bright"
          placeholder="e.g. GoldWing Summer Cup"
        />
      </div>

      <div>
        <label htmlFor="description" className="section-label mb-2 block">
          Description <span className="normal-case text-muted">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-gold-bright"
          placeholder="Rules, format notes, or anything players should know."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prize_pool" className="section-label mb-2 block">
            Prize pool <span className="normal-case text-muted">(optional)</span>
          </label>
          <input
            id="prize_pool"
            name="prize_pool"
            type="text"
            maxLength={60}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-gold-bright"
            placeholder="e.g. $100 + trophy"
          />
        </div>
        <div>
          <label htmlFor="registration_deadline" className="section-label mb-2 block">
            Registration closes <span className="normal-case text-muted">(optional)</span>
          </label>
          <input
            id="registration_deadline"
            name="registration_deadline"
            type="datetime-local"
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-gold-bright [color-scheme:dark]"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-fut btn-fut-primary disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create tournament"}
      </button>
    </form>
  );
}
