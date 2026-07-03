"use client";

import { useState } from "react";
import { approveProposal, rejectProposal, type Proposal } from "@/app/admin/review/actions";

function ConfidenceBadge({ level }: { level: string | null }) {
  const l = (level || "").toLowerCase();
  let bg = "#f1f5f9", fg = "#475569", label = level || "unknown";
  if (l === "high") { bg = "#ecfdf5"; fg = "#047857"; label = "high confidence"; }
  else if (l === "medium") { bg = "#fffbeb"; fg = "#b45309"; label = "medium"; }
  else if (l === "low") { bg = "#fef2f2"; fg = "#b91c1c"; label = "low · needs a look"; }
  return <span className="text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap" style={{ background: bg, color: fg }}>{label}</span>;
}

export function ReviewClient({ initialProposals, total }: { initialProposals: Proposal[]; total: number }) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(0);

  async function handle(id: number, action: "approve" | "reject") {
    setBusy(id);
    setError(null);
    const res = action === "approve" ? await approveProposal(id) : await rejectProposal(id);
    setBusy(null);
    if (!res.ok) {
      setError(res.error || "Action failed");
      return;
    }
    setProposals((prev) => prev.filter((p) => p.id !== id));
    setDone((d) => d + 1);
  }

  if (proposals.length === 0) {
    return (
      <div className="border border-slate-200 rounded-xl p-10 text-center">
        <div className="text-sm text-slate-600">{done > 0 ? `All caught up — you reviewed ${done} this session.` : "No pending proposals."}</div>
      </div>
    );
  }

  return (
    <div>
      {error ? <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div> : null}
      <div className="text-xs text-slate-400 mb-4">{proposals.length} shown{total > proposals.length ? ` of ${total}` : ""}{done > 0 ? ` · ${done} reviewed` : ""}</div>
      <div className="flex flex-col gap-3">
        {proposals.map((p) => (
          <div key={p.id} className="border border-slate-200 rounded-xl px-5 py-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">{p.city}, {p.state_code}{p.population ? <span className="text-slate-400 font-normal"> · pop {p.population.toLocaleString()}</span> : null}</div>
              <ConfidenceBadge level={p.confidence} />
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-3">
              <div className="px-3 py-2 rounded-lg" style={{ background: "#fef2f2" }}>
                <div className="text-[11px] mb-0.5" style={{ color: "#b91c1c" }}>Currently in DB</div>
                <div className="text-sm line-through" style={{ color: "#b91c1c" }}>{p.db_mayor || "—"}</div>
              </div>
              <div className="text-slate-400">→</div>
              <div className="px-3 py-2 rounded-lg" style={{ background: "#ecfdf5" }}>
                <div className="text-[11px] mb-0.5" style={{ color: "#047857" }}>Verifier found</div>
                <div className="text-sm font-medium" style={{ color: "#047857" }}>{p.web_mayor || "—"}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {p.source_url ? <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 hover:underline truncate max-w-[60%]">{p.source_url.replace(/^https?:\/\/(www\.)?/, "")}</a> : <span className="text-xs text-slate-400">no source</span>}
              <div className="flex gap-2">
                <button onClick={() => handle(p.id, "reject")} disabled={busy === p.id} className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-800 transition disabled:opacity-40">Reject</button>
                <button onClick={() => handle(p.id, "approve")} disabled={busy === p.id} className="text-xs px-4 py-1.5 rounded-lg text-white transition disabled:opacity-40 hover:opacity-90" style={{ background: "#047857" }}>{busy === p.id ? "..." : "Approve"}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
