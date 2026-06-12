import { BookOpen, FileText } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Knowledge" };

export default async function KnowledgePage() {
  const ctx = await requireOrg();

  const kbs = await prisma.knowledgeBase.findMany({
    where: { orgId: ctx.orgId, deletedAt: null },
    include: {
      documents: {
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, sourceType: true, parentId: true, updatedAt: true },
      },
      agents: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            The documents your agents draw answers from. Rich editor + embeddings pipeline land next pass.
          </p>
        </div>
      </div>

      {kbs.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-20 text-center">
          <BookOpen size={36} style={{ color: "var(--faint)" }} aria-hidden />
          <h2 className="mt-4 text-base font-semibold">No knowledge bases yet</h2>
        </div>
      ) : (
        kbs.map((kb) => (
          <section key={kb.id} className="card p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-base font-semibold">{kb.name}</h2>
              <span className="badge capitalize">{kb.visibility}</span>
            </div>
            {kb.description && (
              <p className="mb-2 text-[13px]" style={{ color: "var(--muted)" }}>{kb.description}</p>
            )}
            {kb.agents.length > 0 && (
              <p className="mb-4 text-[12px]" style={{ color: "var(--faint)" }}>
                Used by: {kb.agents.map((a) => a.name).join(", ")}
              </p>
            )}
            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {kb.documents.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <FileText size={14} style={{ color: "var(--faint)" }} aria-hidden />
                  <span className="flex-1 text-sm" style={{ paddingLeft: d.parentId ? 16 : 0 }}>
                    {d.title}
                  </span>
                  <span className="badge font-mono text-[10px]">{d.sourceType}</span>
                  <span className="text-[11px]" style={{ color: "var(--faint)" }}>
                    {d.updatedAt.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
