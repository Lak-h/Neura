import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const ctx = await requireOrg();

  async function renameOrg(formData: FormData) {
    "use server";
    const { requireRole } = await import("@/lib/session");
    const c = await requireRole("owner");
    const name = String(formData.get("name") ?? "").trim();
    if (name.length < 2 || name.length > 64) return;
    await prisma.organisation.update({ where: { id: c.orgId }, data: { name } });
    await logAudit({ orgId: c.orgId, userId: c.userId, action: "org.rename", metadata: { name } });
    revalidatePath("/settings");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Workspace configuration for {ctx.org.name}.
        </p>
      </div>

      <section className="card p-6">
        <h2 className="mb-4 text-sm font-semibold">Workspace</h2>
        <form action={renameOrg} className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <label htmlFor="org-name" className="label">Organisation name</label>
            <input id="org-name" name="name" type="text" defaultValue={ctx.org.name} className="input" minLength={2} maxLength={64} />
          </div>
          <button type="submit" className="btn-primary" disabled={ctx.role !== "owner"}>
            Save
          </button>
        </form>
        {ctx.role !== "owner" && (
          <p className="mt-3 text-[12px]" style={{ color: "var(--faint)" }}>
            Only workspace owners can rename the organisation.
          </p>
        )}
      </section>

      <section className="card p-6">
        <h2 className="mb-2 text-sm font-semibold">Workspace URL</h2>
        <p className="font-mono text-sm" style={{ color: "var(--muted)" }}>
          neuraxis.ai/<span style={{ color: "var(--brand-bright)" }}>{ctx.org.slug}</span>
        </p>
      </section>
    </div>
  );
}
