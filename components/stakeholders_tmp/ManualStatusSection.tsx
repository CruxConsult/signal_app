"use client";

import CollapsibleSection from "@/components/stakeholders/CollapsibleSection";

export default function ManualStatusSection({
  manualStatus,
  setManualStatus,
  onSave,
}: {
  manualStatus: string;
  setManualStatus: (value: string) => void;
  onSave: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <CollapsibleSection title="Manual status override" defaultOpen={false}>
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Override status
          </label>
          <input
            type="text"
            value={manualStatus}
            onChange={(e) => setManualStatus(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
            placeholder="e.g. Cautious but warming"
          />
        </div>

        <button
          type="submit"
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-[0_6px_18px_rgba(15,23,42,0.16)] transition hover:bg-slate-700"
        >
          Save override
        </button>
      </form>
    </CollapsibleSection>
  );
}