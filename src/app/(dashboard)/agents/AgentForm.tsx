"use client";

import { useActionState } from "react";
import { AGENT_MODELS } from "@/lib/constants/plans";
import type { AgentFormState } from "./actions";

export type AgentFormValues = {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  persona: string;
  status: string;
};

const PERSONAS = [
  { id: "formal", label: "Formal", hint: "Precise, professional" },
  { id: "casual", label: "Casual", hint: "Friendly, relaxed" },
  { id: "technical", label: "Technical", hint: "Detailed, exact" },
  { id: "empathetic", label: "Empathetic", hint: "Warm, supportive" },
];

export function AgentForm({
  action,
  initial,
  submitLabel,
  showChangelog = false,
}: {
  action: (prev: AgentFormState, formData: FormData) => Promise<AgentFormState>;
  initial?: Partial<AgentFormValues>;
  submitLabel: string;
  showChangelog?: boolean;
}) {
  const [state, formAction, pending] = useActionState<AgentFormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Agent name</label>
          <input
            id="name" name="name" type="text" required className="input"
            placeholder="Atlas — SDR Qualifier"
            defaultValue={initial?.name}
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          {state.fieldErrors?.name && <p className="field-error">{state.fieldErrors.name[0]}</p>}
        </div>
        <div>
          <label htmlFor="model" className="label">Model</label>
          <select id="model" name="model" className="input" defaultValue={initial?.model ?? "claude-sonnet-4-6"}>
            {AGENT_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} · {m.creditsPerMsg} credits/msg
              </option>
            ))}
          </select>
          {state.fieldErrors?.model && <p className="field-error">{state.fieldErrors.model[0]}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="label">Description <span style={{ color: "var(--faint)" }}>(optional)</span></label>
        <input
          id="description" name="description" type="text" className="input"
          placeholder="What does this agent do, in one sentence?"
          defaultValue={initial?.description}
        />
      </div>

      <div>
        <label htmlFor="systemPrompt" className="label">System prompt</label>
        <textarea
          id="systemPrompt" name="systemPrompt" required rows={9} className="input font-mono text-[13px] leading-relaxed"
          placeholder={"You are Atlas, the sales development agent for…\n\nDescribe the job, the audience, the rules, and the tone."}
          defaultValue={initial?.systemPrompt}
          aria-invalid={Boolean(state.fieldErrors?.systemPrompt)}
        />
        {state.fieldErrors?.systemPrompt && <p className="field-error">{state.fieldErrors.systemPrompt[0]}</p>}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label htmlFor="temperature" className="label">Temperature (0–1)</label>
          <input
            id="temperature" name="temperature" type="number" step="0.1" min="0" max="1" className="input"
            defaultValue={initial?.temperature ?? 0.7}
          />
          {state.fieldErrors?.temperature && <p className="field-error">{state.fieldErrors.temperature[0]}</p>}
        </div>
        <div>
          <label htmlFor="maxTokens" className="label">Max output tokens</label>
          <input
            id="maxTokens" name="maxTokens" type="number" step="256" min="256" max="32000" className="input"
            defaultValue={initial?.maxTokens ?? 4096}
          />
          {state.fieldErrors?.maxTokens && <p className="field-error">{state.fieldErrors.maxTokens[0]}</p>}
        </div>
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" className="input" defaultValue={initial?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="label">Persona</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PERSONAS.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer flex-col rounded-lg border px-3 py-2.5 transition-colors has-[:checked]:border-[rgba(39,66,255,.55)] has-[:checked]:bg-[rgba(39,66,255,.06)]"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="flex items-center gap-2 text-[13px] font-medium">
                <input
                  type="radio" name="persona" value={p.id}
                  defaultChecked={(initial?.persona ?? "formal") === p.id}
                  className="accent-[#2742ff]"
                />
                {p.label}
              </span>
              <span className="mt-0.5 pl-5 text-[11px]" style={{ color: "var(--faint)" }}>{p.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {showChangelog && (
        <div>
          <label htmlFor="changelog" className="label">Version note <span style={{ color: "var(--faint)" }}>(optional)</span></label>
          <input
            id="changelog" name="changelog" type="text" className="input"
            placeholder="What changed in this version?"
          />
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="rounded-lg px-3.5 py-2.5 text-sm"
          style={{ background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.25)", color: "var(--danger)" }}
        >
          {state.error}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
