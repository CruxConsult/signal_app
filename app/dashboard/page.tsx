"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

type Stakeholder = {
  id: number;
  name: string;
  role: string;
  status: string;
  summary?: string | null;
  manual_status?: string | null;
  ai_sentiment?: string | null;
  user_id?: string | null;
  reports_to_stakeholder_id?: number | null;
  is_external_superior?: boolean | null;
  manual_x?: number | null;
  manual_y?: number | null;
};

type Interaction = {
  id: number;
  stakeholder_id: number;
  interaction_date: string;
};

type PositionedStakeholder = Stakeholder & {
  x: number;
  y: number;
  interactionCount: number;
  pillScale: number;
  sentimentBucket: "positive" | "neutral" | "negative" | "external";
};

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<number | null>(
    null
  );

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [summary, setSummary] = useState("");
  const [reportsToName, setReportsToName] = useState("");

  async function loadData() {
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

    const { data: stakeholdersData, error: stakeholdersError } = await supabase
      .from("Stakeholders")
      .select("*")
      .eq("user_id", user?.id);

    if (stakeholdersError) {
      console.error("Load stakeholders error:", stakeholdersError);
      return;
    }

    const { data: interactionsData, error: interactionsError } = await supabase
      .from("interactions")
      .select("id, stakeholder_id, interaction_date")
      .eq("user_id", user?.id);

    if (interactionsError) {
      console.error("Load interactions error:", interactionsError);
      return;
    }

    setStakeholders(stakeholdersData || []);
    setInteractions(interactionsData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const interactionCountMap = useMemo(() => {
    const map = new Map<number, number>();

    for (const interaction of interactions) {
      const current = map.get(interaction.stakeholder_id) || 0;
      map.set(interaction.stakeholder_id, current + 1);
    }

    return map;
  }, [interactions]);

  function getSentimentBucket(
    stakeholder: Stakeholder
  ): "positive" | "neutral" | "negative" | "external" {
    if (stakeholder.is_external_superior) {
      return "external";
    }

    const source = (
      stakeholder.manual_status ||
      stakeholder.ai_sentiment ||
      stakeholder.status ||
      ""
    )
      .toLowerCase()
      .trim();

    if (
      source.includes("positive") ||
      source.includes("supportive") ||
      source.includes("champion") ||
      source.includes("engaged") ||
      source.includes("warming")
    ) {
      return "positive";
    }

    if (
      source.includes("negative") ||
      source.includes("resistant") ||
      source.includes("opposed") ||
      source.includes("blocker") ||
      source.includes("hostile")
    ) {
      return "negative";
    }

    return "neutral";
  }

  const positionedStakeholders = useMemo(() => {
    const mapped = stakeholders.map((stakeholder) => {
      const interactionCount = interactionCountMap.get(stakeholder.id) || 0;

      return {
        ...stakeholder,
        interactionCount,
        sentimentBucket: getSentimentBucket(stakeholder),
      };
    });

    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    function buildPositions(
      list: (Stakeholder & {
        interactionCount: number;
        sentimentBucket: "positive" | "neutral" | "negative" | "external";
      })[],
      radiusBands: number[],
      startAngle = -Math.PI / 2
    ): PositionedStakeholder[] {
      if (list.length === 0) return [];

      return list.map((stakeholder, index) => {
        const pillScale = Math.max(
          0.95,
          Math.min(1.1, 0.95 + stakeholder.interactionCount * 0.03)
        );

        if (
          typeof stakeholder.manual_x === "number" &&
          typeof stakeholder.manual_y === "number"
        ) {
          return {
            ...stakeholder,
            x: clamp(stakeholder.manual_x, 10, 82),
            y: clamp(stakeholder.manual_y, 10, 90),
            pillScale,
          };
        }

        const total = list.length;
        const angleStep = (2 * Math.PI) / total;
        const angle = startAngle + index * angleStep;
        const radius = radiusBands[index % radiusBands.length];

        const rawX = 50 + radius * Math.cos(angle);
        const rawY = 50 + radius * Math.sin(angle);

        const x = clamp(rawX, 10, 82);
        const y = clamp(rawY, 10, 90);

        return {
          ...stakeholder,
          x,
          y,
          pillScale,
        };
      });
    }

    const positive = mapped.filter((s) => s.sentimentBucket === "positive");
    const neutral = mapped.filter((s) => s.sentimentBucket === "neutral");
    const negative = mapped.filter((s) => s.sentimentBucket === "negative");
    const external = mapped.filter((s) => s.sentimentBucket === "external");

    return [
      ...buildPositions(positive, [0, 4, 8], -Math.PI / 2),
      ...buildPositions(neutral, [16, 20, 23], -Math.PI / 2),
      ...buildPositions(negative, [27, 31, 35], -Math.PI / 2),
      ...buildPositions(external, [40, 44], -Math.PI / 2),
    ];
  }, [stakeholders, interactionCountMap]);

  const positionedStakeholderMap = useMemo(() => {
    const map = new Map<number, PositionedStakeholder>();

    for (const stakeholder of positionedStakeholders) {
      map.set(stakeholder.id, stakeholder);
    }

    return map;
  }, [positionedStakeholders]);

  const selectedStakeholder = useMemo(() => {
    if (!selectedStakeholderId) return null;
    return stakeholders.find((s) => s.id === selectedStakeholderId) || null;
  }, [stakeholders, selectedStakeholderId]);

  const selectedSuperior = useMemo(() => {
    if (!selectedStakeholder?.reports_to_stakeholder_id) return null;
    return (
      stakeholders.find((s) => s.id === selectedStakeholder.reports_to_stakeholder_id) ||
      null
    );
  }, [stakeholders, selectedStakeholder]);

  const selectedArrow = useMemo(() => {
    if (!selectedStakeholder || !selectedSuperior) return null;

    const from = positionedStakeholderMap.get(selectedStakeholder.id);
    const to = positionedStakeholderMap.get(selectedSuperior.id);

    if (!from || !to) return null;

    const startX = from.x + 2;
    const startY = from.y;
    const endX = to.x - 2;
    const endY = to.y;
    const controlX = (startX + endX) / 2;
    const controlY = (startY + endY) / 2;

    return { startX, startY, endX, endY, controlX, controlY };
  }, [selectedStakeholder, selectedSuperior, positionedStakeholderMap]);

  function getPillClasses(
    bucket: "positive" | "neutral" | "negative" | "external",
    isSelected: boolean,
    isRelated: boolean
  ) {
    let base =
      "backdrop-blur-xl border text-slate-900 shadow-[0_6px_18px_rgba(15,23,42,0.06)]";

    if (bucket === "positive") {
      base += " bg-emerald-50/95 border-emerald-200/80 text-emerald-900";
    } else if (bucket === "negative") {
      base += " bg-rose-50/95 border-rose-200/80 text-rose-900";
    } else if (bucket === "external") {
      base += " bg-slate-100/95 border-slate-300/80 text-slate-800";
    } else {
      base += " bg-amber-50/95 border-amber-200/80 text-amber-900";
    }

    if (isSelected) {
      base += " ring-2 ring-slate-700/70 shadow-[0_10px_30px_rgba(15,23,42,0.12)]";
    } else if (isRelated) {
      base += " ring-2 ring-slate-300/80";
    }

    return base;
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setRole("");
    setStatus("");
    setSummary("");
    setReportsToName("");
  }

  function handleEditClick(stakeholder: Stakeholder) {
    setEditingId(stakeholder.id);
    setName(stakeholder.name);
    setRole(stakeholder.role);
    setStatus(stakeholder.status);
    setSummary(stakeholder.summary || "");

    const superior = stakeholders.find(
      (s) => s.id === stakeholder.reports_to_stakeholder_id
    );
    setReportsToName(superior?.name || "");

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  async function handleDeleteStakeholder(stakeholder: Stakeholder) {
    const confirmed = window.confirm(
      `Delete ${stakeholder.name}? This should also remove any linked interactions.`
    );

    if (!confirmed) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("Stakeholders")
      .delete()
      .eq("id", stakeholder.id)
      .eq("user_id", user?.id);

    if (error) {
      console.error("Delete stakeholder error:", error);
      return;
    }

    if (editingId === stakeholder.id) {
      resetForm();
    }

    if (selectedStakeholderId === stakeholder.id) {
      setSelectedStakeholderId(null);
    }

    await loadData();
  }

  async function nudgePosition(dx: number, dy: number) {
    if (!selectedStakeholderId) return;

    const current = stakeholders.find((s) => s.id === selectedStakeholderId);
    if (!current) return;

    const baseX = current.manual_x ?? 50;
    const baseY = current.manual_y ?? 50;

    const newX = Math.max(5, Math.min(90, baseX + dx));
    const newY = Math.max(5, Math.min(90, baseY + dy));

    const { error } = await supabase
      .from("Stakeholders")
      .update({
        manual_x: newX,
        manual_y: newY,
      })
      .eq("id", selectedStakeholderId);

    if (error) {
      console.error("Nudge error:", error);
      return;
    }

    await loadData();
  }

  async function findOrCreateSuperior(
    superiorName: string,
    userId: string
  ): Promise<number | null> {
    const trimmed = superiorName.trim();
    if (!trimmed) return null;

    const existing = stakeholders.find(
      (s) => s.name.toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (existing) {
      return existing.id;
    }

    const { data, error } = await supabase
      .from("Stakeholders")
      .insert([
        {
          name: trimmed,
          role: "Superior",
          status: "neutral",
          summary: "Auto-created reporting-line record",
          user_id: userId,
          is_external_superior: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Create superior error:", error);
      return null;
    }

    return data.id;
  }

  async function handleAddOrUpdateStakeholder(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !role || !status) return;

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

    const superiorId = await findOrCreateSuperior(reportsToName, user?.id || "");

    if (editingId) {
      const { error } = await supabase
        .from("Stakeholders")
        .update({
          name,
          role,
          status,
          summary,
          reports_to_stakeholder_id: superiorId,
        })
        .eq("id", editingId)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Update stakeholder error:", error);
        return;
      }
    } else {
      const { error } = await supabase.from("Stakeholders").insert([
        {
          name,
          role,
          status,
          summary,
          user_id: user?.id,
          reports_to_stakeholder_id: superiorId,
          is_external_superior: false,
        },
      ]);

      if (error) {
        console.error("Add stakeholder error:", error);
        return;
      }
    }

    resetForm();
    await loadData();
  }

  if (loading) {
    return (
      <>
        <AppHeader showLogout={true} />
        <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-[15px] text-slate-500">Loading dashboard...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader showLogout={true} />
      <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="mb-2 text-sm font-medium text-slate-500">Signal</div>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-900">
              Stakeholder workspace
            </h1>
            <p className="mt-2 text-[15px] text-slate-500">
              Stakeholders are positioned by sentiment. Use the list below to show a
              reporting line.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1.5 text-emerald-700">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Positive
              </div>
              <div className="flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1.5 text-amber-700">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                Neutral
              </div>
              <div className="flex items-center gap-2 rounded-full border border-rose-200/70 bg-rose-50 px-3 py-1.5 text-rose-700">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
                Negative
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50 px-3 py-1.5 text-slate-700">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-500" />
                External superior
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[760px] overflow-hidden rounded-full border border-slate-200/60 bg-white/60 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <div className="absolute inset-0 rounded-full bg-slate-100/80" />
              <div className="absolute inset-[14%] rounded-full bg-rose-100/85" />
              <div className="absolute inset-[26%] rounded-full bg-amber-100/90" />
              <div className="absolute inset-[34%] rounded-full bg-emerald-100/90" />

              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="4"
                    markerHeight="4"
                    refX="3.5"
                    refY="2"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,4 L4,2 z" fill="#64748b" />
                  </marker>
                </defs>

                {selectedArrow && (
                  <path
                    d={`M ${selectedArrow.startX} ${selectedArrow.startY} Q ${selectedArrow.controlX} ${selectedArrow.controlY} ${selectedArrow.endX} ${selectedArrow.endY}`}
                    stroke="#64748b"
                    strokeWidth="0.45"
                    fill="none"
                    opacity="0.8"
                    markerEnd="url(#arrowhead)"
                  />
                )}
              </svg>

              {positionedStakeholders.map((stakeholder) => {
                const isSelected = stakeholder.id === selectedStakeholderId;
                const isRelated =
                  stakeholder.id === selectedSuperior?.id ||
                  stakeholder.id === selectedStakeholder?.id;

                return (
                  <Link
                    key={stakeholder.id}
                    href={`/stakeholders/${stakeholder.id}`}
                    className={`absolute rounded-full px-3.5 py-2.5 transition hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] ${getPillClasses(
                      stakeholder.sentimentBucket,
                      isSelected,
                      isRelated
                    )}`}
                    style={{
                      left: `${stakeholder.x}%`,
                      top: `${stakeholder.y}%`,
                      transform: `translateY(-50%) scale(${stakeholder.pillScale})`,
                      transformOrigin: "left center",
                      maxWidth: "165px",
                    }}
                    title={`${stakeholder.name} • ${
                      stakeholder.manual_status ||
                      stakeholder.ai_sentiment ||
                      stakeholder.status ||
                      "no sentiment"
                    } • ${stakeholder.interactionCount} interaction(s)`}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium leading-tight whitespace-nowrap">
                      <PersonIcon />
                      <span className="truncate">{stakeholder.name}</span>
                    </span>
                  </Link>
                );
              })}
            </div>

            {selectedStakeholder && (
              <div className="mt-5 rounded-[24px] border border-slate-200/60 bg-white/70 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
                <p className="mb-4 text-[15px] leading-6 text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {selectedStakeholder.name}
                  </span>
                  {selectedSuperior
                    ? ` reports to ${selectedSuperior.name}.`
                    : " does not currently have a superior set."}
                </p>

                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => nudgePosition(0, -2)}
                      className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      ↑
                    </button>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => nudgePosition(-2, 0)}
                        className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgePosition(2, 0)}
                        className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => nudgePosition(0, 2)}
                      className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      ↓
                    </button>
                  </div>

                  <div className="text-sm text-slate-500">
                    Use arrows to adjust position
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/stakeholders/${selectedStakeholder.id}`}
                    className="text-sm font-medium text-slate-900 underline underline-offset-4"
                  >
                    Open stakeholder detail page
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <h2 className="mb-5 text-xl font-semibold tracking-[-0.02em] text-slate-900">
                Manage stakeholders
              </h2>

              <div className="space-y-4">
                {stakeholders.length === 0 ? (
                  <p className="text-[15px] text-slate-500">No stakeholders yet.</p>
                ) : (
                  stakeholders.map((stakeholder) => {
                    const superior = stakeholders.find(
                      (s) => s.id === stakeholder.reports_to_stakeholder_id
                    );
                    const isSelected = stakeholder.id === selectedStakeholderId;

                    return (
                      <div
                        key={stakeholder.id}
                        className={`rounded-[24px] border p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] ${
                          isSelected
                            ? "border-slate-300 bg-slate-50/80"
                            : "border-slate-200/60 bg-white/70"
                        }`}
                      >
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0 flex-1 pr-0 md:pr-6">
                            <p className="font-semibold text-slate-900">
                              {stakeholder.name}
                            </p>
                            <p className="mt-1 text-[15px] leading-7 text-slate-600">
                              {stakeholder.role}
                            </p>
                            <p className="mt-2 text-[15px] text-slate-600">
                              Status: {stakeholder.manual_status || stakeholder.status}
                            </p>
                            <p className="mt-1 text-[15px] text-slate-600">
                              Reports to: {superior?.name || "Not set"}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStakeholderId((current) =>
                                  current === stakeholder.id ? null : stakeholder.id
                                )
                              }
                              className="w-32 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                            >
                              {isSelected ? "Hide line" : "Show line"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditClick(stakeholder)}
                              className="w-32 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteStakeholder(stakeholder)}
                              className="w-32 rounded-full border border-rose-200 bg-rose-50/90 px-4 py-2 text-center text-sm font-medium text-rose-700 transition hover:bg-rose-100/90"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <h2 className="mb-5 text-xl font-semibold tracking-[-0.02em] text-slate-900">
                {editingId ? "Edit stakeholder" : "Add stakeholder"}
              </h2>

              <form onSubmit={handleAddOrUpdateStakeholder} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                    placeholder="e.g. Rachel"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                    placeholder="e.g. Editorial Director"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Default status
                  </label>
                  <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                    placeholder="e.g. neutral"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Reports to
                  </label>
                  <input
                    type="text"
                    value={reportsToName}
                    onChange={(e) => setReportsToName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                    placeholder="Type superior’s name"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    If this person does not already exist, a superior record will be
                    created automatically.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Summary
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                    placeholder="Short summary of this stakeholder"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-[0_6px_18px_rgba(15,23,42,0.16)] transition hover:bg-slate-700"
                  >
                    {editingId ? "Update stakeholder" : "Add stakeholder"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}