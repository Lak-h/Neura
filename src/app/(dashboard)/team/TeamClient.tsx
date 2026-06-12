"use client";

import { useActionState } from "react";
import { UserPlus, X } from "lucide-react";
import { inviteMemberAction, removeMemberAction, type InviteState } from "./actions";

export function InviteForm() {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteMemberAction, {});

  return (
    <form action={action} className="flex flex-wrap items-end gap-3" noValidate>
      <div className="min-w-56 flex-1">
        <label htmlFor="invite-email" className="label">Email</label>
        <input id="invite-email" name="email" type="email" required placeholder="teammate@company.com" className="input" />
      </div>
      <div>
        <label htmlFor="invite-role" className="label">Role</label>
        <select id="invite-role" name="role" className="input w-36" defaultValue="member">
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <button type="submit" disabled={pending} className="btn-primary">
        <UserPlus size={15} aria-hidden /> {pending ? "Sending…" : "Send invite"}
      </button>
      {state.error && <p className="field-error w-full">{state.error}</p>}
      {state.success && (
        <p className="w-full text-[13px]" style={{ color: "var(--success)" }}>{state.success}</p>
      )}
    </form>
  );
}

export function RemoveMemberButton({ memberId }: { memberId: string }) {
  return (
    <form
      action={async () => {
        await removeMemberAction(memberId);
      }}
    >
      <button
        type="submit"
        className="btn-ghost px-2 py-1 text-[12px]"
        style={{ color: "var(--danger)" }}
        aria-label="Remove member"
        onClick={(e) => {
          if (!confirm("Remove this member from the workspace?")) e.preventDefault();
        }}
      >
        <X size={13} aria-hidden /> Remove
      </button>
    </form>
  );
}
