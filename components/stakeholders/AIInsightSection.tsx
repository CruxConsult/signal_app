"use client";

import CollapsibleSection from "@/components/stakeholders/CollapsibleSection";
import { Insight } from "@/components/stakeholders/types";
import { formatConfidence } from "@/components/stakeholders/utils";

export default function AIInsightSection({
  insight,
  insightLoading,
  insightError,
  onGenerateInsight,
}: {
  insight: Insight | null;
  insightLoading: boolean;
  insightError: string;
  onGenerateInsight: () => Promise<void>;
}) {
  return (
    <CollapsibleSection
      title="AI insight"
      defaultOpen={true}
      rightContent={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onGenerateInsight}
            disabled={insightLoading}
            className="min-w-[140px] rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {insightLoading ? "Generating..." : "Generate insight"}
          </button>
        </div>
      }
    >
      {insightError && (
        <p className="mb-4 text-sm text-rose-600">{insightError}</p>
      )}

      {!insight && !insightError && (
        <p className="text-[15px] leading-6 text-slate-600">
          Generate an AI summary and interpretation based on this stakeholder’s
          interactions.
        </p>
      )}

      {insight && (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-[20px] border border-slate-200/60 bg-white/60 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">
                Stakeholder stance
              </h3>
              <p className="text-sm text-slate-600">
                {insight.stakeholder_sentiment}
              </p>
            </div>

            <div className="rounded-[20px] border border-slate-200/60 bg-white/60 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">
                Toward me personally
              </h3>
              <p className="text-sm text-slate-600">
                {insight.personal_sentiment}
              </p>
            </div>

            <div className="rounded-[20px] border border-slate-200/60 bg-white/60 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">
                Relationship strength
              </h3>
              <p className="text-sm text-slate-600">
                {insight.relationship_strength}
              </p>
            </div>

            <div className="rounded-[20px] border border-slate-200/60 bg-white/60 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">
                Evidence strength
              </h3>
              <p className="text-sm text-slate-600">
                {insight.evidence_strength || "Not available"}
              </p>
            </div>

            <div className="rounded-[20px] border border-slate-200/60 bg-white/60 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">
                Confidence
              </h3>
              <p className="text-sm text-slate-600">
                {formatConfidence(insight.confidence)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              Summary
            </h3>
            <p className="text-[15px] leading-6 text-slate-600">
              {insight.summary}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              What changed
            </h3>
            <p className="text-[15px] leading-6 text-slate-600">
              {insight.what_changed}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              Suggested approach
            </h3>
            <p className="text-[15px] leading-6 text-slate-600">
              {insight.suggested_approach}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              Reasoning
            </h3>
            <p className="text-[15px] leading-6 text-slate-600">
              {insight.rationale}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-emerald-200/70 bg-emerald-50/70 p-4">
              <h3 className="mb-2 text-sm font-semibold text-emerald-800">
                Supporting signals
              </h3>
              {insight.supporting_signals.length === 0 ? (
                <p className="text-sm text-emerald-700/80">None recorded.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-emerald-800">
                  {insight.supporting_signals.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[20px] border border-amber-200/70 bg-amber-50/70 p-4">
              <h3 className="mb-2 text-sm font-semibold text-amber-800">
                Counter-signals
              </h3>
              {insight.counter_signals.length === 0 ? (
                <p className="text-sm text-amber-700/80">None recorded.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
                  {insight.counter_signals.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[20px] border border-slate-200/70 bg-slate-50/80 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                Uncertainties
              </h3>
              {insight.uncertainties.length === 0 ? (
                <p className="text-sm text-slate-600">None recorded.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {insight.uncertainties.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              Key signals
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-[15px] leading-6 text-slate-600">
              {insight.key_signals.map((signal, index) => (
                <li key={index}>{signal}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}