"use client";

import { useEffect, useState } from "react";
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

type SentimentHistory = {
  stakeholder_id: number;
  sentiment: string;
  created_at: string;
};

export default function ClientDashboardPage() {
  const supabase = createClient();

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [history, setHistory] = useState<SentimentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // visible stakeholders only
    const { data: stakeholdersData } = await supabase
      .from("Stakeholders")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_client_visible", true);

    const { data: historyData } = await supabase
      .from("stakeholder_sentiment_history")
      .select("*")
      .eq("user_id", user.id);

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
    ).toLowerCase();

    if (source.includes("positive") || source.includes("supportive")) {
      return "Supportive";
    }

    if (source.includes("negative") || source.includes("resistant")) {
      return "Needs attention";
    }

    return "Neutral";
  }

  function getTrend(stakeholderId: number) {
    const records = history
      .filter((h) => h.stakeholder_id === stakeholderId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (records.length < 2) return "–";

    const latest = records[records.length - 1].sentiment;
    const previous = records[records.length - 2].sentiment;

    if (latest === previous) return "→ Stable";

    if (latest === "positive") return "↑ Improving";
    if (latest === "negative") return "↓ Declining";

    return "→ Stable";
  }

  function getColor(sentiment: string) {
    if (sentiment === "Supportive") return "text-emerald-700";
    if (sentiment === "Needs attention") return "text-rose-700";
    return "text-amber-700";
  }

  if (loading) {
    return <p className="p-6 text-slate-500">Loading…</p>;
  }

  return (
    <>
      <AppHeader />

      <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold text-slate-900">
            Stakeholder overview
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            A high-level view of stakeholder engagement and direction.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-4">Stakeholder</th>
                  <th className="px-6 py-4">Sentiment</th>
                  <th className="px-6 py-4">Trend</th>
                </tr>
              </thead>

              <tbody>
                {stakeholders.map((s) => {
                  const sentiment = getSentimentLabel(s);
                  const trend = getTrend(s.id);

                  return (
                    <tr key={s.id} className="border-t">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {s.name}
                      </td>

                      <td className={`px-6 py-4 font-medium ${getColor(sentiment)}`}>
                        {sentiment}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {trend}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}