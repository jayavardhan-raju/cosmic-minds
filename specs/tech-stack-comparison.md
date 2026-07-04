# Cosmic Minds — Tech-Stack Comparison & Decision (vs the Duolingo-clone build)

> Decision record. Benchmarked Cosmic Minds against a "practical vibe coding" Duolingo-clone tutorial
> (React Native + Expo, NativeWind, Zustand, Clerk, Stream, PostHog, CodeRabbit, Vision Agents + OpenAI
> Realtime). Key framing: **that build is a general consumer app with no child-safety constraints; Cosmic
> Minds is a child app under a mandatory safety gate.** That difference decides what we copy.

## Decision (capstone): adopt the workflow/tooling wins, keep our architecture & safety model

## Adopt / Adapt / Skip

| Their choice | Verdict for Cosmic Minds | Why |
|---|---|---|
| Feature-by-feature workflow | **Adopt** | Same as FORGE Render small-batch discipline |
| `agents.md` master prompt | **Already have** (`AGENTS.md`) | — |
| Official framework Agent Skills | **Adopt pattern** (React/Vite + agents-cli skills) | Agent uses current APIs, not stale memory |
| Copy official docs into prompts | **Adopt** | Matches "pin versions, don't trust cutoff" |
| Design-system-from-image → tokens | **Adopt** | Ideal for the cosmic theme; low risk |
| Push-to-talk | **Adopt** | Clear turns for a 7-yo; cuts echo; gives a clean pre-speech safety checkpoint |
| Live subtitles / transcription | **Adopt** | Reinforces reading + accessibility |
| Zustand (state) + persistence | **Adopt** | Cleaner than the monolith; works in React web (localStorage/IndexedDB) |
| CodeRabbit (AI PR review) | **Adopt** (or Gemini Code Assist) | FORGE Evaluate managed-reviewer tier |
| Clerk (auth) | **Defer to v2** | Needed for multi-family parent auth + COPPA consent, not the home demo |
| Stream + Vision Agents + OpenAI Realtime | **Adapt, don't copy** | If we want real-time, use **Gemini Live** (one stack); and it weakens the pre-speech safety gate |
| PostHog child analytics | **Skip / restrict** | Profiling a 7-yo conflicts with our privacy stance + COPPA |
| Expo / React Native (mobile) | **Defer to v2** | Right target for a kids' app + stores, but a full re-platform under the July 6 deadline |

## The two trade-offs that drove the decision
- **Voice — real-time vs turn-based.** Real-time streaming (Stream+OpenAI, or Gemini Live) is engaging but
  the model speaks straight to the child with **no clean checkpoint before speech** — which breaks our hard
  invariant that `safety.classify` passes *before* any response is spoken. **Turn-based is the safer design
  for a child**, especially Coach Kai. Real-time is a v2 option, Gemini Live only, non-safety teachers only,
  with streaming moderation.
- **Analytics on a child.** Our requirements say nothing about the child leaves the device except AI calls.
  PostHog-style behavioral analytics on a 7-yo is exactly what COPPA/GDPR-K restrict. Parent-side/aggregate,
  anonymized, consent-gated only — or skip for the capstone.

## What changed in the specs (capstone)
- `architecture.md §8`: added **Zustand + persistence**, **push-to-talk**, **live subtitles**,
  **design-tokens-from-image**; new **§8.1 dev tooling** (official skills, docs-in-prompt, CodeRabbit/
  Gemini Code Assist, turn-based voice, no child analytics).
- `architecture.md §2`: pointer to `roadmap-v2.md` and this file.

## What did NOT change (deliberately)
- React-web + ADK multi-agent + MCP + skills + layered safety gate — the graded architecture and the child
  protections stay exactly as specced.

## Meta-point
Adopt their **workflow and tooling** freely; be selective about their **data-flow and real-time** choices,
because the child user makes safety and privacy the constraints that override raw engagement.
