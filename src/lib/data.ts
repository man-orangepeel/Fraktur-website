import type { Wallet, Supporter, SiteSettings } from "./types";
import { airtableConfigured, fetchPublishedWallets, fetchSupporters, fetchSettings } from "./airtable";
import sampleWallets from "../../data/wallets.sample.json";
import sampleSupporters from "../../data/supporters.sample.json";
import sampleSettings from "../../data/settings.sample.json";

// Every data getter below tries Airtable first (server-side only, key never
// exposed to the client) and falls back to the checked-in sample JSON when no
// AIRTABLE_API_KEY / AIRTABLE_BASE_ID is configured. This means `npm run dev`
// works immediately after `git clone`, with no Airtable base required, and
// the real site "lights up" the moment real credentials are set — no code
// change needed to go from demo to live.

export async function getWallets(): Promise<Wallet[]> {
  if (airtableConfigured()) {
    try {
      return (await fetchPublishedWallets()) as Wallet[];
    } catch (err) {
      console.error("Airtable wallets fetch failed, falling back to sample data:", err);
    }
  }
  return sampleWallets as Wallet[];
}

export async function getSettings(): Promise<SiteSettings> {
  if (airtableConfigured()) {
    try {
      return await fetchSettings();
    } catch (err) {
      console.error("Airtable settings fetch failed, falling back to sample data:", err);
    }
  }
  return sampleSettings as SiteSettings;
}

export async function getSupporters(): Promise<Supporter[]> {
  const settings = await getSettings();
  if (airtableConfigured()) {
    try {
      return await fetchSupporters(settings.galleryThresholdSats);
    } catch (err) {
      console.error("Airtable supporters fetch failed, falling back to sample data:", err);
    }
  }
  return sampleSupporters as Supporter[];
}
