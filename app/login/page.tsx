"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleLogIn(e: FormEvent) {
    e.preventDefault();

    setIsSubmitting(true);
    setIsError(false);
    setMessage("Logging in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsError(true);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <p className="text-sm text-slate-500">
            Sign in to your workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogIn} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">
              Email
            </label>
            <input
              ref={emailRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none ffocus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-[0_6px_18px_rgba(15,23,42,0.16)] transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              isError ? "text-red-500" : "text-slate-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}