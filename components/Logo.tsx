import Image from "next/image";

export default function Logo() {
  return (
    <div className="inline-flex items-center gap-3" aria-label="Signal">
      <Image
        src="/signal-mark-navy.png"
        alt="Signal logo"
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 object-contain"
        priority
      />
      <span className="text-[26px] font-semibold tracking-[-0.02em] text-[#0C1E33] leading-none">
        Signal
      </span>
    </div>
  );
}