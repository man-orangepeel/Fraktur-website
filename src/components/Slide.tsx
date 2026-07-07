import type { ReactNode } from "react";

/**
 * One full-viewport "beat" — the building block of the redesigned Companies
 * page. Mirrors the source pitch deck's language: one strong visual, an
 * eyebrow label, a short serif headline (2 lines, never a paragraph), and at
 * most one supporting line. If you're reaching for a third line of body
 * text, the idea belongs in the FAQ, not here.
 */
export function Slide({
  id,
  eyebrow,
  headline,
  sub,
  visual,
  visualSide = "right",
  center = false,
  children,
}: {
  id?: string;
  eyebrow?: string;
  headline: ReactNode;
  sub?: ReactNode;
  visual?: ReactNode;
  visualSide?: "left" | "right";
  center?: boolean;
  children?: ReactNode;
}) {
  if (center) {
    // Single-column bookend layout (cover/closing): the visual sits behind
    // or above the headline as an emblem, not beside it in a split column.
    return (
      <section id={id} className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden border-b border-fraktur-border px-6 py-20 text-center">
        {visual && <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">{visual}</div>}
        <div className="relative z-10 flex flex-col items-center">
          {eyebrow && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">{eyebrow}</p>
          )}
          <h2 className="max-w-2xl font-display text-4xl font-medium leading-[1.15] text-fraktur-text sm:text-5xl md:text-6xl">
            {headline}
          </h2>
          {sub && <p className="mt-6 max-w-md text-base text-fraktur-muted md:text-lg">{sub}</p>}
          {children}
        </div>
      </section>
    );
  }

  const textBlock = (
    <div className="flex flex-1 flex-col justify-center px-6 py-16 md:px-16">
      {eyebrow && (
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">{eyebrow}</p>
      )}
      <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.15] text-fraktur-text sm:text-5xl md:text-6xl">
        {headline}
      </h2>
      {sub && <p className="mt-6 max-w-md text-base text-fraktur-muted md:text-lg">{sub}</p>}
      {children}
    </div>
  );

  const visualBlock = visual ? (
    <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-10">
      <div className="w-full max-w-md">{visual}</div>
    </div>
  ) : null;

  return (
    <section
      id={id}
      className="relative flex min-h-[90vh] flex-col items-stretch border-b border-fraktur-border md:flex-row"
    >
      {visual && visualSide === "left" ? (
        <>
          {visualBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {visualBlock}
        </>
      )}
    </section>
  );
}
