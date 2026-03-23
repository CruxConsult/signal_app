import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-3 rounded-full px-1 py-1"
      aria-label="Crux Consult"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <line
          x1="14"
          y1="2"
          x2="14"
          y2="26"
          stroke="#0C1E33"
          strokeWidth="1.6"
        />
        <line
          x1="2"
          y1="14"
          x2="26"
          y2="14"
          stroke="#0C1E33"
          strokeWidth="1.6"
        />
      </svg>

      <div className="leading-none">
        <div className="flex items-baseline gap-2">
          <span className="text-[24px] font-semibold tracking-wide text-[#0C1E33] md:text-[26px]">
            CRUX
          </span>
          <span className="text-[18px] uppercase tracking-[0.18em] text-[rgba(12,30,51,0.7)]">
            Consult
          </span>
        </div>
      </div>
    </Link>
  );
}