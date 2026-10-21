import { Loader2, Search, FileText, CheckCircle2 } from "lucide-react";

export function AnalysisProgress() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-xl mx-auto my-8 p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-5 animate-in fade-in"
    >
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
        <span className="font-semibold text-sm text-ink">
          Analyzing claim and retrieving live evidence...
        </span>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3 text-xs text-ink font-medium">
          <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-accent flex items-center justify-center shrink-0">
            1
          </div>
          <span>Extracting the core factual assertion with Gemma</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-ink font-medium">
          <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-accent flex items-center justify-center shrink-0">
            2
          </div>
          <span>Searching live sources and matching provenance</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-ink font-medium">
          <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-accent flex items-center justify-center shrink-0">
            3
          </div>
          <span>Synthesizing support, contradiction, and open unknowns</span>
        </div>
      </div>

      <p className="text-[11px] text-ink-muted text-center pt-1">
        Inspecting live web sources. This typically takes 5–15 seconds.
      </p>
    </div>
  );
}
