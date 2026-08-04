"use client";

import { useActionState } from "react";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegisterForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(registerAction, initialState);

  if (state.ok) {
    return (
      <div className="card-inner p-6 text-center">
        <p className="rarity-badge rarity-badge-rare">Entry submitted</p>
        <h3 className="font-display mt-4 text-2xl font-bold text-broadcast">
          YOU&apos;RE IN THE PACK
        </h3>
        <p className="mt-2 text-sm text-muted">
          Your entry is pending admin approval. Watch @web3mami on X for the group
          draw once registration closes.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />

      <div>
        <label htmlFor="team_name" className="section-label mb-2 block">
          Team name
        </label>
        <input
          id="team_name"
          name="team_name"
          type="text"
          required
          maxLength={60}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-primary-bright"
          placeholder="e.g. Golden Boot FC"
        />
      </div>

      <div>
        <label htmlFor="x_username" className="section-label mb-2 block">
          X username
        </label>
        <input
          id="x_username"
          name="x_username"
          type="text"
          required
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-primary-bright"
          placeholder="@yourhandle"
        />
      </div>

      <div>
        <label htmlFor="efootball_id" className="section-label mb-2 block">
          eFootball ID <span className="normal-case text-muted">(optional)</span>
        </label>
        <input
          id="efootball_id"
          name="efootball_id"
          type="text"
          maxLength={40}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-primary-bright"
          placeholder="So opponents can add you in-game"
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-fut btn-fut-primary w-full disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Enter the cup"}
      </button>
    </form>
  );
}
