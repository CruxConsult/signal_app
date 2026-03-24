"use client";

import CollapsibleSection from "@/components/stakeholders/CollapsibleSection";

export default function LogInteractionSection({
  interactionDate,
  setInteractionDate,
  sourceType,
  setSourceType,
  title,
  setTitle,
  content,
  setContent,
  onSave,
}: {
  interactionDate: string;
  setInteractionDate: (value: string) => void;
  sourceType: string;
  setSourceType: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  onSave: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <CollapsibleSection title="Log interaction" defaultOpen={false}>
      <form onSubmit={onSave} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Interaction date
            </label>
            <input
              type="date"
              value={interactionDate}
              onChange={(e) => setInteractionDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-slate-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Source type
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-slate-300"
            >
              <option value="meeting">Meeting</option>
              <option value="email">Email</option>
              <option value="call-note">Call note</option>
              <option value="transcript">Transcript</option>
              <option value="manual-note">Manual note</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
            placeholder="Optional title for this interaction"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
            placeholder="Paste notes, email content, transcript excerpt, or your summary of the interaction"
          />
        </div>

        {/* ACTION */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="min-w-[140px] rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Save interaction
          </button>
        </div>
      </form>
    </CollapsibleSection>
  );
}