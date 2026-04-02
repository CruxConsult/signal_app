import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Stakeholder = {
  id: number;
  name: string;
  status: string;
  manual_status?: string | null;
  ai_sentiment?: string | null;
};

type SentimentHistoryRow = {
  id: number;
  stakeholder_id: number;
  stakeholder_sentiment?: string | null;
  created_at: string;
};

type ClientViewRow = {
  user_id: string;
};

function TrendPill({ trend }: { trend: string }) {
  const tone =
    trend === "↑ Improving"
      ? "border-emerald-200/70 bg-emerald-50 text-emerald-700"
      : trend === "↓ Declining"
      ? "border-rose-200/70 bg-rose-50 text-rose-700"
      : "border-slate-200/70 bg-slate-50 text-slate-600";

  return (
    <span
      className={`inline-flex min-w-[112px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium ${tone}`}
    >
      {trend}
    </span>
  );
}

function SentimentPill({ sentiment }: { sentiment: string }) {
  const tone =
    sentiment === "Supportive"
      ? "border-emerald-200/70 bg-emerald-50 text-emerald-700"
      : sentiment === "Needs attention"
      ? "border-rose-200/70 bg-rose-50 text-rose-700"
      : "border-amber-200/70 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex min-w-[120px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium ${tone}`}
    >
      {sentiment}
    </span>
  );
}

function normaliseSentiment(value: string | null | undefined) {
  const source = (value || "").toLowerCase().trim();

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

function getTrendTone(trend: string) {
  if (trend === "↑ Improving") {
    return {
      line: "#059669",
      dot: "#10B981",
      baseline: "#D1FAE5",
    };
  }

  if (trend === "↓ Declining") {
    return {
      line: "#DC2626",
      dot: "#F43F5E",
      baseline: "#FFE4E6",
    };
  }

  return {
    line: "#0C1E33",
    dot: "#F4C430",
    baseline: "#E2E8F0",
  };
}

function Sparkline({
  stakeholderId,
  history,
  trend,
}: {
  stakeholderId: number;
  history: SentimentHistoryRow[];
  trend: string;
}) {
  const records = history
    .filter((row) => row.stakeholder_id === stakeholderId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .slice(-6);

  if (records.length < 2) {
    return (
      <div className="flex h-10 w-[140px] items-center justify-end">
        <div className="h-px w-full rounded-full bg-slate-200" />
      </div>
    );
  }

  const map = {
    negative: 30,
    neutral: 20,
    positive: 10,
  };

  const points = records.map((row, index) => {
    const value = normaliseSentiment(row.stakeholder_sentiment);
    const x = 10 + (index / Math.max(records.length - 1, 1)) * 120;
    const y = map[value as keyof typeof map] ?? 20;
    return { x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const latest = points[points.length - 1];
  const colors = getTrendTone(trend);

  return (
    <svg
      viewBox="0 0 140 40"
      className="h-10 w-[140px]"
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="10"
        y1="20"
        x2="130"
        y2="20"
        stroke={colors.baseline}
        strokeWidth="1.5"
      />
      <path
        d={path}
        stroke={colors.line}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={latest.x} cy={latest.y} r="3.25" fill={colors.dot} />
    </svg>
  );
}

function getSentimentLabel(stakeholder: Stakeholder) {
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
    return "Supportive";
  }

  if (
    source.includes("negative") ||
    source.includes("resistant") ||
    source.includes("opposed") ||
    source.includes("blocker") ||
    source.includes("hostile")
  ) {
    return "Needs attention";
  }

  return "Neutral";
}

function getTrend(
  stakeholderId: number,
  history: SentimentHistoryRow[]
) {
  const records = history
    .filter((row) => row.stakeholder_id === stakeholderId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  if (records.length < 2) {
    return "→ Stable";
  }

  const recent = records.slice(-3).map((row) =>
    normaliseSentiment(row.stakeholder_sentiment)
  );

  const scoreMap = {
    negative: -1,
    neutral: 0,
    positive: 1,
  };

  const scores = recent.map((value) => scoreMap[value as keyof typeof scoreMap]);
  const delta = scores[scores.length - 1] - scores[0];

  if (delta > 0) return "↑ Improving";
  if (delta < 0) return "↓ Declining";

  return "→ Stable";
}

export default async function PublicClientDashboardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: clientView, error: clientViewError } = await supabase
    .from("client_views")
    .select("user_id")
    .eq("token", token)
    .single<ClientViewRow>();

  if (clientViewError || !clientView) {
    notFound();
  }

  const { data: stakeholdersData, error: stakeholdersError } = await supabase
    .from("Stakeholders")
    .select("id, name, status, manual_status, ai_sentiment")
    .eq("user_id", clientView.user_id)
    .eq("is_client_visible", true)
    .order("name", { ascending: true });

  if (stakeholdersError) {
    throw new Error("Could not load stakeholders.");
  }

  const { data: historyData, error: historyError } = await supabase
    .from("stakeholder_sentiment_history")
    .select("id, stakeholder_id, stakeholder_sentiment, created_at")
    .eq("user_id", clientView.user_id)
    .order("created_at", { ascending: false });

  if (historyError) {
    throw new Error("Could not load sentiment history.");
  }

  const stakeholders = (stakeholdersData || []) as Stakeholder[];
  const history = (historyData || []) as SentimentHistoryRow[];

  const supportive = stakeholders.filter(
    (stakeholder) => getSentimentLabel(stakeholder) === "Supportive"
  ).length;
  const neutral = stakeholders.filter(
    (stakeholder) => getSentimentLabel(stakeholder) === "Neutral"
  ).length;
  const attention = stakeholders.filter(
    (stakeholder) => getSentimentLabel(stakeholder) === "Needs attention"
  ).length;

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-3" aria-label="Crux">
              <svg
                width="34"
                height="34"
                viewBox="0 0 28 28"
                fill="none"
                className="shrink-0"
                aria-hidden="true"
              >
                <line
                  x1="14"
                  y1="3"
                  x2="14"
                  y2="25"
                  stroke="#F4C430"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="3"
                  y1="14"
                  x2="25"
                  y2="14"
                  stroke="#F4C430"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <span className="text-[30px] font-semibold tracking-[-0.025em] text-[#0C1E33] leading-none">
                Crux
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-slate-900">
              Stakeholder overview
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">
              A high-level view of stakeholder sentiment and direction of travel.
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-emerald-200/60 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <p className="text-sm font-medium text-slate-500">Supportive</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
              {supportive}
            </p>
          </div>

          <div className="rounded-[24px] border border-amber-200/60 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <p className="text-sm font-medium text-slate-500">Neutral</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
              {neutral}
            </p>
          </div>

          <div className="rounded-[24px] border border-rose-200/60 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <p className="text-sm font-medium text-slate-500">
              Needs attention
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
              {attention}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="border-b border-slate-200/70 px-6 py-5 md:px-8">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-900">
              Included stakeholders
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Client-safe view showing current sentiment and recent movement.
            </p>
          </div>

          {stakeholders.length === 0 ? (
            <div className="px-6 py-10 md:px-8">
              <p className="text-[15px] text-slate-500">
                No stakeholders are currently included in client view.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[minmax(220px,1.5fr)_160px_160px_140px] gap-6 border-b border-slate-200/70 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-slate-400 md:grid md:px-8">
                <div>Stakeholder</div>
                <div>Sentiment</div>
                <div>Trend</div>
                <div className="text-right">History</div>
              </div>

              <div className="divide-y divide-slate-200/70">
                {stakeholders.map((stakeholder) => {
                  const sentiment = getSentimentLabel(stakeholder);
                  const trend = getTrend(stakeholder.id, history);

                  return (
                    <div
                      key={stakeholder.id}
                      className="grid gap-4 px-6 py-5 md:grid-cols-[minmax(220px,1.5fr)_160px_160px_140px] md:items-center md:gap-6 md:px-8"
                    >
                      <div>
                        <p className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900">
                          {stakeholder.name}
                        </p>
                      </div>

                      <div className="flex items-center justify-start">
                        <div className="shrink-0">
                          <SentimentPill sentiment={sentiment} />
                        </div>
                      </div>

                      <div className="flex items-center justify-start">
                        <div className="shrink-0">
                          <TrendPill trend={trend} />
                        </div>
                      </div>

                      <div className="flex w-[140px] items-center justify-start md:justify-end">
                        <Sparkline
                          stakeholderId={stakeholder.id}
                          history={history}
                          trend={trend}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}