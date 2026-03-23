"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogIn(e: FormEvent) {
    e.preventDefault();
    setMessage("Logging in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <>
      <AppHeader showLogout={false} />
      <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center justify-center">
          <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="hidden rounded-[32px] border border-white/60 bg-white/55 p-10 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:block">
              <div className="max-w-md">
                <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs font-medium tracking-[0.02em] text-slate-600">
                  Signal
                </div>

                <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-slate-900">
                  A clearer way to think about the people you work with.
                </h1>

                <p className="mt-5 text-[17px] leading-8 text-slate-600">
                  Use it to capture what you are noticing, sense-check your gut
                  feel, and surface alternative readings of important relationships.
                </p>

                <div className="mt-8 space-y-3">
                  <div className="rounded-[22px] border border-emerald-200/70 bg-emerald-50/80 p-4">
                    <p className="text-sm font-medium text-emerald-800">
                      Validate instinct
                    </p>
                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      Bring your own judgement together with signals from interactions so you can see whether they point in the same direction.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-amber-200/70 bg-amber-50/80 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      Consider another angle
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-700">
                      AI insight can help you pause, reflect, and test whether there may be a different interpretation worth considering.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4">
                    <p className="text-sm font-medium text-slate-800">
                      Think ahead
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Keep a clearer view of changing relationships over time so you can prepare for conversations with more confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-10">
              <div className="mx-auto max-w-md">
                <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-slate-50 px-3 py-1 text-xs font-medium tracking-[0.02em] text-slate-600 lg:hidden">
                  Signal
                </div>

                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-900 lg:mt-0">
                  Log in
                </h2>
                <p className="mt-2 text-[15px] leading-6 text-slate-500">
                  Welcome back. Log in to continue to your stakeholder workspace.
                </p>

                <form className="mt-8 space-y-5" onSubmit={handleLogIn}>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-[0_6px_18px_rgba(15,23,42,0.16)] transition hover:bg-slate-700"
                    >
                      Log in
                    </button>

                    <div className="pt-2 text-center">
                      <p className="text-sm text-slate-500">
                        Access is currently limited. If you need an account, speak to your administrator.
                      </p>
                    </div>
                  </div>
                </form>

                {message && (
                  <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                    <p className="text-sm leading-6 text-slate-600">{message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}