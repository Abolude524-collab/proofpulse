# ProofPulse — Evidence, Not Guesswork

ProofPulse is an evidence-first claim investigation prototype built for a five-hour hackathon MVP. It transforms a pasted claim or screenshot into a concise, source-linked evidence brief: the checkable assertion, what retrieved sources establish, evidence supporting or challenging the assertion, nuanced context, and what remains unknown.

> **Core Product Principle:** ProofPulse does not ask users to trust an AI verdict. It organizes available evidence so users can inspect original sources and understand uncertainty.

---

## Key Features

- **Gemma 4 via Gemini API:** Extracts the core factual assertion and synthesizes retrieved evidence using `gemma-4-26b-a4b-it` (configurable via `GEMMA_MODEL`).
- **Real Evidence Retrieval:** Grounded in real web searches with normalized source metadata (`RetrievedSource`). Supports `gemini-grounding`, `duckduckgo`, `tavily`, and `brave`.
- **Strict Provenance Guarantee:** Every source shown in the report maps directly to a verified retrieval record with an `http:` or `https:` URL. ProofPulse never hallucinates citations or URLs.
- **Inspectable Assessments:** Four standardized labels: `Supported`, `Contradicted`, `Mixed evidence`, and `Insufficient evidence`. Never displays fake numeric confidence meters.
- **Uncertainty & Unknowns:** Explicitly highlights open questions, data limitations, and recommended next checks.
- **Privacy & Safety:** All input processing happens in memory; submissions and uploaded images are never persisted.
- **Zero-Credential Demo Mode:** Full offline/demo mode with curated benchmark fixtures (`Mixed evidence`, `Supported`, `Insufficient evidence`).

---

## Architecture & Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS with WCAG AA-compliant restrained navy/neutral surfaces and accessible focus rings
- **AI SDK:** Official Google Gen AI SDK (`@google/genai`)
- **Validation:** Zod schema validation on both client and server
- **Icons:** Lucide React

```
proofpulse/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts         # Server-only orchestration endpoint
│   ├── globals.css              # Design tokens and theme
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application interface
├── components/
│   ├── AnalysisProgress.tsx     # Honest multi-step progress indicator
│   ├── EvidenceCard.tsx         # Source card with publisher, date, & excerpts
│   ├── Footer.tsx               # Cautious product honesty statement
│   ├── Header.tsx               # Wordmark and "How it works" modal trigger
│   ├── Hero.tsx                 # Headline and privacy notice
│   ├── HowItWorksModal.tsx      # Accessible methodology explainer
│   ├── InputPanel.tsx           # Segmented text/screenshot panel with dropzone
│   └── ResultsReport.tsx        # Complete evidence brief with copy action
├── lib/
│   ├── ai/
│   │   ├── assess-evidence.ts   # Gemma assessment logic & provenance mapping
│   │   ├── client.ts            # Server-only Google Gen AI client
│   │   └── extract-claim.ts     # Factual claim extraction with Gemma
│   ├── demo.ts                  # Curated benchmark sample fixtures
│   ├── retrieval/
│   │   ├── external-search.ts   # DuckDuckGo, Tavily, and Brave search adapters
│   │   ├── gemini-grounding.ts  # Gemini Google Search grounding adapter
│   │   ├── index.ts             # Provider factory
│   │   ├── types.ts             # RetrievedSource & SearchProvider contracts
│   │   └── url-sanitizer.ts     # HTTP(S) validation and domain extraction
│   └── types.ts                 # Shared Zod schemas and constants
└── tests/
    └── run-tests.mjs            # Automated test suite
```

---

## Gemma & Retrieval Integration Details

### 1. Gemma Model Choice
- Configurable default: `GEMMA_MODEL=gemma-4-26b-a4b-it` (Gemma 4 MoE 26B total / 4B active parameters).
- **Verified Capability:** Per official Google Gemini API documentation, Gemma models on the Gemini API are text-only models and do not support the native `google_search` tool directly in the API.
- **Honest Fallback Handling:**
  - **Screenshot Analysis:** The UI provides an accessible file dropzone, MIME validation, and thumbnail preview for screenshots up to 8 MB. Because Gemma on Gemini API is text-only, ProofPulse informs the user and invites them to paste the claim text into the Text tab, rather than faking OCR or silently substituting a proprietary Gemini model.
  - **Retrieval Layer:** The search provider is modularized behind a clean adapter interface (`SearchProvider`). While `gemini-grounding` is available, `duckduckgo` is provided as an immediate live search provider that requires no separate API key, and `tavily` / `brave` can be enabled with `SEARCH_API_KEY`.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default | Required? |
|---|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key from Google AI Studio | *(empty)* | Required for live Gemma inference |
| `GEMMA_MODEL` | Model ID hosted on Gemini API | `gemma-4-26b-a4b-it` | No |
| `SEARCH_PROVIDER` | Search provider (`duckduckgo`, `gemini-grounding`, `tavily`, `brave`) | `duckduckgo` | No |
| `SEARCH_API_KEY` | API key for Tavily or Brave | *(empty)* | Only if using Tavily/Brave |

*Note: Never prefix sensitive keys with `NEXT_PUBLIC_`. Secrets remain strictly on the server.*

---

## Getting Started

### Prerequisites
- Node.js >= 18 (Tested on Node.js v24)
- npm >= 9

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Tests
```bash
npm test
```

### Typecheck & Build
```bash
npm run typecheck
npm run build
```

---

## Demo Mode (Zero Credentials)

If you don't have a `GEMINI_API_KEY` configured, you can test ProofPulse immediately using Demo Mode:
1. Open the app at [http://localhost:3000](http://localhost:3000).
2. Under "Or try a benchmark sample:", click any of the curated sample claims:
   - **🔭 Exoplanet Water Vapor (Mixed evidence):** Analyzes the James Webb Space Telescope transit spectroscopy of GJ 486 b vs stellar starspot contamination.
   - **🍌 Banana Radioactivity (Supported):** Analyzes dietary potassium-40 decay and biological regulation.
   - **📡 WiFi School Ban (Insufficient evidence):** Analyzes an unsubstantiated viral ordinance claim.
3. Observe the persistent `Sample report — not a live analysis` banner.

---

## Known Limitations

1. **Gemma 4 Modality:** Current Gemma models on the Gemini API are text-only. Screenshot images are validated on client and server, but claim extraction requires text input.
2. **Search Grounding on Gemma:** Grounding with Google Search is not available for Gemma models through the Gemini API. The modular retrieval layer uses external web retrieval (`duckduckgo`, `tavily`, etc.) and feeds retrieved context to Gemma.
3. **Language:** ProofPulse is optimized for English claims.

---

## License

MIT License\.
