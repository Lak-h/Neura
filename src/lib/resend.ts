import { Resend } from "resend";
import type { ReactElement } from "react";
import { env, features } from "@/lib/env";

const resend = features.resend ? new Resend(env.RESEND_API_KEY) : null;

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react?: ReactElement;
  html?: string;
  text?: string;
};

/**
 * Sends via Resend when configured; otherwise logs to the server console so
 * local flows (invites, magic links, dunning) remain testable end-to-end.
 */
export async function sendEmail(input: SendEmailInput): Promise<{ id: string | null }> {
  if (!resend) {
    console.info(
      `📧 [email:console-fallback] to=${Array.isArray(input.to) ? input.to.join(",") : input.to} subject="${input.subject}"`
    );
    return { id: null };
  }
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    react: input.react,
    html: input.html,
    text: input.text ?? " ",
  });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
  return { id: data?.id ?? null };
}
