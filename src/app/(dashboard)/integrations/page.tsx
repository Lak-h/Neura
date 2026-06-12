import { Plug } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Integrations" };

const CATALOG = [
  { provider: "slack", label: "Slack", category: "Comms" },
  { provider: "gmail", label: "Gmail", category: "Comms" },
  { provider: "hubspot", label: "HubSpot", category: "CRM" },
  { provider: "salesforce", label: "Salesforce", category: "CRM" },
  { provider: "google_drive", label: "Google Drive", category: "Storage" },
  { provider: "jira", label: "Jira", category: "Projects" },
  { provider: "linear", label: "Linear", category: "Projects" },
  { provider: "notion", label: "Notion", category: "Data" },
  { provider: "google_sheets", label: "Google Sheets", category: "Data" },
  { provider: "xero", label: "Xero", category: "Finance" },
  { provider: "zoom", label: "Zoom", category: "Video" },
  { provider: "google_calendar", label: "Google Calendar", category: "Calendar" },
];

export default async function IntegrationsPage() {
  const ctx = await requireOrg();

  const connected = await prisma.integration.findMany({
    where: { orgId: ctx.orgId, deletedAt: null },
  });
  const byProvider = new Map(connected.map((i) => [i.provider, i]));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Connect the tools your agents and workflows need. OAuth flows land in the next build pass —
          connection state below is live from the database.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG.map((item) => {
          const conn = byProvider.get(item.provider);
          return (
            <div key={item.provider} className="card flex items-center gap-4 p-5">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(14,17,22,.05)", color: "var(--muted)" }}
                aria-hidden
              >
                <Plug size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-[11px]" style={{ color: "var(--faint)" }}>{item.category}</p>
              </div>
              {conn ? (
                <span
                  className="badge"
                  style={{
                    color: conn.status === "connected" ? "var(--success)" : "var(--danger)",
                    borderColor: conn.status === "connected" ? "rgba(52,211,153,.4)" : "rgba(248,113,113,.4)",
                  }}
                >
                  {conn.status === "connected" ? "Connected" : `Error (${conn.errorCount})`}
                </span>
              ) : (
                <span className="badge">Not connected</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
