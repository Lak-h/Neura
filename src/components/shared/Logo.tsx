import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Neuraxis mark: the letter N drawn as a single continuous wire trace —
 * one stroke, two terminals. It draws itself in once on mount (pure CSS,
 * server-safe) and then sits still. Flat tile, hairline border, no glow.
 */
export function Logo({ size = "md", href = "/" }: { size?: "sm" | "md" | "lg"; href?: string }) {
  const tile = {
    sm: "h-7 w-7 rounded-lg",
    md: "h-9 w-9 rounded-[10px]",
    lg: "h-11 w-11 rounded-xl",
  }[size];
  const word = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];

  return (
    <Link href={href} className="group inline-flex items-center gap-2.5 no-underline">
      <span
        className={cn("flex items-center justify-center", tile)}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
          boxShadow: "0 1px 2px rgba(14,17,22,.05)",
        }}
      >
        <svg viewBox="0 0 32 32" className="h-[62%] w-[62%]" fill="none" aria-hidden>
          {/* One continuous wire: up, across, up */}
          <path
            d="M 8 25 L 8 7 L 24 25 L 24 7"
            stroke="var(--brand)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            strokeDasharray={100}
            className="nrx-draw"
          />
          {/* Terminals: where the signal enters and leaves */}
          <circle cx="8" cy="25" r="1.7" fill="var(--brand)" className="nrx-appear" style={{ animationDelay: ".55s" }} />
          <circle cx="24" cy="7" r="1.9" fill="var(--accent)" className="nrx-appear" style={{ animationDelay: ".75s" }} />
        </svg>
      </span>
      <span className={cn("font-bold tracking-tight", word)} style={{ color: "var(--foreground)" }}>
        Neur<span style={{ color: "var(--brand)" }}>axis</span>
      </span>
    </Link>
  );
}
