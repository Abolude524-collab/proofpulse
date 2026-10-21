"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InputPanel } from "@/components/InputPanel";
import { BenchmarkShowcase } from "@/components/BenchmarkShowcase";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { ResultsReport } from "@/components/ResultsReport";
import { Footer } from "@/components/Footer";
import {
  EvidenceReport,
  AnalyzeApiResponse,
  ALLOWED_IMAGE_MIME_TYPES,
} from "@/lib/types";
import { RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<EvidenceReport | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (payload: {
    text?: string;
    image?: {
      base64: string;
      mimeType: (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
      sizeBytes: number;
      name?: string;
    };
    isDemoSample?: boolean;
    sampleId?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: AnalyzeApiResponse = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg =
          !data.success && data.error
            ? data.error
            : `Analysis request failed with status ${res.status}.`;
        setError(errorMsg);
        return;
      }

      setReport(data.report);
      // Smoothly focus report
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      console.error("Network or client error:", err);
      setError(
        "Could not communicate with the analysis server. Check your connection or try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectSample = (sampleId: string) => {
    handleAnalyze({ isDemoSample: true, sampleId });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Workspace Layout */}
        {!report ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Hero & Input Panel */}
            <div className="lg:col-span-7 space-y-6">
              <Hero />

              <InputPanel
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                error={error}
                onClearError={() => setError(null)}
              />
            </div>

            {/* Right Column: Loading or Interactive Benchmark Showcase */}
            <div className="lg:col-span-5 space-y-6">
              {isLoading ? (
                <AnalysisProgress />
              ) : (
                <BenchmarkShowcase
                  onSelectSample={handleSelectSample}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        ) : (
          /* Results Layout: Split-pane Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Controls & Quick Query */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span className="font-bold text-xs uppercase tracking-wider text-ink">
                      Active Investigation
                    </span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover hover:underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Claim Checked:
                  </span>
                  <p className="text-xs font-medium text-ink bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 line-clamp-3">
                    "{report.claim}"
                  </p>
                </div>

                {/* Model & Search info */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1 text-xs text-indigo-950">
                  <div className="flex items-center justify-between text-[11px] font-medium text-indigo-800">
                    <span>Synthesized with:</span>
                    <span className="font-mono font-bold">Gemma 4</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-indigo-800">
                    <span>Retrieval mode:</span>
                    <span className="font-semibold">{report.mode === "live" ? "Live Web Search" : "Benchmark Fixture"}</span>
                  </div>
                </div>

                {/* New Analysis Form in Sidebar */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-ink mb-2">Check Another Claim:</h4>
                  <InputPanel
                    onAnalyze={handleAnalyze}
                    isLoading={isLoading}
                    error={error}
                    onClearError={() => setError(null)}
                  />
                </div>
              </div>
            </div>

            {/* Right Pane: Full Evidence Brief */}
            <div className="lg:col-span-8" ref={reportRef} tabIndex={-1}>
              <ResultsReport report={report} onReset={handleReset} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
