"use client";

import { useState, useTransition } from "react";
import { generateKey, revokeKey } from "./actions";

type KeyInfo = {
  id: number;
  key_prefix: string;
  tier: string;
  label: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  request_count: number;
};

export function KeyManager({ keys }: { keys: KeyInfo[] }) {
  const [isPending, startTransition] = useTransition();
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeKeys = keys.filter((k) => !k.revoked_at);
  const revokedKeys = keys.filter((k) => k.revoked_at);

  async function handleGenerate(formData: FormData) {
    setError(null);
    setNewKey(null);

    startTransition(async () => {
      const result = await generateKey(formData);
      if (result.success && result.key) {
        setNewKey(result.key);
      } else {
        setError(result.error || "Failed to generate key");
      }
    });
  }

  async function handleRevoke(prefix: string) {
    if (!confirm(`Revoke key ${prefix}...? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await revokeKey(prefix);
      if (!result.success) {
        setError(result.error || "Failed to revoke key");
      }
    });
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="space-y-6">
      <div>
        <h2
          className="text-2xl mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          API Keys
        </h2>
        <p className="text-sm text-slate-500">
          Use these keys to authenticate requests to the CivicGrid API.
        </p>
      </div>

      {/* Just-created key callout */}
      {newKey && (
        <div className="rounded-xl border-2 border-slate-900 bg-slate-50 p-6 shadow-sm">
          <h3 className="font-medium mb-2 text-slate-900">Your new API key</h3>
          <p className="text-sm text-slate-600 mb-4">
            Copy this now. For security, you won&apos;t be able to see it again.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-slate-200">
            <code
              className="flex-1 text-xs break-all text-slate-900"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {newKey}
            </code>
            <button
              onClick={() => copyToClipboard(newKey)}
              className="shrink-0 rounded-md border border-slate-200 px-3 py-1 text-xs hover:bg-slate-100 transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-xs text-slate-500 hover:text-slate-900 transition"
          >
            I&apos;ve saved my key, dismiss
          </button>
        </div>
      )}

      {/* Generate key form */}
      <form
        action={handleGenerate}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="font-medium mb-4 text-slate-900">Generate new key</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            name="label"
            type="text"
            placeholder="Label (e.g. production)"
            className="sm:col-span-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
          />
          <select
            name="tier"
            defaultValue="free"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
          >
            <option value="free">Free (100/day)</option>
            <option value="starter">Starter (10k/day)</option>
            <option value="pro">Pro (100k/day)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-50"
          style={{ background: "#1a2540" }}
        >
          {isPending ? "Generating..." : "Generate key"}
        </button>
      </form>

      {/* Error display */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Active keys list */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">
          Active keys ({activeKeys.length})
        </h3>
        {activeKeys.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-6 text-center border border-dashed border-slate-200 rounded-xl bg-white">
            No active keys yet. Generate one above to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {activeKeys.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code
                      className="text-sm text-slate-900"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {k.key_prefix}...
                    </code>
                    <span
                      className="text-[10px] uppercase tracking-wider rounded px-2 py-0.5 font-medium"
                      style={{ background: "#eff3f9", color: "#1a2540" }}
                    >
                      {k.tier}
                    </span>
                    {k.label && (
                      <span className="text-xs text-slate-500">{k.label}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Created {new Date(k.created_at).toLocaleDateString()}
                    {" · "}
                    {k.request_count.toLocaleString()} requests
                    {k.last_used_at && (
                      <>
                        {" · "}
                        Last used{" "}
                        {new Date(k.last_used_at).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(k.key_prefix)}
                  disabled={isPending}
                  className="shrink-0 text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Revoked keys (collapsed) */}
      {revokedKeys.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-slate-500 hover:text-slate-900 transition">
            Show {revokedKeys.length} revoked key
            {revokedKeys.length !== 1 ? "s" : ""}
          </summary>
          <ul className="mt-3 space-y-2">
            {revokedKeys.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 opacity-60"
              >
                <div className="flex-1 min-w-0">
                  <code
                    className="text-sm line-through text-slate-900"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {k.key_prefix}...
                  </code>
                  {k.label && (
                    <span className="ml-2 text-xs text-slate-500">
                      {k.label}
                    </span>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Revoked {new Date(k.revoked_at!).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}