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
    <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        
        {/* LEFT: BRAND */}
        <Link href="/dashboard" className="inline-flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="Signal"
            width={28}
            height={28}
            className="rounded-md"
            priority
          />
          <span className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900">
            Signal
          </span>
        </Link>

        {/* RIGHT */}
        {showLogout ? <LogoutButton /> : <div />}
      </div>
    </header>
  );
}