import { MessageSquare, AlertTriangle } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Inbox" };

const STATUS_COLOR: Record<string, string> = {
  open: "var(--warning)",
  pending: "var(--brand-bright)",
  resolved: "var(--success)",
  archived: "var(--faint)",
};

const SENTIMENT_EMOJI: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😟",
};

export default async function InboxPage() {
  const ctx = await requireOrg();

  const conversations = await prisma.conversation.findMany({
    where: { orgId: ctx.orgId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      agent: { select: { name: true } },
      tags: true,
      _count: { select: { messages: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, role: true } },
    },
  });

  const needsReview = conversations.filter((c) => c.needsHumanReview && c.status === "open");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Every conversation your agents are having, in one place.
        </p>
      </div>

      {needsReview.length > 0 && (
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm"
          style={{ background: "rgba(251,191,36,.07)", border: "1px solid rgba(251,191,36,.3)" }}
        >
          <AlertTriangle size={16} style={{ color: "var(--warning)" }} aria-hidden />
          <span style={{ color: "var(--warning)" }}>
            {needsReview.length} conversation{needsReview.length === 1 ? "" : "s"} flagged for human review —
            an agent&apos;s confidence dropped below its threshold.
          </span>
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-20 text-center">
          <MessageSquare size={36} style={{ color: "var(--faint)" }} aria-hidden />
          <h2 className="mt-4 text-base font-semibold">No conversations yet</h2>
          <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--muted)" }}>
            Deploy an agent to a channel and customer conversations will stream in here.
          </p>
        </div>
      ) : (
        <div className="card divide-y overflow-hidden" style={{ borderColor: "var(--border)" }}>
          {conversations.map((c) => {
            const last = c.messages[0];
            return (
              <div key={c.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-black/[.02]">
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: STATUS_COLOR[c.status] ?? "var(--faint)" }}
                  aria-label={c.status}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{c.subject ?? "Untitled conversation"}</p>
                    {c.sentiment && <span aria-label={`sentiment: ${c.sentiment}`}>{SENTIMENT_EMOJI[c.sentiment]}</span>}
                    {c.needsHumanReview && c.status === "open" && (
                      <span className="badge" style={{ color: "var(--warning)", borderColor: "rgba(251,191,36,.4)" }}>
                        needs review
                      </span>
                    )}
                    {c.tags.map((t) => (
                      <span key={t.id} className="badge" style={{ color: t.color, borderColor: `${t.color}55` }}>
                        {t.name}
                      </span>
                    ))}
                  </div>
                  {last && (
                    <p className="mt-1 line-clamp-1 text-[13px]" style={{ color: "var(--faint)" }}>
                      {last.role === "user" ? "Customer: " : ""}{last.content}
                    </p>
                  )}
                  <p className="mt-1.5 flex items-center gap-2 text-[11px]" style={{ color: "var(--faint)" }}>
                    <span className="capitalize">{c.channel}</span>
                    {c.agent && <><span>·</span><span>{c.agent.name}</span></>}
                    <span>·</span>
                    <span>{c._count.messages} messages</span>
                    {c.csatScore != null && <><span>·</span><span>CSAT {c.csatScore}/5</span></>}
                  </p>
                </div>
                <span className="shrink-0 text-[11px]" style={{ color: "var(--faint)" }}>
                  {c.updatedAt.toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
