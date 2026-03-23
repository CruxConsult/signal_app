"use client";

import CollapsibleSection from "@/components/stakeholders/CollapsibleSection";
import { SentimentHistoryRow } from "@/components/stakeholders/types";
import {
  formatConfidence,
  formatDate,
  formatDateTime,
  getSentimentDotClasses,
  splitLines,
} from "@/components/stakeholders/utils";

export default function SentimentHistorySection({
  sentimentHistory,
}: {
  sentimentHistory: SentimentHistoryRow[];
}) {
  return (
    <CollapsibleSection title="Sentiment history" defaultOpen={true}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500">Latest snapshot on the left</div>
      </div>

      {sentimentHistory.length === 0 ? (
        <p className="text-[15px] leading-6 text-slate-600">
          No sentiment snapshots yet.
        </p>
      ) : (
        <>
          <div className="mb-6 overflow-x-auto">
            <div className="inline-flex min-w-full items-center gap-3 rounded-[20px] border border-slate-200/60 bg-white/60 px-4 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
              {sentimentHistory.map((entry, index) => (
                <div key={entry.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`h-4 w-4 rounded-full ring-4 ${getSentimentDotClasses(
                        entry.stakeholder_sentiment
                      )}`}
                      title={`${entry.stakeholder_sentiment || "Unknown"} • ${formatDateTime(
                        entry.created_at
                      )}`}
                    />
                    <span className="text-[11px] text-slate-500">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>

                  {index < sentimentHistory.length - 1 && (
                    <div className="h-px w-8 bg-slate-200" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {sentimentHistory.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[20px] border border-slate-200/60 bg-white/60 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {formatDateTime(entry.created_at)}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Stakeholder stance
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {entry.stakeholder_sentiment || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Toward me
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {entry.personal_sentiment || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Relationship
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {entry.relationship_strength || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Evidence
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {entry.evidence_strength || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Confidence
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {formatConfidence(entry.confidence)}
                    </p>
                  </div>
                </div>

                {entry.rationale && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Rationale
                    </p>
                    <p className="mt-1 text-[15px] leading-6 text-slate-600">
                      {entry.rationale}
                    </p>
                  </div>
                )}

                {(entry.supporting_signals ||
                  entry.counter_signals ||
                  entry.uncertainties) && (
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[16px] border border-emerald-200/70 bg-emerald-50/70 p-4">
                      <p className="mb-2 text-sm font-semibold text-emerald-800">
                        Supporting signals
                      </p>
                      {splitLines(entry.supporting_signals).length === 0 ? (
                        <p className="text-sm text-emerald-700/80">
                          None recorded.
                        </p>
                      ) : (
                        <ul className="list-disc space-y-1 pl-5 text-sm text-emerald-800">
                          {splitLines(entry.supporting_signals).map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-[16px] border border-amber-200/70 bg-amber-50/70 p-4">
                      <p className="mb-2 text-sm font-semibold text-amber-800">
                        Counter-signals
                      </p>
                      {splitLines(entry.counter_signals).length === 0 ? (
                        <p className="text-sm text-amber-700/80">None recorded.</p>
                      ) : (
                        <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
                          {splitLines(entry.counter_signals).map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-[16px] border border-slate-200/70 bg-slate-50/80 p-4">
                      <p className="mb-2 text-sm font-semibold text-slate-800">
                        Uncertainties
                      </p>
                      {splitLines(entry.uncertainties).length === 0 ? (
                        <p className="text-sm text-slate-600">None recorded.</p>
                      ) : (
                        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                          {splitLines(entry.uncertainties).map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </CollapsibleSection>
  );
}