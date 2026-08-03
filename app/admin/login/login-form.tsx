"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "../actions";

const initialState: ActionState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="section-label mb-2 block"
        >
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-broadcast outline-none transition focus:border-gold-bright"
          placeholder="Enter your secret password"
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
        {pending ? "Checking…" : "Unlock dashboard"}
      </button>
    </form>
  );
}
