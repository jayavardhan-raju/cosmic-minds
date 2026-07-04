# Cosmic Minds — Pending Decisions (ADR)

> Two decisions block a clean build. This record explains each, lays out options with trade-offs, and gives
> a recommendation. Verify model strings/prices against your own console at build time — they move.
> Data here was pulled from Google's official docs on 2026-06-30 (Gemini models page last updated 2026-06-15).

---

## Decision 1 — What backs `safety.classify`

### Why this is the real gate
`safety.classify` runs on every child message AND every model response (see `mcp-contracts.md §1`,
`safety.md §5`). It is the deterministic boundary that the model cannot talk its way past. Its **recall on
child distress** (catching "my dad hits me", self-harm, abuse) is the entire safety story — a missed
distress signal is the worst-case failure, far worse than a false positive. So the question is not "does it
exist" but "what powers it, and how good is its distress recall."

### The options

**A. Gemini API built-in safety settings (harm-category thresholds).**
Configurable filters for harassment, hate, sexual, dangerous content; you set block thresholds per category.
- *Pros:* free, already in the API, zero extra infra, blocks the obvious egregious stuff.
- *Cons:* tuned for *generic* harm, NOT for *child distress / disclosure of abuse*. It will not reliably flag
  "my dad hits me" as something to escalate — that's not "dangerous content," it's a welfare signal. **Not
  sufficient on its own for a child app.**

**B. Gemini as a custom moderation classifier ("Gemini for filtering and moderation").**
Run a *separate* Gemini call whose only job is to classify the text against YOUR written child-safety policy
(your categories: distress, abuse-disclosure, self-harm, scary, PII, off-topic). Returns the structured
verdict your contract expects.
- *Pros:* you control the policy exactly; can detect nuanced distress; handles your custom categories; same
  vendor, easy to wire. This is what `mcp-contracts.md §1` is shaped for.
- *Cons:* it's an LLM, so it's probabilistic — you must measure its recall and it costs a call per turn.

**C. A dedicated third-party moderation API as a second opinion.**
e.g. a content-safety service or a crisis/self-harm classifier, layered in.
- *Pros:* independent signal; defense-in-depth; some are purpose-built for self-harm/crisis.
- *Cons:* another vendor, latency, cost, and you still own the distress-escalation policy.

**D. Deterministic crisis lexicon (regex/keyword) as a fast pre-filter.**
A hand-curated list of crisis/abuse/self-harm phrases that triggers escalation *immediately*, before any LLM.
- *Pros:* 100% recall on the exact phrases it knows; instant; free; can't be "argued out of it."
- *Cons:* brittle to paraphrase; high false positives if careless. Good as a FLOOR, not the whole system.

### Recommendation: layered (D + B), with A underneath, plus required process
For a 7-year-old, use **defense-in-depth**, not one classifier:
1. **D — deterministic crisis lexicon** runs first on child input. Any hit → immediate scripted escalation.
   (Catches the clear cases with certainty.)
2. **B — Gemini custom-policy classifier** runs on child input AND every model response, returning the
   `{verdict, distress, categories, pii_found}` your contract defines. This catches paraphrased/nuanced
   distress the lexicon misses, and moderates the model's own output.
3. **A — Gemini built-in safety settings** stay enabled as a backstop on generation.
4. **CSAM:** if you ever accept uploaded images at scale, you must use **Google's child-safety toolkit** for
   CSAM detection — that's a legal obligation, not an option, for a child-facing product.
5. **Process (non-negotiable):** run `evalsets/coach-kai.evalset.json` distress cases as a release gate —
   require 100% escalation on those, sustained across repeated runs (`pass^k`), with **human review** of a
   sample. Add a Play-style **in-app "tell a grown-up / report" affordance**. Tune toward over-triggering:
   a false distress flag (a needless "talk to a grown-up") is acceptable; a missed one is not.

> Bottom line: don't ship a child app whose safety rests on generic harm filters. Lexicon for certainty +
> Gemini custom classifier for nuance + measured distress recall + human review. Treat distress recall as
> the metric you defend.

---

## Decision 2 — Model IDs (pin them; don't let an agent guess)

### Current Gemini lineup (from ai.google.dev/models, page updated 2026-06-15)

| Model | API string | Status | Good for |
|---|---|---|---|
| Gemini 3.5 Flash | `gemini-3.5-flash` | **Stable** | "Most intelligent" flash; agentic/coding; strong default for teachers |
| Gemini 3.1 Pro | `gemini-3.1-pro-preview` | Preview | Deepest reasoning; Pi's multi-step math, Kai's sensitive turns |
| Gemini 3 Flash | `gemini-3-flash-preview` | Preview | Frontier-ish at lower cost |
| Gemini 3.1 Flash-Lite | `gemini-3.1-flash-lite` | **Stable** | Cheapest/fastest; classification, safety pre-screen |
| Gemini 2.5 Flash | `gemini-2.5-flash` | **Stable** | Best price-performance workhorse |
| Gemini 2.5 Flash-Lite | `gemini-2.5-flash-lite` | **Stable** | Highest-volume, lowest cost |
| Gemini 3.1 Flash TTS | `gemini-3.1-flash-tts-preview` | Preview | Voice output for the `tts` server |
| Gemini 2.5 Flash TTS | `gemini-2.5-flash-preview-tts` | Preview | TTS alternative |
| Gemini Embedding 2 | `gemini-embedding-2` | — | If you cluster transcripts/corrections later |

Pricing seen on 2026-06-30 (per 1M tokens, verify in your console): **3.5 Flash ≈ $1.50 in / $9.00 out**
($0.15 cached in); **3.1 Pro ≈ $2 in / $12 out**; 2.5 Flash / Flash-Lite are cheaper. 3.5 Flash has a 1M
input / 64K output window.

### Version aliases — and why they matter for a safety-critical app
- **Stable** (`gemini-3.5-flash`): doesn't change under you. **Use this for anything safety-critical.**
- **Preview** (`...-preview`): production-allowed but **deprecated with as little as 2 weeks' notice**.
- **Latest** (`gemini-flash-latest`): hot-swaps to new releases (2-week email notice). Convenient, but the
  model's behavior can shift — **do not use `latest` for the safety classifier or Coach Kai.** A silent
  behavior change on the distress path is exactly what you can't have.

### Recommendation: pin stable per role, route by cost
```yaml
# specs/architecture.md §4/§11 — pin these (then re-confirm in your console before build)
models:
  orchestrator_router:   gemini-2.5-flash-lite   # cheap, fast classification/routing
  safety_classifier:     gemini-2.5-flash        # STABLE — never 'latest'/preview on the safety path
  teacher_default:       gemini-3.5-flash        # Ollie, Luna, Arlo
  reasoning_teachers:    gemini-3.5-flash        # Professor Pi, Coach Kai (or 3.1-pro-preview if you accept preview risk + cost)
  tts:                   gemini-2.5-flash-preview-tts   # or 3.1-flash-tts-preview (preview)
```
Rationale: route deterministic/cheap work (routing, safety pre-screen) to the cheapest stable model and
reserve a stronger model only where reasoning quality matters (token economics, Day 1). Keep the safety
classifier on a **stable** string. If you want Pro-level reasoning for Pi/Kai, accept that `3.1-pro-preview`
is a preview (deprecation + higher cost) and set a calendar reminder to re-pin.

### How to confirm (don't trust this table blindly at build time)
1. Open **Google AI Studio / Vertex AI** in your provisioned GCP project → Models; copy the exact strings
   your project has access to (regional availability varies).
2. Check the **Pricing** and **Deprecations** pages for current rates and end-of-life dates.
3. Set **hard spend limits** per provider (no client-side rate limiting exists). Use cached input for the
   repeated system prompts to cut cost.
4. Paste the confirmed strings into `architecture.md §4/§11`; leave no `CONFIRM_AND_PIN` placeholders.

---

## Status
- [x] Decision 1 resolved (2026-06-30) → **LAYERED**: (1) crisis lexicon `specs/safety-crisis-lexicon.md`
      (first, deterministic) + (2) Gemini custom classifier `gemini-2.5-flash` (child input + model output)
      + (3) built-in safety settings (backstop). Wired in `mcp-contracts.md §1`. Distress recall is the gating
      metric; validate on `evalsets/coach-kai.evalset.json` (100%, pass^k) with human review before real use.
- [x] Decision 2 resolved (Option A, all stable, 2026-06-30) → pinned in architecture §4/§9/§11 and GEMINI.md:
      router `gemini-2.5-flash-lite`, teachers `gemini-3.5-flash`, safety `gemini-2.5-flash`, TTS
      `gemini-2.5-flash-preview-tts`. Still verify each string in your GCP console, then set `confirmed_on`.
