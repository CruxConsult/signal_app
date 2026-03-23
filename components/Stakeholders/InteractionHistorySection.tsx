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
                <div className="flex items-start justify-between gap-4 p-5">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenInteractions((prev) => ({
                        ...prev,
                        [interaction.id]: !prev[interaction.id],
                      }))
                    }
                    className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left"
                  >
                    <div className="min-w-0">
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

                    <span className="shrink-0 text-sm text-slate-500">
                      {isOpen ? "Hide" : "Show"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteInteraction(interaction)}
                    className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
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