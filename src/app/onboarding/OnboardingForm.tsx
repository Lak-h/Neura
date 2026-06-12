"use client";

import { useActionState } from "react";
import { createOrgAction, type OnboardingState } from "./actions";

export function OnboardingForm() {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(createOrgAction, {});

  return (
    <form action={action} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="label">Organisation name</label>
        <input
          id="name" name="name" type="text" required
          placeholder="Acme Robotics" className="input"
          aria-invalid={Boolean(state.error)}
        />
        {state.error && <p className="field-error">{state.error}</p>}
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Creating workspace…" : "Create workspace →"}
      </button>
      <p className="text-center text-xs" style={{ color: "var(--faint)" }}>
        Starts on the free Starter tier — 10k AI credits included.
      </p>
    </form>
  );
}
