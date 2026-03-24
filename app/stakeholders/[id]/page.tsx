"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import AIInsightSection from "@/components/stakeholders/AIInsightSection";
import SentimentHistorySection from "@/components/stakeholders/SentimentHistorySection";
import InteractionHistorySection from "@/components/stakeholders/InteractionHistorySection";
import StakeholderSummaryGrid from "@/components/stakeholders/StakeholderSummaryGrid";
import ManualStatusSection from "@/components/stakeholders/ManualStatusSection";
import LogInteractionSection from "@/components/stakeholders/LogInteractionSection";
import {
  Insight,
  Interaction,
  SentimentHistoryRow,
  Stakeholder,
} from "@/components/stakeholders/types";
import { getTrend, splitLines } from "@/components/stakeholders/utils";

export default function StakeholderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const supabase = createClient();
  const router = useRouter();

  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [sentimentHistory, setSentimentHistory] = useState<SentimentHistoryRow[]>(
    []
  );
  const [manualStatus, setManualStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const [interactionDate, setInteractionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sourceType, setSourceType] = useState("meeting");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [insight, setInsight] = useState<Insight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");

  const [flashMessage, setFlashMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function showMessage(type: "success" | "error", text: string) {
    setFlashMessage({ type, text });
    window.setTimeout(() => {
      setFlashMessage(null);
    }, 2500);
  }

  async function loadStakeholder() {
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

    const { data, error } = await supabase
      .from("Stakeholders")
      .select("*")
      .eq("id", Number(id))
      .eq("user_id", user?.id)
      .single();

    if (error) {
      console.error("Load stakeholder error:", error);
      return;
    }

    setStakeholder(data);
    setManualStatus(data.manual_status || "");

    if (
      data.ai_stakeholder_sentiment ||
      data.ai_personal_sentiment ||
      data.ai_relationship_strength ||
      data.ai_evidence_strength ||
      data.ai_summary ||
      data.ai_what_changed ||
      data.ai_suggested_approach ||
      data.ai_sentiment_rationale ||
      data.ai_key_signals ||
      data.ai_supporting_signals ||
      data.ai_counter_signals ||
      data.ai_uncertainties
    ) {
      setInsight({
        stakeholder_sentiment: data.ai_stakeholder_sentiment || "",
        personal_sentiment: data.ai_personal_sentiment || "",
        relationship_strength: data.ai_relationship_strength || "",
        evidence_strength: data.ai_evidence_strength || "",
        confidence:
          typeof data.ai_sentiment_confidence === "number"
            ? data.ai_sentiment_confidence
            : 0,
        summary: data.ai_summary || "",
        what_changed: data.ai_what_changed || "",
        suggested_approach: data.ai_suggested_approach || "",
        rationale: data.ai_sentiment_rationale || "",
        supporting_signals: splitLines(data.ai_supporting_signals),
        counter_signals: splitLines(data.ai_counter_signals),
        uncertainties: splitLines(data.ai_uncertainties),
        key_signals: splitLines(data.ai_key_signals),
      });
    } else {
      setInsight(null);
    }
  }

  async function loadInteractions() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("interactions")
      .select("*")
      .eq("stakeholder_id", Number(id))
      .eq("user_id", user?.id)
      .order("interaction_date", { ascending: false });

    if (error) {
      console.error("Load interactions error:", error);
      return;
    }

    setInteractions(data || []);
  }

  async function loadSentimentHistory() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("stakeholder_sentiment_history")
      .select("*")
      .eq("stakeholder_id", Number(id))
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load sentiment history error:", error);
      return;
    }

    setSentimentHistory(data || []);
  }

  useEffect(() => {
    async function init() {
      await loadStakeholder();
      await loadInteractions();
      await loadSentimentHistory();
      setLoading(false);
    }

    init();
  }, []);

  async function handleSaveManualStatus(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("Stakeholders")
      .update({
        manual_status: manualStatus || null,
      })
      .eq("id", Number(id))
      .eq("user_id", user?.id);

    if (error) {
      console.error("Update manual status error:", error);
      showMessage("error", "Could not save manual status.");
      return;
    }

    await loadStakeholder();
    showMessage("success", "Manual status saved.");
  }

  async function handleAddInteraction(e: React.FormEvent) {
    e.preventDefault();

    if (!interactionDate || !sourceType || !content) {
      showMessage("error", "Please complete the required interaction fields.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("interactions").insert([
      {
        stakeholder_id: Number(id),
        user_id: user?.id,
        interaction_date: interactionDate,
        source_type: sourceType,
        title: title || null,
        content,
      },
    ]);

    if (error) {
      console.error("Add interaction error:", error);
      showMessage("error", "Could not save interaction.");
      return;
    }

    setInteractionDate(new Date().toISOString().split("T")[0]);
    setSourceType("meeting");
    setTitle("");
    setContent("");

    await loadInteractions();
    showMessage("success", "Interaction saved.");
  }

  async function handleDeleteInteraction(interaction: Interaction) {
    const confirmed = window.confirm(
      `Delete this interaction${
        interaction.title ? `: "${interaction.title}"` : ""
      }?`
    );

    if (!confirmed) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("id", interaction.id)
      .eq("user_id", user?.id);

    if (error) {
      console.error("Delete interaction error:", error);
      showMessage("error", "Could not delete interaction.");
      return;
    }

    await loadInteractions();
    showMessage("success", "Interaction deleted.");
  }

  async function handleGenerateInsight() {
    if (!stakeholder || interactions.length === 0) {
      setInsightError("Add at least one interaction before generating insight.");
      return;
    }

    setInsightLoading(true);
    setInsightError("");
    setInsight(null);

    try {
      const response = await fetch("/api/generate-insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stakeholderName: stakeholder.name,
          stakeholderRole: stakeholder.role,
          stakeholderSummary: stakeholder.summary,
          interactions: interactions.slice(0, 3),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setInsightError(data.error || "Failed to generate insight.");
        setInsightLoading(false);
        return;
      }

      const generatedInsight: Insight = data.result;
      setInsight(generatedInsight);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: saveError } = await supabase
        .from("Stakeholders")
        .update({
          status: generatedInsight.stakeholder_sentiment,
          ai_sentiment: generatedInsight.stakeholder_sentiment,
          ai_stakeholder_sentiment: generatedInsight.stakeholder_sentiment,
          ai_personal_sentiment: generatedInsight.personal_sentiment,
          ai_relationship_strength: generatedInsight.relationship_strength,
          ai_evidence_strength: generatedInsight.evidence_strength,
          ai_sentiment_confidence: generatedInsight.confidence,
          ai_sentiment_rationale: generatedInsight.rationale,
          ai_summary: generatedInsight.summary,
          ai_what_changed: generatedInsight.what_changed,
          ai_suggested_approach: generatedInsight.suggested_approach,
          ai_key_signals: generatedInsight.key_signals.join("\n"),
          ai_supporting_signals: generatedInsight.supporting_signals.join("\n"),
          ai_counter_signals: generatedInsight.counter_signals.join("\n"),
          ai_uncertainties: generatedInsight.uncertainties.join("\n"),
        })
        .eq("id", Number(id))
        .eq("user_id", user?.id);

      if (saveError) {
        console.error("Save insight error:", saveError);
        setInsightError("Insight generated, but failed to save it.");
        showMessage("error", "Insight generated, but saving failed.");
        setInsightLoading(false);
        return;
      }

      const { error: historyError } = await supabase
        .from("stakeholder_sentiment_history")
        .insert([
          {
            stakeholder_id: Number(id),
            user_id: user?.id,
            stakeholder_sentiment: generatedInsight.stakeholder_sentiment,
            personal_sentiment: generatedInsight.personal_sentiment,
            relationship_strength: generatedInsight.relationship_strength,
            evidence_strength: generatedInsight.evidence_strength,
            confidence: generatedInsight.confidence,
            rationale: generatedInsight.rationale,
            supporting_signals: generatedInsight.supporting_signals.join("\n"),
            counter_signals: generatedInsight.counter_signals.join("\n"),
            uncertainties: generatedInsight.uncertainties.join("\n"),
          },
        ]);

      if (historyError) {
        console.error("Save sentiment history error:", historyError);
      }

      await loadStakeholder();
      await loadSentimentHistory();
      showMessage("success", "Insight generated.");
    } catch (error) {
      console.error(error);
      setInsightError("Something went wrong generating the insight.");
      showMessage("error", "Something went wrong generating the insight.");
    } finally {
      setInsightLoading(false);
    }
  }

  const trend = useMemo(() => getTrend(sentimentHistory), [sentimentHistory]);

  if (loading) {
    return (
      <>
        <AppHeader showLogout={true} />
        <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-[15px] text-slate-500">Loading stakeholder...</p>
          </div>
        </main>
      </>
    );
  }

  if (!stakeholder) {
    return (
      <>
        <AppHeader showLogout={true} />
        <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              ← Back to dashboard
            </Link>
            <p className="mt-6 text-[15px] text-slate-500">Stakeholder not found.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader showLogout={true} />
      <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to dashboard
          </Link>

          {flashMessage && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                flashMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {flashMessage.text}
            </div>
          )}

          <div className="mt-6 rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
  <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-900">
    {stakeholder.name}
  </h1>
  <p className="mt-2 text-[15px] text-slate-500">
    {stakeholder.role}
  </p>
</div>

              <div className={`rounded-full border px-4 py-2 text-sm font-medium ${trend.tone}`}>
                Trend: {trend.label}
              </div>
            </div>

            <StakeholderSummaryGrid
              stakeholder={stakeholder}
              interactions={interactions}
            />

            <AIInsightSection
              insight={insight}
              insightLoading={insightLoading}
              insightError={insightError}
              onGenerateInsight={handleGenerateInsight}
            />

            <SentimentHistorySection sentimentHistory={sentimentHistory} />

            <ManualStatusSection
              manualStatus={manualStatus}
              setManualStatus={setManualStatus}
              onSave={handleSaveManualStatus}
            />

            <LogInteractionSection
              interactionDate={interactionDate}
              setInteractionDate={setInteractionDate}
              sourceType={sourceType}
              setSourceType={setSourceType}
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              onSave={handleAddInteraction}
            />

            <InteractionHistorySection
              interactions={interactions}
              onDeleteInteraction={handleDeleteInteraction}
            />
          </div>
        </div>
      </main>
    </>
  );
}