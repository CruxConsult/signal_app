export default function Logo() {
  return (
    <div className="inline-flex items-center gap-3" aria-label="Crux">
      {/* Citrine cross mark */}
      <svg
        width="30"
        height="30"
        viewBox="0 0 28 28"
        fill="none"
        className="shrink-0"
        aria-hidden="true"
      >
        <line
          x1="14"
          y1="3"
          x2="14"
          y2="25"
          stroke="#F4C430"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <line
          x1="3"
          y1="14"
          x2="25"
          y2="14"
          stroke="#F4C430"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark */}
      <span className="text-[26px] font-semibold tracking-[-0.02em] text-[#0C1E33] leading-none">
        Crux
      </span>
    </div>
  );
}