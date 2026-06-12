import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/shared/Logo";

export const metadata = { title: "Changelog" };
export const dynamic = "force-dynamic";

export default async function ChangelogPage() {
  const entries = await prisma.changelog.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-10 flex items-center justify-between">
        <Logo size="sm" />
        <Link href="/" className="btn-ghost text-[13px]">
          <ArrowLeft size={14} aria-hidden /> Home
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
        Everything new in Neuraxis.
      </p>

      <div className="mt-10 space-y-10">
        {entries.map((e) => (
          <article key={e.id} className="relative border-l pl-6" style={{ borderColor: "var(--border)" }}>
            <span
              className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--brand)" }}
              aria-hidden
            />
            <div className="flex items-baseline gap-3">
              <span className="badge font-mono">{e.version}</span>
              <time className="text-[12px]" style={{ color: "var(--faint)" }} dateTime={e.publishedAt.toISOString()}>
                {e.publishedAt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </time>
            </div>
            <h2 className="mt-2 text-lg font-semibold">{e.title}</h2>
            <div className="mt-2 space-y-1 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {e.contentMdx.split("\n").map((line, i) => (
                <p key={i}>{line.replace(/^- /, "• ")}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
