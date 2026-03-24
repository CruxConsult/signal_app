"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";

export default function AppHeader({
  showLogout = false,
}: {
  showLogout?: boolean;
}) {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 transition hover:opacity-90"
        >
          <Image
            src="/signal-mark-white.png"
            alt="Signal"
            width={36}
            height={36}
            className="rounded-xl"
            priority
          />
          <span className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">
            Signal
          </span>
        </Link>

        {showLogout ? <LogoutButton /> : <div />}
      </div>
    </header>
  );
}