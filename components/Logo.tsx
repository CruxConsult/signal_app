import Image from "next/image";

export default function Logo() {
  return (
    <div className="inline-flex items-center gap-3" aria-label="Signal">
      <Image
        src="/signal-mark-navy.png"
        alt="Signal logo"
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 object-contain"
        priority
      />
      <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#0C1E33]">
        Signal
      </span>
    </div>
  );
}