import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { AgentForm } from "../AgentForm";
import { createAgentAction } from "../actions";

export const metadata = { title: "New agent" };

export default async function NewAgentPage() {
  await requireOrg();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/agents" className="btn-ghost -ml-3 text-[13px]">
        <ArrowLeft size={14} aria-hidden /> All agents
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create an agent</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Give it a name, a model, and a job description. You can test it in the playground before activating.
        </p>
      </div>
      <div className="card p-6">
        <AgentForm action={createAgentAction} submitLabel="Create agent →" />
      </div>
    </div>
  );
}
