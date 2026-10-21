export function Footer() {
  return (
    <footer className="w-full border-t border-border mt-auto py-8 bg-surface/50 text-xs text-ink-muted text-center px-4">
      <div className="max-w-2xl mx-auto space-y-2">
        <p className="font-medium text-slate-700">
          AI-generated analysis can be wrong. Check the linked sources before making or sharing important decisions.
        </p>
        <p className="text-[11px] text-slate-500">
          ProofPulse is an evidence-assistance prototype, not an authority on truth and not a replacement for established fact-checking organizations.
        </p>
      </div>
    </footer>
  );
}
