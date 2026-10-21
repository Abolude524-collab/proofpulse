import { Lock, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="space-y-3 pb-2">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-bold text-indigo-700 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        <span>Evidence-First Claim Investigation</span>
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight leading-tight">
        Before you share it,{" "}
        <span className="text-accent underline decoration-indigo-200 underline-offset-4">
          inspect the evidence.
        </span>
      </h1>

      <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-xl">
        Paste a claim, viral message, or screenshot. ProofPulse retrieves real web sources and synthesizes a cautious, source-linked evidence brief with Gemma 4.
      </p>

      <div className="flex items-center gap-2 text-[11px] text-ink-muted pt-1">
        <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>In-memory processing only. Submissions are never persisted.</span>
      </div>
    </section>
  );
}
