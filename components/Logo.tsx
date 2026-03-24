import Image from "next/image";

export default function Logo() {
  return (
    <div
      className="inline-flex items-center gap-3"
      aria-label="Signal"
    >
      <Image
        src="/icon.png"
        alt="Signal logo"
        width={30}
        height={30}
        className="shrink-0 rounded-lg"
        priority
      />

      <span className="text-[28px] font-semibold tracking-[-0.02em] text-[#0C1E33]">
        Signal
      </span>
    </div>
  );
}