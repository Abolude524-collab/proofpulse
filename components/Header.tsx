"use client";

import { useState } from "react";
import { HelpCircle, ShieldCheck, Sparkles, Cpu } from "lucide-react";
import { HowItWorksModal } from "./HowItWorksModal";

export function Header() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="w-full border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-ink">
                  ProofPulse
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">
                  <Cpu className="w-3 h-3 text-indigo-600" />
                  Gemma 4
                </span>
              </div>
              <p className="text-xs text-ink-muted hidden sm:block font-medium">
                Evidence, not guesswork.
              </p>
            </div>
          </div>

          {/* Model & System Indicators */}
          <div className="hidden md:flex items-center gap-3 text-xs text-ink-muted">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-border rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] text-slate-700">gemma-4-26b-a4b-it</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">Live Search Grounding</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-slate-100 rounded-lg transition border border-border/80 shadow-xs"
              aria-label="How ProofPulse works"
            >
              <HelpCircle className="w-4 h-4 text-accent" />
              <span>How it works</span>
            </button>
          </div>
        </div>
      </header>

      <HowItWorksModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
