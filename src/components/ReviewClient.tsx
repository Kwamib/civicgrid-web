"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  acceptFinding,
  correctFinding,
  dismissFinding,
  getProposals,
  getReviewEvents,
  retryFinding,
  type ActionResult,
  type Proposal,
  type ReviewEvent,
  type ReviewStatus,
} from "@/app/admin/review/actions";
import { citySlug } from "@/lib/slug";
import { displayHost, formatDate, governanceLabel, safeHttpUrl } from "@/lib/format";
import { StatusBadge } from "@/components/ui";

type Action = "accept" | "correct" | "dismiss" | "retry";

function findingKind(p: Proposal): { label: string; tone: "pending" | "warning" | "none" } {
  if (p.already_published) return { label: "Already published", tone: "none" };
  if (!p.web_mayor) return { label: "No name found on source", tone: "warning" };
  if (!p.current_name && !p.db_mayor) return { label: "New leader record", tone: "pending" };
  return { label: "Possible leadership change", tone: "pending" };
}

function ConfidenceBadge({ level }: { level: string | null }) {
  const l = (level || "").toLowerCase();
  if (l === "high") return <StatusBadge tone="verified">High confidence</StatusBadge>;
  if (l === "medium") return <StatusBadge tone="pending">Medium confidence</StatusBadge>;
  if (l === "low") return <StatusBadge tone="warning">Low confidence</StatusBadge>;
  return <StatusBadge tone="none">Confidence not recorded</StatusBadge>;
}

export function ReviewClient({
  initialProposals,
  initialTotal,
  initialCounts,
}: {
  initialProposals: Proposal[];
  initialTotal: number;
  initialCounts: Record<string, number>;
}) {
  const [tab, setTab] = useState<ReviewStatus>("pending");
  const [items, setItems] = useState<Proposal[]>(initialProposals);
  const [total, setTotal] = useState(initialTotal);
  const [counts, setCounts] = useState(initialCounts);
  const [selectedId, setSelectedId] = useState<number | null>(initialProposals[0]?.id ?? null);
  const [reviewed, setReviewed] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [loadingTab, startTab] = useTransition();

  const selected = useMemo(
    () => items.find((p) => p.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  );
  const staleInView = items.filter((p) => p.stale).length;

  function switchTab(next: ReviewStatus) {
    if (next === tab) return;
    setTab(next);
    setFlash(null);
    startTab(async () => {
      const r = await getProposals(next, 100, 0);
      setItems(r.proposals);
      setTotal(r.total);
      setCounts(r.counts);
      setSelectedId(r.proposals[0]?.id ?? null);
    });
  }

  function onDone(p: Proposal, message: string) {
    const idx = items.findIndex((x) => x.id === p.id);
    const rest = items.filter((x) => x.id !== p.id);
    setItems(rest);
    setTotal((t) => Math.max(0, t - 1));
    setCounts((c) => ({ ...c, [tab]: Math.max(0, (c[tab] ?? 1) - 1) }));
    setReviewed((n) => n + 1);
    setSelectedId(rest[Math.min(idx, rest.length - 1)]?.id ?? null);
    setFlash(message);
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric value={counts.pending ?? (tab === "pending" ? total : 0)} label="Pending findings" />
        <Metric value={counts.retry ?? 0} label="Waiting for a re-check" />
        <Metric value={staleInView} label="Stale findings in this view" />
        <Metric value={reviewed} label="Reviewed this session" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Finding status">
        {(
          [
            ["pending", "Pending"],
            ["retry", "Re-check requested"],
          ] as [ReviewStatus, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => switchTab(value)}
            className={`h-10 rounded-md border px-4 text-sm font-medium transition ${
              tab === value ? "border-navy bg-navy text-white" : "border-line bg-white text-ink hover:border-[#b9c8d9]"
            }`}
          >
            {label}
          </button>
        ))}
        {loadingTab ? <span className="text-sm text-muted">Loading…</span> : null}
      </div>

      <div aria-live="polite" className="min-h-0">
        {flash ? (
          <div className="mb-4 rounded-md border border-[#cfe8dc] bg-[#eef8f3] px-4 py-3 text-sm text-[#1d6047]">{flash}</div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-line px-6 py-14 text-center">
          <h2 className="font-serif text-2xl text-ink">
            {tab === "pending" ? "Queue is clear" : "No re-checks waiting"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {reviewed > 0 ? `You reviewed ${reviewed} finding${reviewed === 1 ? "" : "s"} this session.` : "New findings appear here after the verifier runs."}
          </p>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.85fr)_1.4fr]">
          <section aria-label="Findings" className="rounded-lg border border-line bg-white">
            <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
              <h2 className="font-serif text-xl text-ink">Findings</h2>
              <span className="text-xs text-muted">
                {items.length}
                {total > items.length ? ` of ${total}` : ""} · largest cities first
              </span>
            </div>
            <ul className="max-h-[70vh] overflow-y-auto p-2">
              {items.map((p) => {
                const kind = findingKind(p);
                const isSel = selected?.id === p.id;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setSelectedId(p.id);
                        setFlash(null);
                      }}
                      aria-current={isSel ? "true" : undefined}
                      className={`mb-1 w-full rounded-md border px-4 py-3 text-left transition ${
                        isSel ? "border-cobalt bg-[#f0f6ff]" : "border-transparent hover:bg-panel"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-ink">
                          {p.city}, {p.state_code}
                        </span>
                        {p.population != null ? (
                          <span className="tabular text-xs text-muted">{p.population.toLocaleString("en-US")}</span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 truncate text-[13px] text-muted">
                        {p.current_name ?? p.db_mayor ?? "—"} → {p.web_mayor ?? "no name"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <StatusBadge tone={kind.tone}>{kind.label}</StatusBadge>
                        {p.stale ? <StatusBadge tone="warning">Stale</StatusBadge> : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {selected ? (
            <FindingDetail key={selected.id} p={selected} onDone={onDone} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-line bg-white px-5 py-4">
      <div className="tabular font-serif text-3xl leading-none text-ink">{value.toLocaleString("en-US")}</div>
      <div className="mt-1.5 text-[13px] text-muted">{label}</div>
    </div>
  );
}

function FindingDetail({ p, onDone }: { p: Proposal; onDone: (p: Proposal, msg: string) => void }) {
  const kind = findingKind(p);
  const source = safeHttpUrl(p.source_url);
  const official = safeHttpUrl(p.mayor_url) ?? safeHttpUrl(p.city_url);
  const supportsConcurrency = p.current_leader_id !== undefined; // older API omits it
  const currentName = supportsConcurrency ? p.current_name : p.db_mayor;
  const currentTitle = p.current_title ?? null;
  const defaultTitle = p.proposed_title || currentTitle || "Mayor";

  const [action, setAction] = useState<Action>(p.web_mayor && !p.already_published ? "accept" : "dismiss");
  const [title, setTitle] = useState(defaultTitle);
  const [name, setName] = useState(p.web_mayor ?? "");
  const [sourceInput, setSourceInput] = useState(p.source_url ?? "");
  const [reason, setReason] = useState("");
  const [confirmCurrent, setConfirmCurrent] = useState(false);
  const [ackStale, setAckStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [events, setEvents] = useState<ReviewEvent[] | null>(null);

  useEffect(() => {
    let alive = true;
    getReviewEvents(p.city_id).then((e) => alive && setEvents(e)).catch(() => alive && setEvents([]));
    return () => {
      alive = false;
    };
  }, [p.city_id]);

  const needsAck = Boolean(p.stale) && (action === "accept" || action === "correct");
  const common = {
    expectedLeaderId: supportsConcurrency ? p.current_leader_id ?? null : undefined,
    reason,
    acknowledgeStale: ackStale,
  };

  function run() {
    setError(null);
    start(async () => {
      let res: ActionResult;
      let msg: string;
      if (action === "accept") {
        res = await acceptFinding(p.id, { ...common, leaderTitle: title });
        msg = `Published ${p.web_mayor} (${title}) for ${p.city}, ${p.state_code}.`;
      } else if (action === "correct") {
        res = await correctFinding(p.id, { ...common, fullName: name, leaderTitle: title, sourceUrl: sourceInput, reason });
        msg = `Published correction for ${p.city}, ${p.state_code}: ${name} (${title}).`;
      } else if (action === "dismiss") {
        res = await dismissFinding(p.id, { ...common, confirmCurrent });
        msg = confirmCurrent
          ? `Dismissed. ${currentName ?? "The current record"} is marked verified for ${p.city}, ${p.state_code}.`
          : `Dismissed. The published record for ${p.city}, ${p.state_code} is unchanged.`;
      } else {
        res = await retryFinding(p.id, common);
        msg = `Re-check requested for ${p.city}, ${p.state_code}. Nothing was published.`;
      }
      if (res.ok) onDone(p, msg);
      else setError(res.conflict ? `${res.error}` : res.error);
    });
  }

  const disabled =
    pending ||
    (needsAck && !ackStale) ||
    (action === "accept" && (!p.web_mayor || p.already_published || !title.trim())) ||
    (action === "correct" && (!name.trim() || reason.trim().length < 3));

  return (
    <section aria-label={`Finding for ${p.city}, ${p.state_code}`} className="rounded-lg border border-line border-t-[5px] border-t-cobalt bg-white p-5 sm:p-6">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cobalt">{kind.label}</div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-serif text-[30px] leading-tight text-ink">
          {p.city}, {p.state_code}
        </h2>
        <ConfidenceBadge level={p.confidence} />
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
        <Link href={`/cities/${citySlug(p.city, p.state_code)}`} target="_blank" className="text-cobalt hover:underline">
          Public profile ↗
        </Link>
        {official ? (
          <a href={official} target="_blank" rel="noopener noreferrer" className="text-cobalt hover:underline">
            {p.mayor_url ? "Official leadership page" : "City website"} ↗
          </a>
        ) : null}
        {governanceLabel(p.governance_type) ? <span className="text-muted">Government: {governanceLabel(p.governance_type)}</span> : null}
        {formatDate(p.created_at) ? <span className="text-muted">Found {formatDate(p.created_at)}</span> : null}
      </div>

      {p.stale ? (
        <div role="alert" className="mt-4 rounded-md border border-[#f0d5d9] bg-[#fbf3f4] px-4 py-3 text-sm text-[#7d3a45]">
          <strong>Stale finding.</strong> The verifier compared the page against &ldquo;{p.db_mayor ?? "no leader"}&rdquo;,
          but the published record is now &ldquo;{p.current_name ?? "no leader"}&rdquo;. Someone may already have fixed this.
          Compare carefully, or request a re-check.
        </div>
      ) : null}
      {p.already_published ? (
        <div className="mt-4 rounded-md border border-line bg-panel px-4 py-3 text-sm text-ink">
          The proposed leader is already the published record. Dismiss this finding. Tick &ldquo;current record is
          correct&rdquo; if the source confirms it.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-line bg-panel p-4">
          <div className="text-xs text-muted">Published record</div>
          <div className="mt-1 font-serif text-[22px] leading-tight text-ink">{currentName ?? "No leader on record"}</div>
          <div className="text-[13px] text-muted">{currentTitle ?? (supportsConcurrency ? "Title not recorded" : "")}</div>
          <div className="mt-2 text-xs text-muted">
            {formatDate(p.current_last_verified_at) ? `Verified ${formatDate(p.current_last_verified_at)}` : "Never verified"}
          </div>
        </div>
        <div className="rounded-md border border-[#bcd5f7] bg-[#f3f8ff] p-4">
          <div className="text-xs text-muted">Verifier found</div>
          <div className="mt-1 font-serif text-[22px] leading-tight text-ink">{p.web_mayor ?? "No name found"}</div>
          <div className="text-[13px] text-muted">{p.proposed_title ?? "Title not captured"}</div>
        </div>
      </div>

      <h3 className="mb-2 mt-6 text-sm font-semibold text-ink">Source evidence</h3>
      {p.evidence ? (
        <blockquote className="border-l-[3px] border-cobalt bg-[#f3f7fb] px-4 py-3 text-[15px] leading-relaxed text-ink">
          &ldquo;{p.evidence}&rdquo;
        </blockquote>
      ) : (
        <p className="rounded-md bg-[#fff8e8] px-4 py-3 text-sm text-[#6b4f14]">
          No passage was stored with this finding. Open the source and confirm the name and title before accepting.
        </p>
      )}
      {source ? (
        <a href={source} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block break-all text-sm text-cobalt hover:underline">
          {displayHost(source)} ↗
        </a>
      ) : (
        <p className="mt-2 text-sm text-muted">No source URL recorded.</p>
      )}

      <fieldset className="mt-6 border-t border-line pt-5">
        <legend className="sr-only">Decision</legend>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ["accept", "Accept", "Publish the finding"],
              ["correct", "Correct", "Publish your edit"],
              ["dismiss", "Dismiss", "Keep the record"],
              ["retry", "Retry", "Re-check the source"],
            ] as [Action, string, string][]
          ).map(([value, label, hint]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-md border px-3 py-2.5 text-center transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cobalt ${
                action === value ? "border-cobalt bg-[#f0f6ff]" : "border-line hover:border-[#b9c8d9]"
              }`}
            >
              <input
                type="radio"
                name={`action-${p.id}`}
                value={value}
                checked={action === value}
                onChange={() => {
                  setAction(value);
                  setError(null);
                }}
                className="sr-only"
              />
              <span className="block text-sm font-semibold text-ink">{label}</span>
              <span className="block text-[11px] text-muted">{hint}</span>
            </label>
          ))}
        </div>

        {action === "accept" ? (
          <div className="space-y-3">
            <TextField id="acc-title" label="Title to publish" value={title} onChange={setTitle} help="Defaults to the title on the source, else the current title." />
            <TextField id="acc-note" label="Note (optional)" value={reason} onChange={setReason} />
          </div>
        ) : null}

        {action === "correct" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField id="cor-name" label="Correct full name" value={name} onChange={setName} />
            <TextField id="cor-title" label="Title" value={title} onChange={setTitle} />
            <div className="sm:col-span-2">
              <TextField id="cor-src" label="Source you verified against" value={sourceInput} onChange={setSourceInput} type="url" />
            </div>
            <div className="sm:col-span-2">
              <TextField id="cor-reason" label="Reason (required)" value={reason} onChange={setReason} help="e.g. Source names the deputy mayor; the mayor is listed on the council page." />
            </div>
          </div>
        ) : null}

        {action === "dismiss" ? (
          <div className="space-y-3">
            <label className="flex items-start gap-2.5 text-sm text-ink">
              <input type="checkbox" checked={confirmCurrent} onChange={(e) => setConfirmCurrent(e.target.checked)} disabled={!currentName} className="mt-0.5 h-4 w-4 accent-cobalt" />
              <span>
                The current record is correct. Mark &ldquo;{currentName ?? "—"}&rdquo; as verified.
                <span className="block text-xs text-muted">Only tick this if you checked the source yourself.</span>
              </span>
            </label>
            <TextField id="dis-reason" label="Reason (optional)" value={reason} onChange={setReason} help="e.g. The source is a fabricated news article." />
          </div>
        ) : null}

        {action === "retry" ? (
          <TextField id="ret-reason" label="Reason (optional)" value={reason} onChange={setReason} help="Nothing is published and nothing is marked verified. The verifier re-checks this city on its next run." />
        ) : null}

        {needsAck ? (
          <label className="mt-4 flex items-start gap-2.5 rounded-md bg-[#fbf3f4] px-3 py-2.5 text-sm text-[#7d3a45]">
            <input type="checkbox" checked={ackStale} onChange={(e) => setAckStale(e.target.checked)} className="mt-0.5 h-4 w-4 accent-cobalt" />
            I compared this with the current published record and still want to publish.
          </label>
        ) : null}

        {error ? (
          <div role="alert" className="mt-4 rounded-md border border-[#f0d5d9] bg-[#fbf3f4] px-4 py-3 text-sm text-[#7d3a45]">
            {error}
          </div>
        ) : null}

        <button
          onClick={run}
          disabled={disabled}
          className="mt-5 inline-flex h-11 items-center rounded-md bg-cobalt px-6 text-sm font-semibold text-white transition hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Saving…"
            : action === "accept"
              ? "Accept and publish"
              : action === "correct"
                ? "Publish correction"
                : action === "dismiss"
                  ? "Dismiss finding"
                  : "Request re-check"}
        </button>
      </fieldset>

      <div className="mt-6 border-t border-line pt-5">
        <h3 className="mb-2 text-sm font-semibold text-ink">Earlier decisions for this city</h3>
        {events === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted">None recorded.</p>
        ) : (
          <ul className="space-y-1.5 text-[13px]">
            {events.map((e) => (
              <li key={e.id} className="text-muted">
                <span className="text-ink">{formatDate(e.created_at)}</span> · {e.action}
                {e.after_name && e.action !== "dismiss" && e.action !== "retry" ? ` → ${e.after_name}` : ""}
                {e.confirmed_current ? " (confirmed current)" : ""} · {e.actor}
                {e.reason ? ` · “${e.reason}”` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  help,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[13px] font-semibold text-ink">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-[#cdd8e5] bg-white px-3 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/30"
      />
      {help ? <p className="mt-1 text-xs text-muted">{help}</p> : null}
    </div>
  );
}
