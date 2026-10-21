# ProofPulse — Design Specification (Upgraded)

## 1. Experience principles

ProofPulse should feel like a calm evidence workspace, not a sensational misinformation alarm.

1. **Evidence before verdict:** source cards and their relevance should carry more visual weight than the assessment label.
2. **Uncertainty is a valid result:** make “Mixed evidence” and “Insufficient evidence” feel like legitimate outcomes, not failures.
3. **Plain language:** avoid jargon, sensational labels, or accusatory copy.
4. **Honest states:** distinguish live analysis, demo fixtures, loading, and provider failure.
5. **Fast to understand:** a first-time user should understand the main action without onboarding.

## 2. Visual direction

- **Theme:** warm off-white background, white content surfaces, deep navy text.
- **Accent:** restrained indigo or blue for primary action and focus.
- **Status:** use text labels plus subtle icons/borders; never rely on color alone.
- **Typography:** modern sans-serif with strong readable hierarchy.
- **Surfaces:** quiet borders, restrained shadows, rounded cards, consistent spacing.
- **Motion:** minimal; respect `prefers-reduced-motion`.
- **Avoid:** giant “FAKE” stamps, fake confidence meters, dramatic warning illustrations, excessive gradients, decorative charts, and false precision.

Use the existing design system if the repository already has one. Otherwise define reusable design tokens rather than scattering arbitrary colors.

Suggested starting tokens (adjust to existing styles):
- `--color-bg: #F7F8FA`
- `--color-surface: #FFFFFF`
- `--color-ink: #172033`
- `--color-muted: #596579`
- `--color-border: #DCE2EA`
- `--color-accent: #465FEA`
- `--color-focus: #2449D8`

Check actual text/background combinations for WCAG AA contrast; do not assume the suggested values automatically pass in every use.

## 3. Page layout

### Header

- Wordmark: **ProofPulse**
- Descriptor: “Evidence, not guesswork.”
- One small “How it works” action that opens an accessible disclosure/dialog or scrolls to a concise explanation.
- No login, admin links, or navigation clutter.

### Hero

**Headline:** “Before you share it, inspect the evidence.”

**Supporting text:** “Paste a claim or upload a screenshot. ProofPulse builds a source-linked evidence brief.”

**Privacy note:** “Your input is sent to the configured AI/search provider for processing. This prototype does not save submissions. Avoid uploading private conversations or sensitive personal information.”

Keep the hero compact so the input panel appears early in the first viewport.

### Input panel

- Accessible segmented control or tabs: `Paste text` / `Upload screenshot`.
- Text mode: labelled textarea with placeholder “Paste the exact message or claim you want to check.”
- Screenshot mode: labelled drop zone and browse button, thumbnail preview, file name/size, remove/replace action.
- Upload helper: “Upload a screenshot containing the claim. Avoid private conversations or personal information.”
- CTA: `Analyze evidence`.
- Disable CTA only when no valid input exists or a submission is in progress; provide visible validation text for invalid input.
- Show a character count when a maximum length is enforced.
- Do not imply that image manipulation or deepfake detection is included.

### Analysis progress

Show a compact, honest three-step list:
1. Extracting the claim
2. Finding relevant sources
3. Preparing the evidence brief

Use a real loading state and an accessible status announcement. Do not use a fake percentage or mark steps complete before they actually complete. If implementation cannot expose stage-by-stage progress from the server, use a single spinner plus “Analyzing your input…” rather than simulate progress.

### Results report

1. **Claim under review**
   - Display the extracted claim in a readable block.
   - If editable claim review is feasible within the time box, allow editing before analysis or offer “Check this wording again.”
2. **Assessment**
   - One compact text label: Supported / Contradicted / Mixed evidence / Insufficient evidence.
   - Include a short explanation, not a numeric confidence score.
3. **What we found**
   - A concise plain-language synthesis.
   - Make it clear that this is ProofPulse’s interpretation, not a direct quotation from a source.
4. **Evidence**
   - Group items by relationship: “Evidence supporting the claim” and “Evidence challenging it or adding context.”
   - Each card shows title, publisher/domain, date if available, short relevance explanation, and `Open source`.
   - Source excerpts, if present, must be visibly marked as excerpts from the source.
   - Missing dates should simply be omitted; never show fabricated metadata.
   - Empty groups should show a calm explanation rather than an empty blank area.
5. **What remains unknown**
   - List missing context, unresolved questions, or a sensible next check.
6. **Actions**
   - `Copy report` if implemented.
   - `Check another claim`.
7. **Mode indicator**
   - In demo mode, display a persistent, obvious label: `Sample report — not a live analysis`.
   - Never show the sample label for live reports.

### Footer

“AI-generated analysis can be wrong. Check the linked sources before making or sharing important decisions.”

“ProofPulse is an evidence-assistance prototype, not an authority on truth.”

## 4. Component and state inventory

### Input states

- Empty
- Text entered
- Screenshot selected with preview
- Invalid file type
- File too large
- Submission in progress
- Input cleared/reset

### Analysis states

- Idle
- Loading
- Live success with evidence
- Live success with insufficient evidence
- Mixed evidence
- No sources found
- Image unreadable/no checkable claim
- Provider timeout or rate limit
- Missing credentials
- Malformed model output
- Recoverable error with retry
- Explicit demo mode

### Report states

- Supporting group populated or empty
- Contradicting/context group populated or empty
- Source without publication date
- Long title, URL, claim, or explanation
- Unknowns present or absent
- Copy success/failure if copy is implemented

## 5. Responsive behavior

### Desktop

- Centered content column with a maximum width around 960–1040px.
- Input and report use the available width without making paragraphs excessively long.
- Evidence groups may use two columns only if the cards remain readable; otherwise use a single column.

### Mobile

- Single-column layout.
- Full-width primary CTA.
- Stacked evidence cards.
- Adequate touch target size.
- File name, source title, and URL wrap without horizontal overflow.
- No hover-only controls.
- Keep the assessment and first evidence item near the top of the results.

## 6. Accessibility

- Semantic landmarks and a logical heading hierarchy.
- Every textarea, file input, tab, and button has an accessible name.
- All interactions work with keyboard only.
- Focus rings remain visible.
- Loading and error updates use appropriate live regions (e.g. `aria-live="polite"` for progress and `role="alert"` for actionable errors).
- Do not communicate evidence relationship through color alone.
- Respect reduced-motion preferences.
- Ensure contrast meets WCAG AA for text and controls.
- Do not trap focus unless a real modal is used; if a modal is used, manage and restore focus correctly.
- Provide meaningful alt text for content images; decorative icons should be hidden from assistive technology.

## 7. Microcopy

**CTA:** Analyze evidence

**Empty input:** Enter a claim or choose a screenshot before starting.

**Invalid file:** This file type is not supported. Choose a supported image file.

**Oversized file:** This image is too large. Choose an image under the displayed size limit.

**Insufficient evidence:** “We couldn’t find enough reliable evidence to support a clear conclusion. That does not mean the claim is true or false.”

**Mixed evidence:** “The available sources disagree or leave out important context. Review the sources before drawing a conclusion.”

**No sources:** “We couldn’t retrieve relevant sources for this claim. No search results does not prove the claim is false.”

**API failure:** “We couldn’t complete this analysis. Try again, or use text input instead.”

**Privacy:** “Your input is sent to the configured AI/search provider for processing. ProofPulse does not save submissions in this prototype.”

**Source action:** Open source

**Demo label:** Sample report — not a live analysis

## 8. Interaction rules

- Disable duplicate submission while a request is in progress.
- Preserve input after a recoverable failure so the user can retry.
- Reset clears input, preview, error, and report state.
- Open external sources in a new tab with `rel="noopener noreferrer"`.
- Never silently replace a failed live report with a demo fixture.
- Do not make a source card appear verified merely because it has a polished UI.
- Avoid success animations that imply certainty.

## 9. Visual hierarchy

The intended eye path is:

1. Input and primary action
2. Claim under review
3. Assessment and explanation
4. Evidence cards and source links
5. Unknowns and limitations

The evidence should be more visually prominent than the verdict. This is a deliberate product choice: ProofPulse values inspectability over authority.

## 10. Demo mode

When sample data is shown:
- Display `Sample report — not a live analysis` near the report heading.
- Use a curated, clearly fictional or carefully sourced example fixture.
- Never reuse sample evidence after a live provider failure without telling the user.
- Make it clear that sample results do not reflect the user's input.
