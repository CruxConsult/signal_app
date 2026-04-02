"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

type Stakeholder = {
  id: number;
  name: string;
  status: string;
  manual_status?: string | null;
  ai_sentiment?: string | null;
  is_client_visible?: boolean | null;
};

type SentimentHistoryRow = {
  id: number;
  stakeholder_id: number;
  stakeholder_sentiment?: string | null;
  created_at: string;
};

function TrendPill({ trend }: { trend: string }) {
  const tone =
    trend === "↑ Improving"
      ? "border-emerald-200/70 bg-emerald-50 text-emerald-700"
      : trend === "↓ Declining"
      ? "border-rose-200/70 bg-rose-50 text-rose-700"
      : "border-slate-200/70 bg-slate-50 text-slate-600";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${tone}`}
    >
      {trend}
    </span>
  );
}

function SentimentPill({ sentiment }: { sentiment: string }) {
  const tone =
    sentiment === "Supportive"
      ? "border-emerald-200/70 bg-emerald-50 text-emerald-700"
      : sentiment === "Needs attention"
      ? "border-rose-200/70 bg-rose-50 text-rose-700"
      : "border-amber-200/70 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${tone}`}
    >
      {sentiment}
    </span>
  );
}

export default function ClientDashboardPage() {
  const supabase = createClient();

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [history, setHistory] = useState<SentimentHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: stakeholdersData, error: stakeholdersError } = await supabase
      .from("Stakeholders")
      .select("id, name, status, manual_status, ai_sentiment, is_client_visible")
      .eq("user_id", user.id)
      .eq("is_client_visible", true)
      .order("name", { ascending: true });

    if (stakeholdersError) {
      console.error("Load client stakeholders error:", stakeholdersError);
      setLoading(false);
      return;
    }

    const { data: historyData, error: historyError } = await supabase
      .from("stakeholder_sentiment_history")
      .select("id, stakeholder_id, stakeholder_sentiment, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (historyError) {
      console.error("Load sentiment history error:", historyError);
      setLoading(false);
      return;
    }

    setStakeholders(stakeholdersData || []);
    setHistory(historyData || []);
    setLoading(false);
  }

  function getSentimentLabel(stakeholder: Stakeholder) {
    const source = (
      stakeholder.manual_status ||
      stakeholder.ai_sentiment ||
      stakeholder.status ||
      ""
    )
      .toLowerCase()
      .trim();

    if (
      source.includes("positive") ||
      source.includes("supportive") ||
      source.includes("champion") ||
      source.includes("engaged") ||
      source.includes("warming")
    ) {
      return "Supportive";
    }

    if (
      source.includes("negative") ||
      source.includes("resistant") ||
      source.includes("opposed") ||
      source.includes("blocker") ||
      source.includes("hostile")
    ) {
      return "Needs attention";
    }

    return "Neutral";
  }

  function normaliseSentiment(value: string | null | undefined) {
    const source = (value || "").toLowerCase().trim();

    if (
      source.includes("positive") ||
      source.includes("supportive") ||
      source.includes("champion") ||
      source.includes("engaged") ||
      source.includes("warming")
    ) {
      return "positive";
    }

    if (
      source.includes("negative") ||
      source.includes("resistant") ||
      source.includes("opposed") ||
      source.includes("blocker") ||
      source.includes("hostile")
    ) {
      return "negative";
    }

    return "neutral";
  }

  function getTrend(stakeholderId: number) {
    const records = history
      .filter((row) => row.stakeholder_id === stakeholderId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    if (records.length < 2) {
      return "→ Stable";
    }

    const previous = normaliseSentiment(
      records[records.length - 2].stakeholder_sentiment
    );
    const latest = normaliseSentiment(
      records[records.length - 1].stakeholder_sentiment
    );

    if (latest === previous) {
      return "→ Stable";
    }

    if (
      (previous === "negative" && latest === "neutral") ||
      (previous === "neutral" && latest === "positive") ||
      (previous === "negative" && latest === "positive")
    ) {
      return "↑ Improving";
    }

    if (
      (previous === "positive" && latest === "neutral") ||
      (previous === "neutral" && latest === "negative") ||
      (previous === "positive" && latest === "negative")
    ) {
      return "↓ Declining";
    }

    return "→ Stable";
  }

  const summary = useMemo(() => {
    const supportive = stakeholders.filter(
      (s) => getSentimentLabel(s) === "Supportive"
    ).length;
    const neutral = stakeholders.filter(
      (s) => getSentimentLabel(s) === "Neutral"
    ).length;
    const attention = stakeholders.filter(
      (s) => getSentimentLabel(s) === "Needs attention"
    ).length;

    return { supportive, neutral, attention };
  }, [stakeholders]);

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-[15px] text-slate-500">Loading client view...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-900">
              Stakeholder overview
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">
              A high-level view of stakeholder sentiment and direction of travel,
              designed for client-facing review.
            </p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-emerald-200/60 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
              <p className="text-sm font-medium text-slate-500">Supportive</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                {summary.supportive}
              </p>
            </div>

            <div className="rounded-[24px] border border-amber-200/60 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
              <p className="text-sm font-medium text-slate-500">Neutral</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                {summary.neutral}
              </p>
            </div>

            <div className="rounded-[24px] border border-rose-200/60 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
              <p className="text-sm font-medium text-slate-500">
                Needs attention
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                {summary.attention}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="border-b border-slate-200/70 px-6 py-5 md:px-8">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-900">
                Included stakeholders
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Client-safe view showing current sentiment and recent movement.
              </p>
            </div>

            {stakeholders.length === 0 ? (
              <div className="px-6 py-10 md:px-8">
                <p className="text-[15px] text-slate-500">
                  No stakeholders are currently included in client view.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/70">
                {stakeholders.map((stakeholder) => {
                  const sentiment = getSentimentLabel(stakeholder);
                  const trend = getTrend(stakeholder.id);

                  return (
                    <div
                      key={stakeholder.id}
                      className="grid gap-4 px-6 py-5 md:grid-cols-[1.5fr_1fr_1fr] md:items-center md:px-8"
                    >
                      <div>
                        <p className="text-[16px] font-semibold text-slate-900">
                          {stakeholder.name}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <SentimentPill sentiment={sentiment} />
                      </div>

                      <div className="flex items-center">
                        <TrendPill trend={trend} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}