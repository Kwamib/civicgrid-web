"use client";

import { useState } from "react";
import { searchCities, updateLeader, type CityRow } from "@/app/admin/cities/actions";

function verifiedBadge(ts: string | null) {
  if (!ts) return <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#fffbeb", color: "#b45309" }}>never verified</span>;
  const d = new Date(ts);
  const label = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  return <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#ecfdf5", color: "#047857" }}>verified {label}</span>;
}

export function FixCityClient() {
  const [q, setQ] = useState("");
  const [onlyUnverified, setOnlyUnverified] = useState(false);
  const [rows, setRows] = useState<CityRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [titleInput, setTitleInput] = useState("Mayor");
  const [sourceInput, setSourceInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    setMsg(null);
    const results = await searchCities(q, onlyUnverified);
    setRows(results);
    setSearching(false);
  }

  function startEdit(row: CityRow) {
    setEditing(row.city_id);
    setNameInput(row.full_name ?? "");
    setTitleInput(row.leader_title ?? "Mayor");
    setSourceInput(row.url ?? "");
    setMsg(null);
  }

  async function save(cityId: number) {
    setBusy(true);
    setMsg(null);
    const res = await updateLeader(cityId, nameInput, titleInput, sourceInput);
    setBusy(false);
    if (!res.ok) {
      setMsg(res.error || "Update failed");
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.city_id === cityId
          ? { ...r, full_name: res.mayor ?? nameInput, leader_title: titleInput, last_verified_at: new Date().toISOString() }
          : r,
      ),
    );
    setEditing(null);
    setMsg(`Updated ${res.mayor ?? nameInput}`);
  }

  return (
    <div>
      <form onSubmit={doSearch} className="mb-5">
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a city (e.g. Bastrop)" className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          <button type="submit" disabled={searching} className="px-5 py-2.5 rounded-lg text-white text-sm disabled:opacity-40" style={{ background: "#1e293b" }}>{searching ? "..." : "Search"}</button>
        </div>
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" checked={onlyUnverified} onChange={(e) => setOnlyUnverified(e.target.checked)} />
          Only unverified
        </label>
      </form>

      {msg ? <div className="mb-4 text-sm px-4 py-2.5 rounded-lg" style={{ background: msg.startsWith("Updated") ? "#ecfdf5" : "#fef2f2", color: msg.startsWith("Updated") ? "#047857" : "#b91c1c" }}>{msg}</div> : null}

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.city_id} className="border border-slate-200 rounded-xl px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">{row.city}, {row.state_code}{row.population ? <span className="text-slate-400 font-normal"> · pop {row.population.toLocaleString()}</span> : null}</div>
              {verifiedBadge(row.last_verified_at)}
            </div>

            {editing === row.city_id ? (
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Mayor full name" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  <input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} placeholder="Title" className="w-32 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <input value={sourceInput} onChange={(e) => setSourceInput(e.target.value)} placeholder="Source URL (where you verified this)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                <div className="flex items-center gap-2">
                  <button onClick={() => save(row.city_id)} disabled={busy} className="text-xs px-4 py-1.5 rounded-lg text-white disabled:opacity-40" style={{ background: "#047857" }}>{busy ? "Saving..." : "Save"}</button>
                  <button onClick={() => setEditing(null)} disabled={busy} className="text-xs px-3 py-1.5 text-slate-500">Cancel</button>
                  {row.url ? <a href={row.url.startsWith("http") ? row.url : `https://${row.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 hover:underline ml-auto">official site ↗</a> : null}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">{row.full_name ? <>{row.leader_title || "Mayor"}: <span className="font-medium text-slate-900">{row.full_name}</span></> : <span className="text-slate-400">no leader on record</span>}</div>
                <button onClick={() => startEdit(row)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">Edit</button>
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && q && !searching ? <div className="text-sm text-slate-400 text-center py-8">No cities found for &ldquo;{q}&rdquo;.</div> : null}
      </div>
    </div>
  );
}
