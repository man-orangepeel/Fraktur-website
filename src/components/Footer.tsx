export function Footer() {
  return (
    <footer className="border-t border-fraktur-border bg-fraktur-panel py-10 text-sm text-fraktur-muted">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-4 max-w-3xl leading-relaxed">
          Donations to FRAKTUR are voluntary tips in support of open Bitcoin security research and
          tooling — not investments. Donors receive no equity, tokens, revenue share, or expectation
          of financial return. The &ldquo;Team&rdquo; allocation functions as direct tips to individual
          contributors, not as salary, invoice payment, or a contractual wage. FRAKTUR does not
          custody donor funds beyond the momentary receipt of a Lightning payment. Nothing on this
          site constitutes financial, investment, tax, or legal advice.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="https://x.com/fraktur" target="_blank" rel="noreferrer" className="hover:text-fraktur-text">
            X / Twitter
          </a>
          <a href="https://github.com/fraktur" target="_blank" rel="noreferrer" className="hover:text-fraktur-text">
            GitHub
          </a>
          <a href="https://opentimestamps.org/" target="_blank" rel="noreferrer" className="hover:text-fraktur-text">
            Verify an OpenTimestamp proof
          </a>
          <a href="mailto:contact@fraktur.io" className="hover:text-fraktur-text">
            contact@fraktur.io
          </a>
        </div>
        <p className="mt-6 text-xs text-fraktur-muted/70">© {new Date().getFullYear()} FRAKTUR. Security co-pilot, not a replacement for a formal audit.</p>
      </div>
    </footer>
  );
}
