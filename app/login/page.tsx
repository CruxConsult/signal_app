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
    <main className="min-h-screen bg-[#0C1E33] text-[#F9FAFB]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left side / brand */}
        <section className="flex items-center px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-3xl lg:mx-0">
            <div className="mb-8">
              <Logo />
            </div>

            <div className="mt-8 border-l border-[rgba(244,196,48,0.9)] pl-5 sm:pl-6">
              <h1 className="text-3xl leading-[1.15] tracking-[-0.02em] text-[#F9FAFB] sm:text-4xl lg:text-5xl">
                Understand people better.
                <br />
                Make better decisions.
              </h1>
            </div>

            <p className="mt-8 max-w-xl text-sm leading-7 text-[rgba(249,250,251,0.78)] sm:text-base">
              AI-enabled insight to help you validate instincts, uncover new
              angles, and make more confident decisions about how to engage.
            </p>
          </div>
        </section>

        {/* Right side / login */}
        <section className="flex items-center px-6 pb-12 pt-2 sm:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <div className="mb-6">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-[rgba(244,196,48,0.9)]">
                  Sign in
                </p>
                <h2 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-[#F9FAFB]">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-6 text-[rgba(249,250,251,0.72)]">
                  Sign in to your workspace
                </p>
              </div>

              <form onSubmit={handleLogIn} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-[rgba(249,250,251,0.88)]">
                    Email
                  </label>
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-[#F9FAFB] outline-none transition placeholder:text-white/35 focus:border-[rgba(244,196,48,0.9)] focus:ring-2 focus:ring-[rgba(244,196,48,0.18)]"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[rgba(249,250,251,0.88)]">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-[#F9FAFB] outline-none transition placeholder:text-white/35 focus:border-[rgba(244,196,48,0.9)] focus:ring-2 focus:ring-[rgba(244,196,48,0.18)]"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[rgba(244,196,48,0.92)] px-5 py-3 text-sm font-semibold text-[#0C1E33] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Logging in..." : "Log in"}
                </button>
              </form>

              {message && (
                <p
                  className={`mt-4 text-center text-sm ${
                    isError
                      ? "text-red-200"
                      : "text-[rgba(249,250,251,0.72)]"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}