import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Graph paper, faded at the edges */}
      <div
        aria-hidden
        className="grid-paper pointer-events-none absolute inset-0"
        style={{
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 45%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 45%, #000 30%, transparent 75%)",
        }}
      />
      {/* The wire: a vertical trace behind the card */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-full -translate-x-1/2"
        width="2"
        viewBox="0 0 2 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d="M 1 0 V 100" stroke="rgba(39,66,255,.18)" strokeWidth="2" />
      </svg>

      <div className="relative z-10 mb-8" style={{ animation: "fade-up .6s ease both" }}>
        <Logo size="lg" />
      </div>
      <div className="relative z-10 w-full max-w-md" style={{ animation: "fade-up .6s .1s ease both" }}>
        {children}
      </div>
    </div>
  );
}
