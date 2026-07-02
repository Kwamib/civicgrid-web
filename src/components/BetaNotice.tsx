export function BetaNotice() {
  return (
    <div className="bg-amber-50 border-b border-amber-100">
      <div className="mx-auto max-w-3xl px-6 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
        <svg className="w-4 h-4 flex-shrink-0 mt-px text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="leading-relaxed">
          <span className="font-medium">CivicGrid is in active development.</span> Leadership data is being verified against official sources and may contain inaccuracies. Spotted an error? <a href="mailto:hello@civicgrid.org?subject=Data%20correction" className="underline hover:text-amber-950 transition">Let us know</a>.
        </p>
      </div>
    </div>
  );
}
