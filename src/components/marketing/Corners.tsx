/**
 * Blueprint corner ticks — the “+” registration marks at each corner of a
 * relatively-positioned parent. Pure presentation, server-safe.
 */
export function Corners() {
  const base = "pointer-events-none absolute font-mono text-[11px] leading-none select-none";
  const style = { color: "var(--faint)", opacity: 0.6 } as const;
  return (
    <span aria-hidden>
      <span className={`${base} -left-[4px] -top-[6px]`} style={style}>+</span>
      <span className={`${base} -right-[4px] -top-[6px]`} style={style}>+</span>
      <span className={`${base} -left-[4px] -bottom-[6px]`} style={style}>+</span>
      <span className={`${base} -right-[4px] -bottom-[6px]`} style={style}>+</span>
    </span>
  );
}
