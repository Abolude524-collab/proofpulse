"use client";

import { Sparkles, CheckCircle2, AlertCircle, HelpCircle, GitCommit, Shield, ExternalLink, ArrowRight } from "lucide-react";
import { DEMO_SAMPLES } from "@/lib/demo";

interface BenchmarkShowcaseProps {
  onSelectSample: (sampleId: string) => void;
  isLoading: boolean;
}

export function BenchmarkShowcase({ onSelectSample, isLoading }: BenchmarkShowcaseProps) {
  return (
    <div className="space-y-6">
      {/* Benchmark Explorer Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-ink">Benchmark Investigations</h3>
              <p className="text-xs text-ink-muted">Click any benchmark to inspect the full evidence brief</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
            Instant Demo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Exoplanet */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSelectSample("exoplanet")}
            className="group w-full p-3.5 text-left bg-slate-50/70 hover:bg-white hover:border-amber-300 border border-slate-200/80 rounded-xl transition duration-150 shadow-xs flex flex-col justify-between gap-2.5 disabled:opacity-50"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-xs text-ink group-hover:text-accent transition leading-snug">
                🔭 Webb Telescope & Exoplanet Water Vapor
              </span>
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <GitCommit className="w-3 h-3" />
                Mixed evidence
              </span>
            </div>
            <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
              NIRSpec observed water vapor signatures on GJ 486 b, but cool starspots on the host red dwarf could mimic the same spectrum.
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-accent group-hover:translate-x-0.5 transition">
              <span>Inspect brief</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* Bananas */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSelectSample("radiation")}
            className="group w-full p-3.5 text-left bg-slate-50/70 hover:bg-white hover:border-emerald-300 border border-slate-200/80 rounded-xl transition duration-150 shadow-xs flex flex-col justify-between gap-2.5 disabled:opacity-50"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-xs text-ink group-hover:text-accent transition leading-snug">
                🍌 Bananas Radioactivity (Potassium-40)
              </span>
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Supported
              </span>
            </div>
            <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
              Bananas naturally contain potassium-40 isotope. The radiation dose is minimal and bodily homeostasis prevents accumulation.
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-accent group-hover:translate-x-0.5 transition">
              <span>Inspect brief</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* School WiFi */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSelectSample("wifi")}
            className="group w-full p-3.5 text-left bg-slate-50/70 hover:bg-white hover:border-slate-400 border border-slate-200/80 rounded-xl transition duration-150 shadow-xs flex flex-col justify-between gap-2.5 disabled:opacity-50"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-xs text-ink group-hover:text-accent transition leading-snug">
                📡 School WiFi Router Ban Rumor
              </span>
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                <HelpCircle className="w-3 h-3" />
                Insufficient
              </span>
            </div>
            <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
              No municipal ordinances or legislative records substantiate the viral claim that home routers are banned near schools.
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-accent group-hover:translate-x-0.5 transition">
              <span>Inspect brief</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>

      {/* ProofPulse Inspection Rules */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-ink">Assessment Standard</h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supported</span>
            </div>
            <p className="text-ink-muted text-[11px] leading-snug">Direct evidence establishes the claim as phrased.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Contradicted</span>
            </div>
            <p className="text-ink-muted text-[11px] leading-snug">Direct evidence refutes or disproves the assertion.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <GitCommit className="w-3.5 h-3.5 text-amber-600" />
              <span>Mixed evidence</span>
            </div>
            <p className="text-ink-muted text-[11px] leading-snug">Credible sources conflict or crucial context is absent.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>Insufficient</span>
            </div>
            <p className="text-ink-muted text-[11px] leading-snug">Evidence is weak, indirect, or currently unverified.</p>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed space-y-1">
          <p className="font-semibold text-indigo-950 flex items-center gap-1.5">
            <span>🛡️ No Hallucinated Provenance</span>
          </p>
          <p className="text-[11px] text-indigo-800">
            Every displayed URL originates from a real live web search response. A model cannot invent citations or publishers.
          </p>
        </div>
      </div>
    </div>
  );
}
