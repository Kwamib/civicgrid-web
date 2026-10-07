import Link from "next/link";

export function BetaNotice() {
  return (
    <div className="bg-[#edf5ff] text-[#345270]">
      <p className="mx-auto max-w-[1400px] px-4 py-2.5 text-center text-xs leading-relaxed sm:px-6 lg:px-8">
        <span className="font-semibold">CivicGrid is in active development.</span> Records are being
        checked against official sources, and each city shows when it was last verified.{" "}
        <Link href="/correction" className="underline underline-offset-2 hover:text-navy">
          Spotted an error?
        </Link>
      </p>
    </div>
  );
}
