import Link from "next/link";

export function BetaNotice() {
  return (
    <div className="bg-[#edf5ff] text-[#345270]">
      <p className="px-5 py-2.5 text-center text-[11px] leading-relaxed sm:text-xs">
        <span className="font-semibold">CivicGrid is in active development.</span> Records are being
        checked against official sources, and each city shows when it was last verified.{" "}
        <Link href="/correction" className="underline underline-offset-2 hover:text-navy">
          Spotted an error?
        </Link>
      </p>
    </div>
  );
}
