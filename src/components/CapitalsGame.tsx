"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { STATES, type StateCapital } from "@/lib/capitals";
import { stateSlug } from "@/lib/slug";

type Mode = "quick" | "all";
type Phase = "start" | "playing" | "done";
type Question = { state: StateCapital; options: string[] };
type Answer = { state: StateCapital; given: string; correct: boolean };
type Best = { score: number; total: number; seconds: number };

const QUICK_COUNT = 10;
const MODE_LABEL: Record<Mode, string> = { quick: "Quick 10", all: "All 50" };

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Lenient match for typed answers: case, spaces, punctuation and "St." vs "Saint" don't matter. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\bst\.?\s+/g, "saint ")
    .replace(/[^a-z]/g, "");
}

function buildQuestions(mode: Mode): Question[] {
  const picked = shuffle(STATES).slice(0, mode === "quick" ? QUICK_COUNT : STATES.length);
  return picked.map((s) => {
    const extra = shuffle(STATES.filter((o) => o.code !== s.code))
      .map((o) => o.capital)
      .find((c) => c !== s.capital && !s.decoys.includes(c));
    const options = shuffle(Array.from(new Set([s.capital, ...s.decoys, extra ?? ""])).filter(Boolean));
    return { state: s, options };
  });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Browser storage is a convenience only: it can be missing or blocked.
function readBestRaw(mode: Mode): string | null {
  try {
    return window.localStorage.getItem(`cg-capitals-best-${mode}`);
  } catch {
    return null;
  }
}
function parseBest(raw: string | null): Best | null {
  try {
    return raw ? (JSON.parse(raw) as Best) : null;
  } catch {
    return null;
  }
}
function readBest(mode: Mode): Best | null {
  return parseBest(readBestRaw(mode));
}
const noSubscribe = () => () => {};
function writeBest(mode: Mode, best: Best) {
  try {
    window.localStorage.setItem(`cg-capitals-best-${mode}`, JSON.stringify(best));
  } catch {
    /* storage unavailable: the game still works */
  }
}
function isBetter(a: Best, b: Best | null): boolean {
  if (!b) return true;
  return a.score > b.score || (a.score === b.score && a.seconds < b.seconds);
}

// Fixed positions so the burst looks the same every time (no layout shift).
const CONFETTI: { left: string; top: number; w: number; h: number; color: string; r: string; delay: string; round?: boolean }[] = [
  { left: "6%", top: 18, w: 10, h: 16, color: "#0869ee", r: "220deg", delay: "0s" },
  { left: "12%", top: 64, w: 8, h: 8, color: "#9bd4ff", r: "140deg", delay: ".08s", round: true },
  { left: "18%", top: 30, w: 12, h: 6, color: "#f2b632", r: "260deg", delay: ".15s" },
  { left: "24%", top: 92, w: 8, h: 14, color: "#102840", r: "180deg", delay: ".05s" },
  { left: "30%", top: 14, w: 10, h: 10, color: "#e0592a", r: "300deg", delay: ".2s" },
  { left: "36%", top: 58, w: 6, h: 14, color: "#0869ee", r: "120deg", delay: ".12s" },
  { left: "42%", top: 22, w: 12, h: 8, color: "#9bd4ff", r: "240deg", delay: ".02s" },
  { left: "58%", top: 26, w: 10, h: 16, color: "#f2b632", r: "200deg", delay: ".1s" },
  { left: "64%", top: 70, w: 8, h: 8, color: "#e0592a", r: "160deg", delay: ".18s", round: true },
  { left: "70%", top: 16, w: 12, h: 6, color: "#102840", r: "280deg", delay: ".06s" },
  { left: "76%", top: 96, w: 8, h: 14, color: "#0869ee", r: "210deg", delay: ".22s" },
  { left: "82%", top: 38, w: 10, h: 10, color: "#9bd4ff", r: "130deg", delay: ".04s" },
  { left: "88%", top: 60, w: 6, h: 14, color: "#f2b632", r: "250deg", delay: ".14s" },
  { left: "94%", top: 20, w: 10, h: 8, color: "#e0592a", r: "190deg", delay: ".09s" },
  { left: "3%", top: 160, w: 8, h: 12, color: "#f2b632", r: "230deg", delay: ".3s" },
  { left: "9%", top: 230, w: 10, h: 6, color: "#0869ee", r: "170deg", delay: ".36s" },
  { left: "91%", top: 180, w: 8, h: 12, color: "#102840", r: "290deg", delay: ".33s" },
  { left: "96%", top: 250, w: 10, h: 10, color: "#9bd4ff", r: "150deg", delay: ".4s", round: true },
];

function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {CONFETTI.map((p, i) => (
        <span
          key={i}
          className="cg-confetti"
          style={
            {
              left: p.left,
              top: p.top,
              width: p.w,
              height: p.h,
              background: p.color,
              borderRadius: p.round ? 999 : 2,
              animationDelay: p.delay,
              "--cg-r": p.r,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex-1 basis-[140px] rounded-lg border border-line bg-panel px-4 py-3">
      <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">{label}</div>
      <div className="text-2xl font-bold text-ink">{children}</div>
    </div>
  );
}

export function CapitalsGame() {
  const [phase, setPhase] = useState<Phase>("start");
  const [mode, setMode] = useState<Mode>("quick");
  const [typed, setTyped] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [current, setCurrent] = useState<Answer | null>(null);
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [copied, setCopied] = useState(false);
  // Saved bests, read only in the browser (the server renders none), so hydration matches.
  const quickBestRaw = useSyncExternalStore(noSubscribe, () => readBestRaw("quick"), () => null);
  const allBestRaw = useSyncExternalStore(noSubscribe, () => readBestRaw("all"), () => null);

  function start(m: Mode) {
    setMode(m);
    setQuestions(buildQuestions(m));
    setIndex(0);
    setAnswers([]);
    setCurrent(null);
    setInput("");
    setStreak(0);
    setBestStreak(0);
    setStartedAt(Date.now());
    setNewBest(false);
    setCopied(false);
    setPhase("playing");
  }

  function answer(given: string) {
    if (current) return;
    const q = questions[index];
    const correct = normalize(given) === normalize(q.state.capital);
    const a = { state: q.state, given, correct };
    setCurrent(a);
    setAnswers((prev) => [...prev, a]);
    const s = correct ? streak + 1 : 0;
    setStreak(s);
    setBestStreak((b) => Math.max(b, s));
  }

  function onTyped(e: FormEvent) {
    e.preventDefault();
    if (input.trim()) answer(input.trim());
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setCurrent(null);
      setInput("");
      return;
    }
    const secs = Math.round((Date.now() - startedAt) / 1000);
    const score = answers.filter((a) => a.correct).length;
    const result = { score, total: questions.length, seconds: secs };
    setSeconds(secs);
    if (isBetter(result, readBest(mode))) {
      writeBest(mode, result);
      setNewBest(true);
    }
    setPhase("done");
  }

  async function copyResult(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (phase === "start") {
    const quickBest = parseBest(quickBestRaw);
    const allBest = parseBest(allBestRaw);
    return (
      <section aria-labelledby="start" className="rounded-xl border border-line p-6 sm:p-8">
        <h2 id="start" className="font-serif text-[26px] font-bold text-ink">Choose a game</h2>
        <p className="mt-2 text-muted">Name the capital of each state. A correct answer keeps your streak going.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => start("quick")} className="rounded-lg bg-cobalt px-5 py-4 text-left text-white hover:bg-cobalt-dark">
            <span className="block text-lg font-semibold">Quick 10</span>
            <span className="block text-sm text-white/80">10 random states{quickBest ? `, best ${quickBest.score}/${quickBest.total}` : ""}</span>
          </button>
          <button type="button" onClick={() => start("all")} className="rounded-lg border border-cobalt px-5 py-4 text-left text-cobalt-dark hover:bg-panel">
            <span className="block text-lg font-semibold">All 50</span>
            <span className="block text-sm text-muted">Every state{allBest ? `, best ${allBest.score}/50 in ${formatTime(allBest.seconds)}` : ""}</span>
          </button>
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={typed} onChange={(e) => setTyped(e.target.checked)} />
          Hard mode: type answers instead of choosing
        </label>
      </section>
    );
  }

  if (phase === "playing") {
    const q = questions[index];
    const score = answers.filter((a) => a.correct).length;
    return (
      <>
        <div className="mb-5 flex flex-wrap gap-3">
          <Stat label="Score">
            {score} <span className="text-base font-normal text-muted">of {questions.length}</span>
          </Stat>
          <Stat label="Streak">{streak}</Stat>
          <Stat label="Question">
            {index + 1} <span className="text-base font-normal text-muted">of {questions.length}</span>
          </Stat>
        </div>

        <section aria-labelledby="question" className="rounded-xl border border-line p-6 sm:p-8">
          <p className="text-sm text-muted">What is the capital of</p>
          <h2 id="question" className="mb-6 mt-1 font-serif text-[34px] font-bold text-ink sm:text-[40px]">{q.state.state}?</h2>

          {typed ? (
            <form onSubmit={onTyped} className="flex flex-wrap gap-3">
              <label htmlFor="capital-answer" className="sr-only">Capital of {q.state.state}</label>
              <input
                id="capital-answer"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!!current}
                autoComplete="off"
                placeholder="Type the capital"
                className="h-14 min-w-0 flex-1 basis-[240px] rounded-lg border border-[#b9c8d9] px-4 text-lg"
              />
              <button type="submit" disabled={!!current || !input.trim()} className="h-14 rounded-lg bg-cobalt px-6 font-semibold text-white hover:bg-cobalt-dark disabled:opacity-40">
                Answer
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {q.options.map((opt) => {
                const isRight = current && opt === q.state.capital;
                const isWrongPick = current && !current.correct && opt === current.given;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => answer(opt)}
                    disabled={!!current}
                    className={`h-14 rounded-lg border text-[17px] ${
                      isRight
                        ? "border-2 border-[#1d6047] bg-[#e7f4ee] font-semibold"
                        : isWrongPick
                          ? "border-2 border-[#9a3412] bg-[#fff4ed]"
                          : "border-line bg-white hover:border-cobalt"
                    } text-ink disabled:cursor-default`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          <div aria-live="polite">
            {current ? (
              <div
                className={`mt-5 rounded-lg border px-4 py-3 text-[15px] ${
                  current.correct ? "border-[#b7dfc4] bg-[#eef8f1] text-[#14532d]" : "border-[#f5c9ab] bg-[#fff4ed] text-[#7c2d12]"
                }`}
              >
                {current.correct ? "Correct: " : "Not quite: "}
                {q.state.capital} is the capital of {q.state.state}.{" "}
                <Link href={`/states/${stateSlug(q.state.state)}`} className="font-semibold text-cobalt-dark underline">
                  Explore {q.state.state} on CivicGrid
                </Link>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex justify-end">
            <button type="button" onClick={next} disabled={!current} className="h-12 rounded-lg bg-cobalt px-6 font-semibold text-white hover:bg-cobalt-dark disabled:opacity-40">
              {index + 1 < questions.length ? "Next question" : "See results"}
            </button>
          </div>
        </section>
      </>
    );
  }

  // Results
  const score = answers.filter((a) => a.correct).length;
  const total = questions.length;
  const perfect = score === total;
  const missed = answers.filter((a) => !a.correct);
  const shareText = perfect
    ? `I named ${total === 50 ? "all 50 state capitals" : `${total} of ${total} state capitals`} on CivicGrid in ${formatTime(seconds)}.\ncivicgrid.org/play/capitals`
    : `I got ${score}/${total} state capitals on CivicGrid in ${formatTime(seconds)}.\ncivicgrid.org/play/capitals`;

  return (
    <section aria-labelledby="result" className="relative overflow-hidden rounded-2xl border border-line px-6 pb-10 pt-16 text-center sm:px-8">
      {perfect ? <Confetti /> : null}
      <div className="relative">
        {newBest ? (
          <span className="inline-block rounded-full bg-[#f2b632] px-3 py-1 text-[12px] font-bold uppercase tracking-[0.06em] text-navy">New personal best</span>
        ) : null}
        <h2 id="result" className="mt-4 font-serif text-[40px] font-bold leading-tight text-ink sm:text-[48px]">
          {perfect ? "Perfect run!" : score >= total * 0.8 ? "Great job!" : "Nice try!"}
        </h2>
        <p className="mt-2 text-lg text-muted">
          {perfect
            ? total === 50
              ? "You named all 50 state capitals."
              : `You named all ${total} capitals in ${MODE_LABEL[mode]}.`
            : `You got ${score} of ${total} capitals.`}
        </p>

        <div className="my-7 flex flex-wrap justify-center gap-3">
          <Stat label="Score">
            {score} / {total}
          </Stat>
          <Stat label="Time">{formatTime(seconds)}</Stat>
          <Stat label="Best streak">{bestStreak}</Stat>
        </div>

        {missed.length > 0 ? (
          <div className="mx-auto mb-6 max-w-[480px] rounded-lg border border-line text-left">
            <h3 className="border-b border-line bg-panel px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">To review</h3>
            <ul>
              {missed.map((m) => (
                <li key={m.state.code} className="flex justify-between gap-4 border-b border-line px-4 py-2 text-[15px] last:border-b-0">
                  <span>{m.state.state}</span>
                  <span className="font-semibold">{m.state.capital}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mx-auto max-w-[440px] rounded-lg border border-dashed border-[#b9c8d9] bg-panel p-4 text-left">
          <p className="mb-1 text-[13px] font-semibold text-muted">Share your result</p>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink">{shareText}</pre>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => copyResult(shareText)} className="h-12 rounded-lg bg-cobalt px-5 font-semibold text-white hover:bg-cobalt-dark">
            {copied ? "Copied" : "Copy result"}
          </button>
          <button type="button" onClick={() => start(mode)} className="h-12 rounded-lg border border-cobalt px-5 font-semibold text-cobalt-dark hover:bg-panel">
            Play again
          </button>
          {!typed ? (
            <button
              type="button"
              onClick={() => {
                setTyped(true);
                start(mode);
              }}
              className="h-12 rounded-lg border border-line px-5 text-ink hover:bg-panel"
            >
              Try hard mode (type answers)
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
