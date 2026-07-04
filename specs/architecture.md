# Spec: Cosmic Minds — Architecture

> FORGE Frame-phase source of truth. Antigravity/ADK scaffolds from this. Markdown for narrative, flat YAML
> for config. Human-review this before any code is generated. Companion files: `safety.md`,
> `teachers/*.md`, `evalsets/*`.

## 1. Background — the "why"
Cosmic Minds is a space-themed AI tutoring web app for a young child (~7yo). It is the submission for the
**Kaggle "AI Agents: Intensive Vibe Coding" Capstone — Freestyle Track** (deadline **2026-07-06 23:59 PT**).
The child talks to five subject "teachers" by voice; each teacher is a specialist AI agent. The primary
user is a **minor**, so child safety is the controlling constraint — above features, aesthetics, and the
deadline. Long-term the project may scale to other families, but this build is a home/demo + capstone
artifact, not a published commercial product (see §10).

## 2. Goals & non-goals
**Goals**
- Demonstrate ≥3 graded capstone concepts (we target four — see §3).
- A working, safe, voice-first tutoring experience across five subjects.
- An architecture that *could* scale, with the prototype's shortcuts honestly documented.

**Non-goals (this phase)** — COPPA/GDPR-K compliance infrastructure, verifiable parental consent, payments,
real auth, native mobile apps, cloud sync, content-moderation at commercial scale. Acknowledged, deferred.
The commercial-phase stack (Expo/React Native, Clerk auth, Gemini Live real-time voice, consent-gated
analytics) is captured in `specs/roadmap-v2.md`; the adopt/adapt/skip rationale is in `specs/tech-stack-comparison.md`.

## 3. Capstone concept mapping (graded — keep visible in the submission)

| # | Concept | Where it lives |
|---|---|---|
| 1 | **Multi-agent system (ADK)** | `cosmic-orchestrator` + 5 teacher sub-agents (§4) |
| 2 | **MCP servers** | `safety`, `tts`, `transcripts`, `progress` (§5) |
| 3 | **Agent Skills** | per-teacher pedagogy skills + `child-safety` + `math-verification` (§6) |
| 4 | **Security features** | server-side keys, mandatory safety gate, policy gating, audit (§7, `safety.md`) |

## 4. Agent topology (Google ADK)

```yaml
orchestrator:
  name: cosmic-orchestrator
  model: gemini-2.5-flash-lite   # Option A: routing/classification (cheap, fast, STABLE). Confirm in GCP console.
  responsibilities:
    - classify the child's intent into a subject (or off-topic)
    - enforce topic guardrails + redirect off-subject queries
    - delegate to exactly one teacher sub-agent
    - run EVERY candidate response through the safety MCP gate before it reaches the child
  coordination: ADK shared session state + LLM-driven delegation
sub_agents:
  - { name: professor-pi,  subject: Math & Numbers,      skill: professor-pi,  model: gemini-3.5-flash }
  - { name: ollie-owl,     subject: Reading & Words,     skill: ollie-owl,     model: gemini-3.5-flash }
  - { name: luna-explorer, subject: Science & Space,     skill: luna-explorer, model: gemini-3.5-flash }
  - { name: maestro-arlo,  subject: Art & Creativity,    skill: maestro-arlo,  model: gemini-3.5-flash }
  - { name: coach-kai,     subject: Feelings & Kindness, skill: coach-kai,     model: gemini-3.5-flash }  # safety-critical: STABLE only
```

**Why multi-agent here is justified** (Day-3 test): the teachers are genuine capability boundaries with
different guardrails, different tools (Pi needs math verification, Kai needs the distress classifier), and
different model tiers. This is exactly when multi-agent beats one-agent-with-skills — and it is also the
graded deliverable. Each sub-agent stays narrow so its routing cues are sharp.

## 5. Tools via MCP

| MCP server | Purpose | Mode |
|---|---|---|
| `safety` | Content moderation + distress/harm classifier. **Mandatory gate on every response.** | read-only classify |
| `math-verification` (tool, may be a local script not a server) | Programmatic/symbolic check of Pi's arithmetic before it is spoken | deterministic |
| `tts` | Text-to-speech; returns audio + timing for avatar mouth animation | action |
| `transcripts` | Persist/retrieve per-session conversation history (last 50) | read/write, parent-scoped |
| `progress` | Per-teacher session counts, minutes, timers | read/write, parent-scoped |

Rules: consume existing MCP servers where possible; scope each to least privilege; credentials via the
backend secret store, never the client. The `safety` and `math-verification` checks are **deterministic
gates**, not advisory — wire them into the response pipeline, not the prompt.

## 6. Agent Skills (progressive disclosure)
- `professor-pi`, `ollie-owl`, `luna-explorer`, `maestro-arlo`, `coach-kai` — per-teacher pedagogy
  (how to teach the subject to a 7yo; loaded on demand). See `teachers/*.md`.
- `child-safety` — shared: grade-2 vocabulary, 2–5 sentence cap, content restrictions, topic redirection,
  distress escalation. **Every teacher consults this.** Spec in `safety.md`.
- `math-verification` — programmatic check before any numeric answer is spoken.

## 7. Data flow & the mandatory safety pipeline

```
child speech ──(Web Speech API, Chrome/Edge)──► text
   │
   ▼
React services/ layer ──► BACKEND (ADK on Agent Runtime)        [browser never calls a model provider directly]
   │
   ▼
cosmic-orchestrator: classify intent ─► off-topic? ─► redirect (no model answer)
   │ on-topic
   ▼
delegate to teacher sub-agent ─► draft response
   │  (Professor Pi: math-verification MUST pass first)
   ▼
safety MCP gate (moderation + distress)  ──fail──► safe fallback / escalation (see safety.md)
   │ pass
   ▼
tts MCP ─► audio + mouth-timing ─► React avatar (lip-sync) + transcripts MCP (audit)
```

No response reaches the child without passing the safety gate. No numeric answer reaches the child without
passing math-verification. These are hard invariants asserted in the evalsets (trajectory IN_ORDER).

## 8. Frontend (React)
- Vite + React, multi-file: `components/`, `hooks/`, `services/` (ALL backend calls go through services —
  no fetch scattered in components).
- **State: Zustand** (adopted) for app state; persist selected teacher/settings via localStorage/IndexedDB
  (web equivalent of the Duolingo build's Zustand + AsyncStorage pattern). Replaces the prototype's ad-hoc state.
- Theme: dark cosmic background + animated stars; neon accents (cyan, magenta, violet, lime, amber);
  glowing borders. Fonts: **Orbitron** (display), **Space Grotesk** (body). Generate the design tokens /
  Tailwind utility classes from an uploaded **design-system image** (adopted technique).
- Avatar states with distinct animation: idle (breathing/float/twinkle), listening (mic pulse ring),
  thinking (animated dots), speaking (mouth animation + audio-wave). Lip-sync is timed (~130ms), **not
  phoneme-accurate** — documented limitation.
- **Push-to-talk** (adopted): child holds a big button to speak, releases to send. Clearer turns for a 7-yo,
  cuts echo/latency, AND gives a clean checkpoint so the safety gate runs before the teacher speaks.
- **Live subtitles** (adopted): transcribe the teacher's speech on screen — reinforces reading and adds accessibility.
- Big tappable buttons, suggested question starters per teacher, large readable text, voice-first.
- Custom per-teacher avatar upload with default fallback; persists locally.
- Responsive: desktop, tablet/iPad, mobile.

### 8.1 Dev tooling & workflow (adopted from "practical vibe coding")
- **Feature-by-feature** build (never one-shot) — matches FORGE Render / small-batch discipline.
- **Install official framework skills** (React/Vite patterns) + the **agents-cli** lifecycle skills so the
  agent uses current APIs; paste current official docs into prompts rather than trusting model memory.
- **AI PR review**: **CodeRabbit** *or* **Gemini Code Assist** as the managed reviewer (FORGE Evaluate,
  managed tier) + conditional-LGTM on green CI.
- Voice stays **turn-based** for the capstone (protects the pre-speech safety gate). Real-time streaming
  voice (Gemini Live) is **v2 only** — see `specs/roadmap-v2.md`.
- **No product analytics on the child** this phase (PostHog etc. deferred; conflicts with child-privacy).

## 9. Model routing & cost
- **Option A (all-stable):** `gemini-2.5-flash-lite` for routing/intent + safety pre-screen; `gemini-3.5-flash`
  for all five teachers; `gemini-2.5-flash` for the safety classifier. No preview/latest on any path — Pi's
  math is tool-verified and Kai is safety-critical, so neither needs a preview Pro model.
- Parent selects the provider (Gemini default; Claude/OpenAI/Ollama optional) **server-side**, behind the
  PIN. Child never sees or changes it. Set hard spend limits in each provider console — there is no
  client-side rate limiting.
- **Model IDs pinned above (Option A, all stable).** Still confirm each string + regional availability in
  your GCP console and set `confirmed_on`; re-verify before each release; never use `latest`/`preview`.

## 10. Security & honest limitations (see `safety.md` and AGENTS.md §7)
- **Keys server-side only** in any shared/published build. Client-side localStorage keys + client PIN are
  acceptable ONLY for a local home demo and must be labeled as such in the submission.
- Sandbox ADK tool/code execution; zero ambient authority (scoped, expiring creds per tool).
- Transcripts are the audit trail; parent can review and clear all data; data minimization on child input.
- Known limits to state plainly: Chrome/Edge-only voice; timed (not phoneme) lip-sync; LLM hallucination
  (math verified, general facts not fully verifiable); AI supplements, never replaces, human teaching.

## 11. Tech & versions (PIN before build — defeats stale model defaults)
```yaml
frontend: { framework: react, build: vite, test: jest, node: ">=20" }   # pin exact versions in package.json
backend:  { runtime: python, framework: google-adk, deploy: agent-runtime }  # pin in pyproject.toml
models:                                        # Option A — all STABLE; confirm each in your GCP console
  router:            gemini-2.5-flash-lite      # orchestrator routing/intent
  safety_classifier: gemini-2.5-flash           # STABLE — never latest/preview (used by the safety MCP)
  teachers:          gemini-3.5-flash           # all 5 teachers
  tts:               gemini-3.1-flash-tts-preview
  confirmed_on:      "2026-07-03"
```

## 12. Acceptance criteria (architecture)
- [ ] Browser never calls a model provider directly — all model traffic goes through the ADK backend.
- [ ] Orchestrator routes to exactly one teacher and redirects off-topic input without a model answer.
- [ ] Every response passes the safety gate; every numeric answer passes math-verification (asserted in evals).
- [ ] Four capstone concepts demonstrably present and pointed to in the writeup.
- [ ] Multi-file React + multi-module ADK; no secrets client-side in any shared build.
