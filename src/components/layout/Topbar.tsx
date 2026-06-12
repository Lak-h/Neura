import { Zap } from "lucide-react";
import { signOut, auth } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";

export async function Topbar({
  orgName,
  credits,
  role,
}: {
  orgName: string;
  credits: number;
  role: string;
}) {
  const session = await auth();
  const userLabel = session?.user?.name ?? session?.user?.email ?? "Account";

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center justify-between border-b px-6 backdrop-blur-xl"
      style={{ borderColor: "var(--border)", background: "rgba(246,246,242,.82)" }}
    >
      <div className="flex items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
        <span className="font-medium" style={{ color: "var(--foreground)" }}>{orgName}</span>
        <span className="badge font-mono text-[10px] uppercase tracking-[.14em]">{role}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Credits */}
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs font-semibold"
          style={{
            background: "rgba(39,66,255,.07)",
            border: "1px solid rgba(39,66,255,.22)",
            color: "var(--brand)",
          }}
          title={`${credits.toLocaleString()} AI credits remaining`}
        >
          <Zap size={12} aria-hidden />
          {formatNumber(credits)} credits
        </span>

        <span className="hidden text-sm sm:block" style={{ color: "var(--muted)" }}>{userLabel}</span>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="btn-ghost text-xs">Sign out</button>
        </form>
      </div>
    </header>
  );
}
