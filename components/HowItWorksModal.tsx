"use client";

import { useEffect, useRef } from "react";
import { X, Search, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-border p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-ink">
              How ProofPulse Assesses Claims
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              Evidence-first analysis powered by Gemma & Gemini API
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-ink-muted hover:text-ink hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-ink-muted leading-relaxed">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-accent flex items-center justify-center shrink-0 font-semibold text-sm">
              1
            </div>
            <div>
              <p className="font-semibold text-ink">Extract checkable assertion</p>
              <p>
                Gemma extracts the specific factual claim while preserving key dates, entities, and qualifiers, cutting through rhetoric or emotional framing.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-accent flex items-center justify-center shrink-0 font-semibold text-sm">
              2
            </div>
            <div>
              <p className="font-semibold text-ink">Retrieve real web sources</p>
              <p>
                ProofPulse searches live web indexes. Every single source shown in your report comes directly from a real retrieval query—never from model hallucination.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-accent flex items-center justify-center shrink-0 font-semibold text-sm">
              3
            </div>
            <div>
              <p className="font-semibold text-ink">Synthesize evidence & unknowns</p>
              <p>
                Gemma categorizes each source into supporting, contradicting, or context, and explicitly flags what remains unknown or unverified.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-border rounded-xl flex items-start gap-3 text-xs text-ink-muted">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Product Honesty Statement:</strong> ProofPulse organizes available evidence; it does not determine absolute truth. Sources may be incomplete, biased, or outdated. Always inspect original sources before making important decisions.
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition text-sm shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
