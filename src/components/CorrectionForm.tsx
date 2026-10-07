"use client";

import { useState } from "react";

const TO = "hello@civicgrid.org";

/**
 * There is no correction-submission backend yet, so this form builds an email
 * draft instead of pretending to submit. Nothing is sent until the user sends
 * the email from their own mail app.
 */
export function CorrectionForm({ initialCity }: { initialCity: string }) {
  const [city, setCity] = useState(initialCity);
  const [source, setSource] = useState("");
  const [details, setDetails] = useState("");

  const subject = `Data correction: ${city || "city record"}`;
  const body = [
    `City: ${city}`,
    `Official source: ${source}`,
    "",
    "What needs correcting:",
    details,
  ].join("\n");
  const href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const ready = city.trim().length > 1 && details.trim().length > 3;

  return (
    <form
      className="rounded-lg border border-line bg-white p-5 sm:p-7"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) window.location.href = href;
      }}
    >
      <div className="mb-5">
        <label htmlFor="c-city" className="mb-1.5 block text-sm font-semibold text-ink">City and state</label>
        <input id="c-city" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Laurel, MD" className={inputCls} />
      </div>
      <div className="mb-5">
        <label htmlFor="c-source" className="mb-1.5 block text-sm font-semibold text-ink">Official source URL</label>
        <input id="c-source" type="url" value={source} onChange={(e) => setSource(e.target.value)} placeholder="https://www.example-city.gov/mayor" className={inputCls} />
        <p className="mt-1.5 text-xs text-muted">The city&apos;s own website is best. News articles help as backup.</p>
      </div>
      <div className="mb-6">
        <label htmlFor="c-details" className="mb-1.5 block text-sm font-semibold text-ink">What needs correcting?</label>
        <textarea id="c-details" required rows={5} maxLength={2000} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="e.g. The current mayor is …, sworn in on …" className={`${inputCls} h-auto py-2.5`} />
      </div>
      <button type="submit" disabled={!ready} className="inline-flex h-11 items-center rounded-md bg-cobalt px-6 text-sm font-semibold text-white transition hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-50">
        Open email draft
      </button>
      <p className="mt-3 text-xs text-muted">
        This opens a pre-filled email to {TO} in your mail app. Nothing is sent until you send it.
      </p>
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-md border border-[#cdd8e5] bg-white px-3 text-[15px] text-ink placeholder:text-[#8a9bb0] focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/30";
