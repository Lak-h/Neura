import Link from "next/link";
import { features } from "@/lib/env";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div className="card-raised p-8">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Reset your password</h1>
      {features.resend ? (
        <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
          Use the magic-link option on the sign-in page — we&apos;ll email you a one-time
          link that signs you in without a password.
        </p>
      ) : (
        <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
          Email isn&apos;t configured on this deployment yet (set <code className="font-mono">RESEND_API_KEY</code>),
          so self-service reset is unavailable. Ask a workspace owner to help, or — on the local
          demo — use the seeded credentials from the README.
        </p>
      )}
      <Link href="/login" className="btn-secondary w-full">Back to sign in</Link>
    </div>
  );
}
