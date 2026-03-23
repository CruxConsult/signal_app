import { SentimentHistoryRow } from "@/components/stakeholders/types";

export function splitLines(value?: string | null) {
  if (!value) return [];
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function sentimentToScore(value?: string | null) {
  const normalised = value?.toLowerCase().trim();

  if (normalised === "supportive") return 2;
  if (normalised === "neutral") return 1;
  if (normalised === "resistant") return 0;

  return null;
}

export function getTrend(history: SentimentHistoryRow[]) {
  if (history.length < 2) {
    return {
      label: "Insufficient data",
      tone: "text-slate-600 bg-slate-50 border-slate-200/70",
    };
  }

  const latest = sentimentToScore(history[0]?.stakeholder_sentiment);
  const previous = sentimentToScore(history[1]?.stakeholder_sentiment);

  if (latest === null || previous === null) {
    return {
      label: "Insufficient data",
      tone: "text-slate-600 bg-slate-50 border-slate-200/70",
    };
  }

  if (latest > previous) {
    return {
      label: "Improving",
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200/70",
    };
  }

  if (latest < previous) {
    return {
      label: "Declining",
      tone: "text-rose-700 bg-rose-50 border-rose-200/70",
    };
  }

  return {
    label: "Stable",
    tone: "text-amber-700 bg-amber-50 border-amber-200/70",
  };
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysSince(dateString: string) {
  const today = new Date();
  const then = new Date(dateString);
  const diffMs = today.getTime() - then.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function formatConfidence(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Not available";
  }

  return `${Math.round(value * 100)}%`;
}

export function getSentimentDotClasses(value?: string | null) {
  const normalised = value?.toLowerCase().trim();

  if (normalised === "supportive") return "bg-emerald-400 ring-emerald-200";
  if (normalised === "neutral") return "bg-amber-400 ring-amber-200";
  if (normalised === "resistant") return "bg-rose-400 ring-rose-200";

  return "bg-slate-300 ring-slate-200";
}