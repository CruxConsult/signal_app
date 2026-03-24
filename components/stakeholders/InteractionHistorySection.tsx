"use client";

import { useEffect, useState } from "react";
import CollapsibleSection from "@/components/stakeholders/CollapsibleSection";
import { Interaction } from "@/components/stakeholders/types";
import { formatDate } from "@/components/stakeholders/utils";

export default function InteractionHistorySection({
  interactions,
  onDeleteInteraction,
}: {
  interactions: Interaction[];
  onDeleteInteraction: (interaction: Interaction) => Promise<void>;
}) {
  const [openInteractions, setOpenInteractions] = useState<Record<number, boolean>>(
    {}
  );

  useEffect(() => {
    const initialOpen: Record<number, boolean> = {};
    interactions.forEach((interaction, index) => {
      initialOpen[interaction.id] = index === 0;
    });
    setOpenInteractions(initialOpen);
  }, [interactions]);

  return (
    <CollapsibleSection title="Interaction history" defaultOpen={false}>
      {interactions.length === 0 ? (
        <p className="text-[15px] leading-6 text-slate-600">
          No interactions logged yet.
        </p>
      ) : (
        <div className="space-y-4">
          {interactions.map((interaction) => {
            const isOpen = !!openInteractions[interaction.id];

            return (
              <div
                key={interaction.id}
                className="rounded-[20px] border border-slate-200/60 bg-white/60 shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
              >
                <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">
                        {interaction.title || "Untitled interaction"}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {interaction.source_type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(interaction.interaction_date)}
                      </span>
                    </div>

                    {!isOpen && (
                      <p className="line-clamp-2 text-[15px] leading-6 text-slate-600">
                        {interaction.content}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 md:items-end">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenInteractions((prev) => ({
                          ...prev,
                          [interaction.id]: !prev[interaction.id],
                        }))
                      }
                      className="min-w-[140px] rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-200"
                    >
                      {isOpen ? "Hide" : "Show"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteInteraction(interaction)}
                      className="min-w-[140px] rounded-2xl bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-200/60 px-5 pb-5 pt-4">
                    <p className="whitespace-pre-wrap text-[15px] leading-6 text-slate-600">
                      {interaction.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </CollapsibleSection>
  );
}