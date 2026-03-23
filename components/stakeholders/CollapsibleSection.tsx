"use client";

import { useState } from "react";

export default function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  rightContent,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-6 rounded-[24px] border border-slate-200/60 bg-white/70 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3 text-left"
        >
          <span className="text-sm text-slate-500">{open ? "−" : "+"}</span>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
            {title}
          </h2>
        </button>

        {rightContent}
      </div>

      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}