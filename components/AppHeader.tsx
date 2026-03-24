"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
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
          className="inline-flex items-center transition hover:opacity-90"
        >
          <Logo />
        </Link>

        {showLogout ? <LogoutButton /> : <div />}
      </div>
    </header>
  );
}