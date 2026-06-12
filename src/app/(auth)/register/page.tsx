"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthFormState } from "../actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(registerAction, {});

  return (
    <div className="card-raised p-8">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Create your account</h1>
      <p className="mb-7 text-sm" style={{ color: "var(--muted)" }}>
        14-day free trial on Growth. No credit card required.
      </p>

      <form action={action} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input
            id="name" name="name" type="text" autoComplete="name" required
            placeholder="Ada Lovelace" className="input"
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          {state.fieldErrors?.name && <p className="field-error">{state.fieldErrors.name[0]}</p>}
        </div>

        <div>
          <label htmlFor="email" className="label">Work email</label>
          <input
            id="email" name="email" type="email" autoComplete="email" required
            placeholder="you@company.com" className="input"
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          {state.fieldErrors?.email && <p className="field-error">{state.fieldErrors.email[0]}</p>}
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password" name="password" type="password" autoComplete="new-password" required
            placeholder="10+ chars, 1 uppercase, 1 number" className="input"
            aria-invalid={Boolean(state.fieldErrors?.password)}
          />
          {state.fieldErrors?.password && <p className="field-error">{state.fieldErrors.password[0]}</p>}
        </div>

        {state.error && (
          <div
            role="alert"
            className="rounded-lg px-3.5 py-2.5 text-sm"
            style={{ background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.25)", color: "var(--danger)" }}
          >
            {state.error}
          </div>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--brand-bright)" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
