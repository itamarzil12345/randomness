import type { Person } from "../types/person";
import type { EmailEnrichment } from "../types/enrichment";

type KickboxResponse = {
  disposable: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runEmailScraper = async (person: Person): Promise<EmailEnrichment> => {
  const email = person.email;
  const domain = email.split("@")[1] ?? "";
  const isFormatValid = EMAIL_PATTERN.test(email);
  const notes: string[] = [];

  if (!isFormatValid) {
    notes.push("Local-part or domain fails RFC 5322 pattern.");
  }

  let isDisposable: boolean | null = null;
  try {
    const response = await fetch(
      `https://open.kickbox.com/v1/disposable/${encodeURIComponent(email)}`,
    );
    if (response.ok) {
      const data = (await response.json()) as KickboxResponse;
      isDisposable = Boolean(data.disposable);
      if (isDisposable) {
        notes.push("Domain matched a known disposable-email provider.");
      } else {
        notes.push("Domain not present in disposable registry.");
      }
    } else {
      notes.push(`Disposable registry lookup failed (${response.status}).`);
    }
  } catch (error) {
    notes.push(`Disposable registry unreachable: ${(error as Error).message}.`);
  }

  let signal: EmailEnrichment["signal"] = "unknown";
  if (!isFormatValid) {
    signal = "suspect";
  } else if (isDisposable === true) {
    signal = "disposable";
  } else if (isDisposable === false) {
    signal = "trustworthy";
  }

  return {
    email,
    domain,
    isFormatValid,
    isDisposable,
    signal,
    notes,
  };
};
