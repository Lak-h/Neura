import { requireOrg } from "@/lib/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrg();

  return (
    <div className="flex min-h-screen">
      <Sidebar orgName={ctx.org.name} plan={ctx.org.plan} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          orgName={ctx.org.name}
          credits={ctx.org.aiCredits}
          role={ctx.role}
        />
        <main className="relative flex-1 px-8 py-8">
          {/* Faint graph paper bleeding down from the top edge */}
          <div
            aria-hidden
            className="grid-paper pointer-events-none absolute inset-x-0 top-0 h-72"
            style={{
              opacity: 0.55,
              maskImage: "linear-gradient(180deg, #000, transparent)",
              WebkitMaskImage: "linear-gradient(180deg, #000, transparent)",
            }}
          />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
