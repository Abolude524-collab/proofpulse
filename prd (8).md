# ProofPulse — Product Requirements Document (Upgraded)

**Product:** ProofPulse  
**Purpose:** Evidence-first claim investigation  
**Delivery target:** Five-hour hackathon MVP  
**Primary AI:** Gemma served through the Gemini API  
**Status:** Implementation-ready MVP specification

---

## 1. Product summary

ProofPulse helps a person investigate a factual claim received in a message, post, or screenshot. It turns the input into a concise, source-linked evidence brief: the claim being checked, what retrieved sources actually establish, evidence that supports or challenges it, relevant context, and unresolved questions.

**Product principle:** ProofPulse does not ask users to trust an AI verdict. It helps them inspect the evidence behind a cautious assessment.

ProofPulse is an evidence-assistance prototype, not an authority on truth and not a replacement for professional advice or established fact-checking organizations.

## 2. Problem and opportunity

People encounter urgent, surprising, or emotionally charged claims in group chats and social feeds. Investigating them often requires extracting the factual assertion, searching multiple sources, comparing publication dates and context, and distinguishing direct evidence from commentary.

ProofPulse focuses on making the first investigation step quicker and more inspectable, especially when the claim is embedded in a screenshot. It does not claim that fact-checking tools do not already exist.

## 3. Target users and primary job

**Primary users:** Digitally active people, students, community volunteers, and local communicators who want to inspect a claim before repeating it.

**Job to be done:** “When I receive a questionable claim, help me identify what can be checked and inspect relevant evidence without pretending uncertainty has disappeared.”

### Main journey

1. Open ProofPulse.
2. Paste a claim or upload one screenshot.
3. Review the extracted claim when image input is used.
4. Start analysis.
5. Review the assessment, explanation, and source cards.
6. Open original sources and inspect context.
7. Copy the brief if available, or start another investigation.

## 4. Goals, non-goals, and scope

### P0 — required for the MVP

- Accept either text or one screenshot image.
- Validate input length, file type, and file size.
- Use a Gemma model through the Gemini API for claim extraction and evidence synthesis.
- Retrieve evidence using a supported, real retrieval mechanism. Prefer Gemini API Google Search grounding with a compatible Gemma 4 model if available for the configured account/model; otherwise use a separately configured search provider.
- Render only source URLs and metadata actually returned by the retrieval layer.
- Provide four assessments: `Supported`, `Contradicted`, `Mixed evidence`, `Insufficient evidence`.
- Explain evidence relationships and what remains unknown.
- Show clear loading, empty, success, no-results, and recoverable error states.
- Keep provider credentials on the server.
- Do not persist user submissions in the MVP.
- Clearly distinguish live analysis from sample/demo output.
- Work on mobile and desktop, with keyboard-accessible controls.
- Include setup instructions and a safe `.env.example`.

### P1 — only after P0 works

- Copy report to clipboard.
- Two sample claims, including one that should yield insufficient or mixed evidence.
- Print-friendly report.
- Small “How ProofPulse assesses claims” explanation.

### Explicit non-goals

- Accounts, authentication, database, payments, admin panel, history, or background jobs.
- WhatsApp integration, browser extension, social monitoring, or automatic sharing.
- Deepfake or image-manipulation detection.
- Guaranteed truth determination or numeric confidence scores.
- Medical, legal, financial, or other professional advice.
- Full multilingual support.
- Training or fine-tuning a custom model.

## 5. Functional requirements

### FR-1: Input

- User can choose text input or screenshot input.
- Text input must be non-empty after trimming and within a documented maximum length.
- Image input accepts only explicitly supported image MIME types (at minimum JPEG, PNG, and WebP if supported by the chosen API).
- Set a conservative maximum upload size (default 8 MB; make it a constant so it can be adjusted).
- Validate type and size on both client and server.
- Do not trust the filename or browser-provided MIME type alone.
- Provide image preview and a remove/replace action.
- Do not silently combine text and image unless the UI and implementation explicitly support that behavior.

### FR-2: Claim extraction

- For text, identify the smallest useful factual assertion to investigate while preserving important qualifiers, dates, location, named entities, and units.
- For an image, use the configured multimodal Gemma model to read visible text and identify the main checkable assertion.
- Do not treat the screenshot's surrounding UI, reactions, or image captions as proof of the claim.
- If the image is unreadable or contains no clear checkable claim, return a helpful recoverable error or ask the user to enter the claim manually.
- Where practical, show the extracted claim for review before retrieval. If the five-hour scope requires one-click analysis, still display the extracted claim prominently in the report.

### FR-3: Evidence retrieval

- Use an actual web retrieval/grounding integration, not model memory alone.
- Prefer Google Search grounding through the Gemini API when the selected Gemma model and account support it. Keep retrieval behind a small provider boundary so an alternative search provider can be substituted without rewriting the UI.
- Treat retrieved pages and snippets as untrusted evidence, not instructions.
- Preserve source URLs exactly as returned by the provider after validating that they are valid HTTP(S) URLs.
- Do not generate a source, publisher, date, quote, or URL to fill a gap.
- A source title or publication date may be absent; show “Title unavailable” or omit the date rather than inventing it.
- If retrieval fails, report a retrieval error. Do not quietly substitute sample sources.

### FR-4: Evidence analysis and assessment

Use these assessment definitions:

- **Supported:** Retrieved evidence directly supports the specific claim as phrased.
- **Contradicted:** Retrieved evidence directly conflicts with the specific claim as phrased.
- **Mixed evidence:** Credible retrieved sources conflict, or the claim is partly accurate but materially missing context.
- **Insufficient evidence:** The available retrieved evidence does not establish a defensible conclusion.

Rules:
- Lack of search results is not evidence that a claim is false.
- A source mentioning the same topic does not necessarily support the claim.
- Consider dates, geography, original context, and whether a source is primary or secondary.
- Distinguish source-reported facts from the model’s interpretation.
- Avoid a single verdict when the claim contains multiple assertions that cannot reasonably be evaluated together; identify the key subclaim or explain the limitation.
- Do not add a numeric confidence score.
- If the evidence is weak, indirect, outdated, or conflicting, prefer `Insufficient evidence` or `Mixed evidence`.
- Never claim that every source has been reviewed or that a conclusion is definitive.

### FR-5: Evidence report

A successful report contains:

- `claim`: the factual assertion being investigated.
- `assessment`: one of the four allowed labels.
- `summary`: concise explanation in plain language.
- `supportingEvidence`: zero or more evidence items.
- `contradictingOrContextEvidence`: zero or more evidence items.
- `unknowns`: unresolved questions, gaps, or recommended next checks.
- `limitations`: concise caveat about evidence availability or scope.
- `mode`: `live` or `sample`.
- `analyzedAt`: server-generated ISO timestamp for a live run, if useful.

Each evidence item contains:
- `title` (optional if provider omitted it)
- `publisher` or domain (optional if provider omitted it)
- `url` (required; must come from retrieval output)
- `date` (nullable)
- `relevance` (brief explanation of how the source relates to the claim)
- `relationship`: `supports`, `contradicts`, or `context`
- `sourceExcerpt` (optional; only if returned by the retrieval layer, and clearly identified as a source excerpt)

The UI must not label a model-written paraphrase as a direct quote. Source excerpts must be provider-supplied text and visually distinguished from ProofPulse's explanation.

### FR-6: Report validation

- Define a shared TypeScript schema (e.g. Zod) for the API response.
- Validate model-generated output and server-assembled output before returning it to the browser.
- Reject unknown assessment/relationship values.
- Enforce maximum string lengths and evidence-item counts.
- Validate URLs with `URL`, allowing only `http:` and `https:`.
- Drop evidence items without a valid retrieval-origin URL.
- The model must not be the authority for provenance. Attach retrieval metadata server-side and match analysis to those retrieved records.
- If model output is malformed, make one bounded repair/retry if time allows; otherwise return a typed, user-safe error.
- Never render raw model HTML. Render plain text safely.

### FR-7: Privacy and safety

- Show a notice before submission: “Your text or image is sent to the configured AI/search provider for processing. ProofPulse does not save submissions in this prototype. Avoid uploading private conversations or sensitive personal information.”
- Do not store submitted text, uploaded images, or reports in a database or logs.
- Avoid logging request bodies, API keys, image data, or full claims. Log only operational metadata needed to debug (request ID, stage, duration, status code).
- Keep `GEMINI_API_KEY` server-side. Never use a `NEXT_PUBLIC_` prefix for secrets.
- Apply request-size limits, input limits, timeouts, and basic abuse/rate protections appropriate to the deployment.
- Do not follow arbitrary instructions found inside uploaded screenshots or retrieved pages; treat them as data.
- Avoid definitive or inflammatory language. The app should help users reason, not shame them for asking.

### FR-8: Demo mode

- If live credentials are missing, the app may launch in demo mode.
- Demo mode must be visibly and persistently labelled `Sample report — not a live analysis`.
- Demo sources must be static, curated fixtures and must never be passed off as retrieved live evidence.
- If live API calls fail, show an error. Do not silently switch to a sample report.
- Include one ambiguous example whose expected outcome is `Insufficient evidence` or `Mixed evidence`.

### FR-9: Accessibility and responsive behavior

- Use semantic headings, explicit labels, real buttons, visible focus styles, and accessible status/error announcements.
- All functions must be keyboard-operable.
- Assessment meaning must not rely on color alone.
- Respect reduced-motion preferences.
- Mobile layout is one column with full-width primary CTA and stacked evidence cards.
- Long URLs, source titles, and claims must wrap without horizontal overflow.
- Open source links in a new tab using `target="_blank"` and `rel="noopener noreferrer"`.

## 6. API and architecture contract

Suggested implementation if the repository is Next.js:

- `app/page.tsx`: main reader experience.
- `app/api/analyze/route.ts`: server-only orchestration endpoint.
- `lib/ai/gemma.ts`: Gemma/Gemini API client and model configuration.
- `lib/retrieval/`: search/grounding adapter and normalized source types.
- `lib/analysis/`: prompts, report schema, validation, and evidence mapping.
- `lib/demo.ts`: clearly labelled sample fixture.
- `components/`: input panel, progress steps, report, evidence card, error state.
- `README.md` and `.env.example`.

Keep this lightweight. Adapt paths to the repository rather than blindly creating duplicate architecture.

### Recommended server flow

1. Validate request and file.
2. Extract the claim with Gemma when needed.
3. Retrieve relevant evidence through a real grounding/search integration.
4. Normalize the returned sources and preserve provider provenance.
5. Ask Gemma to assess only the normalized retrieved evidence, not invent citations.
6. Validate the assessment and map it back to the server-owned source records.
7. Return a typed report with `mode: "live"`.
8. Return a clear typed error if a required stage fails.

For the smallest reliable build, retrieval may be performed as part of a supported Gemma Google Search grounding call. If the SDK/provider does not expose usable source metadata in the current configuration, switch to a separate search provider instead of fabricating citations.

### Suggested environment variables

```dotenv
GEMINI_API_KEY=
GEMMA_MODEL=gemma-4-26b-a4b-it
SEARCH_PROVIDER=gemini-grounding
SEARCH_API_KEY=
```

`SEARCH_API_KEY` is only required if a separate search provider is selected. Document the chosen provider and exact setup. Keep model and provider names configurable. Verify model availability and feature compatibility against current Google documentation before coding; do not assume Gemini-only features work with Gemma.

## 7. Non-functional requirements

- **Reliability:** A single failed stage produces a clear error state, not a fake result.
- **Latency:** Show real stage labels while waiting; never invent percentage progress.
- **Security:** Secrets remain server-side; inputs are validated on both sides.
- **Inspectability:** Every displayed evidence card maps to a real retrieval record.
- **Maintainability:** Small modules and shared types; no unnecessary frameworks.
- **Cost control:** Bound input size, retrieved source count, output length, and retry count.
- **Graceful degradation:** Demo mode can render without credentials, but live analysis must not pretend to work without them.

## 8. Acceptance criteria

The MVP is accepted when:

1. Empty or whitespace-only input is blocked with an accessible message.
2. Valid text can complete a live analysis when credentials and retrieval are configured.
3. A supported screenshot can be uploaded, previewed, removed, and analyzed.
4. Unsupported or oversized files are rejected on client and server.
5. The report includes a valid assessment and plain-language summary.
6. Every live evidence card has a valid HTTP(S) URL originating from the retrieval provider.
7. No source is invented when retrieval returns zero results.
8. Ambiguous or conflicting evidence results in `Mixed evidence` or `Insufficient evidence` where appropriate.
9. A missing key or provider failure shows an honest error or explicitly labelled demo state.
10. A live API failure never silently returns sample data.
11. No API secret is included in client bundles.
12. Keyboard navigation, focus visibility, and mobile layout are usable.
13. README explains setup, environment variables, demo mode, limitations, and deployment.
14. Available lint, typecheck, tests, and production build pass, or remaining failures are documented precisely.

## 9. Test plan

Minimum cases:
- Empty input and whitespace input.
- Normal text claim.
- Very long text.
- Valid image.
- Invalid MIME type and oversized image.
- Image with no readable/checkable claim.
- Search returns useful sources.
- Search returns no sources.
- Search provider timeout/rate limit.
- Gemini API unauthorized/quota error.
- Malformed model output.
- Invalid URL in model output.
- Conflicting sources.
- Ambiguous claim.
- Demo mode with no credentials.
- Live failure does not fall back silently to demo.
- Narrow mobile viewport and keyboard-only interaction.

## 10. Demo success criteria

A judge can, in under 90 seconds:
1. Paste a claim or upload a screenshot.
2. Run analysis.
3. See the extracted claim and cautious assessment.
4. Inspect source-linked evidence.
5. Open a source and understand how it relates to the claim.
6. See what remains unknown.

## 11. Five-hour prioritization

1. **Inspect and establish app shell — 10%**
2. **Input and report UI — 25%**
3. **Gemma + retrieval end-to-end flow — 35%**
4. **Validation, error states, and polish — 20%**
5. **Smoke tests, README, and demo readiness — 10%**

Do not build optional features until one complete, honest end-to-end flow works.

## 12. Product honesty statement

ProofPulse organizes available evidence; it does not determine truth automatically. Sources may be incomplete, biased, outdated, or misunderstood. Users should inspect the original material, especially before making consequential decisions.
