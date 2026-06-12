"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthFormState } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(loginAction, {});

  return (
    <div className="card-raised p-8">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mb-7 text-sm" style={{ color: "var(--muted)" }}>
        Sign in to your Neuraxis workspace.
      </p>

      <form action={action} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email" name="email" type="email" autoComplete="email" required
            placeholder="you@company.com" className="input"
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          {state.fieldErrors?.email && <p className="field-error">{state.fieldErrors.email[0]}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">Password</label>
            <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: "var(--brand-bright)" }}>
              Forgot?
            </Link>
          </div>
          <input
            id="password" name="password" type="password" autoComplete="current-password" required
            placeholder="••••••••••" className="input"
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
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
        New to Neuraxis?{" "}
        <Link href="/register" className="font-medium hover:underline" style={{ color: "var(--brand-bright)" }}>
          Create an account
        </Link>
      </p>

      <p className="mt-4 text-center text-xs" style={{ color: "var(--faint)" }}>
        Demo: olivia@acme.dev / password123
      </p>
    </div>
  );
}
