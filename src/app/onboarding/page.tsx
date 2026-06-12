import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/shared/Logo";
import { OnboardingForm } from "./OnboardingForm";

export const metadata = { title: "Create your workspace" };

export default async function OnboardingPage() {
  const user = await requireUser();

  // Already has an org → straight to the dashboard
  const existing = await prisma.organisationMember.findFirst({ where: { userId: user.id } });
  if (existing) redirect("/overview");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8" style={{ animation: "fade-up .6s ease both" }}>
        <Logo size="lg" />
      </div>
      <div className="card-raised w-full max-w-md p-8" style={{ animation: "fade-up .6s .1s ease both" }}>
        <h1 className="mb-1 text-xl font-semibold tracking-tight">Create your workspace</h1>
        <p className="mb-7 text-sm" style={{ color: "var(--muted)" }}>
          One workspace per company. You can invite your team in the next step.
        </p>
        <OnboardingForm />
      </div>
    </div>
  );
}
