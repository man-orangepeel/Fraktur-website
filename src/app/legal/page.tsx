import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "FRAKTUR — Donation & Legal Terms" };

export default function LegalPage() {
  return (
    <>
      <Header variant="home" />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-semibold text-fraktur-text">Donation &amp; Legal Terms</h1>
        <p className="leading-relaxed text-fraktur-muted">
          Donations to FRAKTUR are voluntary <strong className="text-fraktur-text">tips</strong> in support of open
          Bitcoin security research and tooling. They are gifts, not investments: donors receive no equity, tokens,
          revenue share, profit share, interest, or ownership interest of any kind, and have no expectation of
          financial return. Donations are non-refundable except at FRAKTUR&rsquo;s sole discretion. FRAKTUR retains
          full and final discretion over the allocation of contributed funds across product development, audits, and
          team tips; a donor&rsquo;s stated allocation preference is guidance only, not a directed-use contract, and
          does not entitle the donor to compel any specific audit, deliverable, or timeline.{" "}
          <strong className="text-fraktur-text">
            The &ldquo;Team&rdquo; allocation functions as a direct tip to individual contributors — it is not a
            salary, wage, invoice payment, or any other form of formal compensation, and creates no employment or
            contractor relationship between FRAKTUR and the recipient.
          </strong>{" "}
          FRAKTUR does not custody donor funds beyond the momentary receipt of a Lightning payment; donors are
          responsible for the security of their own wallets and payment methods. Nothing on this site constitutes
          financial, investment, tax, or legal advice.
        </p>
      </main>
      <Footer />
    </>
  );
}
