import Image from "next/image";
import Link from "next/link";
import { XIcon, GithubIcon, VerifyIcon, MailIcon } from "./SocialIcons";

export function Footer() {
  return (
    <footer className="border-t border-fraktur-border bg-fraktur-panel py-10 text-sm text-fraktur-muted">
      <div className="mx-auto max-w-6xl px-4">
        {/* Block 1 — brand: logo + social row, nothing else competing for
            attention here. */}
        <div className="mb-12 flex flex-col items-start gap-4">
          <Image src="/logo-full.png" alt="FRAKTUR" width={640} height={128} className="h-28 w-auto sm:h-32" />

          <div className="flex items-center gap-5">
            <a
              href="https://x.com/fraktur"
              target="_blank"
              rel="noreferrer"
              aria-label="FRAKTUR on X"
              className="text-fraktur-muted hover:text-fraktur-electric"
            >
              <XIcon className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/fraktur"
              target="_blank"
              rel="noreferrer"
              aria-label="FRAKTUR on GitHub"
              className="text-fraktur-muted hover:text-fraktur-electric"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
            <a
              href="https://opentimestamps.org/"
              target="_blank"
              rel="noreferrer"
              aria-label="Verify an OpenTimestamp proof"
              className="text-fraktur-muted hover:text-fraktur-electric"
            >
              <VerifyIcon className="h-5 w-5" />
            </a>
            <a href="mailto:contact@fraktur.io" aria-label="Email FRAKTUR" className="text-fraktur-muted hover:text-fraktur-electric">
              <MailIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Block 2 — fine print: visually separated (top border + its own
            padding) so it reads as the "boring legal block", not a
            continuation of the brand block above. */}
        <div className="border-t border-fraktur-border pt-6">
          <p className="mb-4 max-w-2xl leading-relaxed">
            Donations are voluntary tips for open Bitcoin security research — not investments, equity, or any promise
            of financial return.{" "}
            <Link href="/legal" className="text-fraktur-orange hover:underline">
              Full donation &amp; legal terms →
            </Link>
          </p>

          <p className="text-xs text-fraktur-muted/70">
            © {new Date().getFullYear()} FRAKTUR. Security co-pilot, not a replacement for a formal audit.
          </p>
        </div>
      </div>
    </footer>
  );
}
