import { ExternalLink, Calendar, Globe, Quote } from "lucide-react";
import { EvidenceItem } from "@/lib/types";

interface EvidenceCardProps {
  evidence: EvidenceItem;
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const getBadgeStyle = (rel: string) => {
    switch (rel) {
      case "supports":
        return {
          label: "Supports claim",
          containerClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "contradicts":
        return {
          label: "Contradicts claim",
          containerClass: "bg-rose-50 text-rose-800 border-rose-200",
        };
      case "context":
      default:
        return {
          label: "Context / Nuance",
          containerClass: "bg-blue-50 text-blue-800 border-blue-200",
        };
    }
  };

  const badge = getBadgeStyle(evidence.relationship);

  return (
    <article className="p-4 sm:p-5 bg-surface rounded-xl border border-border shadow-xs hover:border-slate-300 transition space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.containerClass}`}
        >
          {badge.label}
        </span>

        <div className="flex items-center gap-3 text-xs text-ink-muted">
          {evidence.publisher && (
            <span className="flex items-center gap-1 font-medium">
              <Globe className="w-3.5 h-3.5" />
              {evidence.publisher}
            </span>
          )}
          {evidence.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {evidence.date}
            </span>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm sm:text-base text-ink line-clamp-2 leading-snug">
          {evidence.title || "Source Record"}
        </h4>
        <p className="mt-1.5 text-xs sm:text-sm text-ink-muted leading-relaxed">
          {evidence.relevance}
        </p>
      </div>

      {evidence.sourceExcerpt && (
        <div className="p-3 bg-slate-50 border-l-2 border-slate-300 rounded-r-lg text-xs text-slate-700 italic space-y-1">
          <div className="flex items-center gap-1 font-semibold not-italic text-[10px] text-slate-500 uppercase tracking-wider">
            <Quote className="w-3 h-3" />
            Source Excerpt
          </div>
          <p className="line-clamp-4 leading-normal">
            "{evidence.sourceExcerpt}"
          </p>
        </div>
      )}

      <div className="pt-1 flex justify-end">
        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover hover:underline transition"
        >
          <span>Open source</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}
