"use client";

import { Interaction, Stakeholder } from "@/components/stakeholders/types";
import { daysSince, formatDate } from "@/components/stakeholders/utils";

export default function StakeholderSummaryGrid({
  stakeholder,
  interactions,
}: {
  stakeholder: Stakeholder;
  interactions: Interaction[];
}) {
  const interactionCount = interactions.length;

  const oldestInteraction =
    interactions.length === 0
      ? null
      : [...interactions].sort(
          (a, b) =>
            new Date(a.interaction_date).getTime() -
            new Date(b.interaction_date).getTime()
        )[0];

  const latestInteraction =
    interactions.length === 0
      ? null
      : [...interactions].sort(
          (a, b) =>
            new Date(b.interaction_date).getTime() -
            new Date(a.interaction_date).getTime()
        )[0];

  const displayedStatus = stakeholder.manual_status || stakeholder.status;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[24px] border border-slate-200/60 bg-white/70 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <h2 className="mb-2 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          Summary
        </h2>
        <p className="text-[15px] leading-6 text-slate-600">
          {stakeholder.summary || "No summary added yet."}
        </p>
      </div>

      <div className="rounded-[24px] border border-slate-200/60 bg-white/70 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <h2 className="mb-2 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          Status
        </h2>
        <p className="mb-1 text-[15px] leading-6 text-slate-600">
          AI / default status: {stakeholder.status}
        </p>
        <p className="mb-1 text-[15px] leading-6 text-slate-600">
          Manual override: {stakeholder.manual_status || "None"}
        </p>
        <p className="text-[15px] font-medium text-slate-900">
          Current displayed status: {displayedStatus}
        </p>
      </div>

      <div className="rounded-[24px] border border-slate-200/60 bg-white/70 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <h2 className="mb-2 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          Interaction metrics
        </h2>
        <p className="text-[15px] leading-6 text-slate-600">
          Number of interactions: {interactionCount}
        </p>
        <p className="text-[15px] leading-6 text-slate-600">
          Length of time interacted with:{" "}
          {oldestInteraction
            ? `Since ${formatDate(oldestInteraction.interaction_date)}`
            : "Not available yet"}
        </p>
        <p className="text-[15px] leading-6 text-slate-600">
          Time since last interaction:{" "}
          {latestInteraction
            ? `${daysSince(latestInteraction.interaction_date)} day(s)`
            : "Not available yet"}
        </p>
      </div>

      <div className="rounded-[24px] border border-slate-200/60 bg-white/70 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <h2 className="mb-2 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          Imported data used
        </h2>
        {interactions.length === 0 ? (
          <p className="text-[15px] leading-6 text-slate-600">
            No interaction records connected yet.
          </p>
        ) : (
          <p className="text-[15px] leading-6 text-slate-600">
            This stakeholder currently has {interactionCount} imported interaction
            record(s) being used as source material.
          </p>
        )}
      </div>
    </div>
  );
}