"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

type ClientViewRow = {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
};

export default function ClientSharePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tokenRow, setTokenRow] = useState<ClientViewRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadClientView();
  }, []);

  async function loadClientView() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("client_views")
      .select("id, user_id, token, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Load client view error:", error);
    }

    setTokenRow(data || null);
    setLoading(false);
  }

  function generateToken() {
    return crypto.randomUUID().replaceAll("-", "");
  }

  async function handleCreateOrRefreshLink() {
    setIsSaving(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const token = generateToken();

    if (tokenRow) {
      const { data, error } = await supabase
        .from("client_views")
        .update({ token })
        .eq("id", tokenRow.id)
        .eq("user_id", user.id)
        .select("id, user_id, token, created_at")
        .single();

      if (error) {
        console.error("Update client view token error:", error);
        setMessage("Could not refresh link.");
        setIsSaving(false);
        return;
      }

      setTokenRow(data);
      setMessage("Client link refreshed.");
    } else {
      const { data, error } = await supabase
        .from("client_views")
        .insert([
          {
            user_id: user.id,
            token,
          },
        ])
        .select("id, user_id, token, created_at")
        .single();

      if (error) {
        console.error("Create client view token error:", error);
        setMessage("Could not create link.");
        setIsSaving(false);
        return;
      }

      setTokenRow(data);
      setMessage("Client link created.");
    }

    setIsSaving(false);
  }

  async function handleCopyLink() {
    if (!tokenRow) return;

    const link = `${window.location.origin}/client/${tokenRow.token}`;
    await navigator.clipboard.writeText(link);
    setMessage("Client link copied.");
  }

  const shareLink = useMemo(() => {
    if (!tokenRow) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/client/${tokenRow.token}`;
  }, [tokenRow]);

  if (loading) {
    return (
      <>
        <AppHeader showLogout={true} />
        <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-[15px] text-slate-500">Loading client sharing…</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader showLogout={true} />
      <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-900">
              Client sharing
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">
              Create a private client link for the stakeholder overview. Only
              stakeholders marked for client view will appear.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Shareable link
                </p>

                {tokenRow ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[14px] text-slate-700 break-all">
                    {shareLink || "Link will appear after page load."}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[14px] text-slate-500">
                    No client link created yet.
                  </div>
                )}
              </div>

              {message && (
                <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              )}

              <div className="flex flex-col items-end gap-2">
                {tokenRow && (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="min-w-[160px] rounded-2xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-200"
                  >
                    Copy link
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCreateOrRefreshLink}
                  disabled={isSaving}
                  className="min-w-[160px] rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isSaving
                    ? "Saving..."
                    : tokenRow
                    ? "Refresh link"
                    : "Create link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}