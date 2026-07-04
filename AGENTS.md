# AGENTS.md — Cosmic Minds

> Project DNA for AI coding agents (Antigravity / Gemini CLI / Claude Code). Always loaded — kept tight.
> This file describes the **capstone-aligned target architecture**, not the original single-file prototype.
> If a request conflicts with a SAFETY rule below, STOP and ask — never trade child safety for velocity.
> Built with the FORGE lifecycle (see the `forge` / `forge-sf-adk` skills): Frame → Orchestrate → Render →
> Guard → Evaluate.

## 1. What this is
Cosmic Minds is a space-themed AI tutoring web app for a young child (~7yo), built as the submission for
the **Kaggle "AI Agents: Intensive Vibe Coding" Capstone — Freestyle Track** (deadline 2026-07-06). Five
subject "teachers" tutor the child via voice and animated avatars. **Primary user is a minor**, so child
safety is the top constraint, above features and aesthetics.

## 2. Capstone requirement — demonstrate ≥3 course concepts (this is graded)
The original prototype (single-file React, direct browser→LLM calls, localStorage keys) does **not**
demonstrate the required concepts. This architecture does. We satisfy **four**:

1. **Multi-agent system (ADK)** — an Orchestrator agent routes the child's question to one of five
   subject sub-agents (the teachers). Natural fit: each teacher = one specialist ADK sub-agent.
2. **MCP servers** — tools exposed over MCP: `transcripts` (session storage), `tts` (text-to-speech),
   `safety` (content-moderation / distress classifier), `progress` (per-teacher session metrics).
3. **Agent Skills** — one teaching skill per subject (procedural pedagogy, loaded on demand) plus a shared
   `child-safety` skill and a `math-verification` skill.
4. **Security features** — server-side API keys, the safety/escalation pipeline, policy gating, and
   transcript audit (see §7).

> Acknowledge in the submission writeup which concepts are demonstrated and where in the code.

## 3. Tech stack
- **Frontend:** React (Vite) web app — space/futuristic theme, Orbitron (display) + Space Grotesk (body).
  Voice in via Web Speech Recognition (Chrome/Edge only — documented limitation); voice out via TTS synced
  to avatar mouth animation (timed, ~130ms — not phoneme-accurate, documented).
- **Backend (NEW — required for the capstone & for security):** Python + **Google ADK** multi-agent system,
  deployed to **Agent Runtime / Agent Engine**. The browser talks ONLY to this backend, never directly to
  model providers.
- **Model backends:** Gemini (default for ADK), with optional Claude / OpenAI / Ollama routing controlled
  server-side by the parent. Keys live on the server, never in the browser.
- **Storage:** transcripts/settings via the `transcripts`/`progress` MCP services (prototype may keep
  localStorage for the demo, but keys and child data must not live client-side in any published build).

## 4. Agent topology (ADK)
- **Orchestrator (`cosmic-orchestrator`)** — classifies intent, enforces topic guardrails, delegates to the
  right teacher sub-agent, and runs every response through the `safety` check before it reaches the child.
- **Subject sub-agents (one each):** `professor-pi` (Math), `ollie-owl` (Reading), `luna-explorer`
  (Science/Space), `maestro-arlo` (Art), `coach-kai` (Feelings/SEL). Each loads its own teaching skill.
- Coordinate via ADK shared session state / LLM-driven delegation. Use one-agent-with-skills only if the
  eval shows routing is more reliable that way — but the multi-agent split is also the capstone deliverable,
  so keep the orchestrator + sub-agents.

## 5. Hard SAFETY rules (NON-NEGOTIABLE — the user is a child)
- **Vocabulary:** grade-2 level across all teachers. Responses **2–5 sentences max**. Warm, encouraging tone.
- **No personal information** is ever requested from or stored about the child (no name-collection prompts,
  no location, no contact info). The child never sees or enters API keys, models, or settings.
- **Content restrictions:** no violence, scary/adult themes, medical/diagnostic advice, or real people's
  faces in generated art. Redirect gently when the child goes off-subject.
- **Distress escalation (Coach Kai):** on any sign of distress, harm, or danger, do NOT counsel — output a
  calm, scripted message telling the child to talk to a trusted grown-up, and surface the US 988 resource to
  the parent/UI. Coach Kai is explicitly **not a therapist**; this rule is enforced in the `safety` MCP +
  `child-safety` skill, not left to the model.
- **Math accuracy:** Professor Pi's arithmetic must pass the `math-verification` tool (symbolic/programmatic
  check) before the answer is spoken. Never present an unverified numeric answer to the child as fact.
- **Every model output passes the `safety` moderation check before display.** No exceptions, no "fast path".
- **Parent-supervision messaging** ("a grown-up should be nearby") and configurable session-break reminders
  (default 20 min) stay enabled.

## 6. Engineering conventions
- **Architecture:** the submitted build is multi-file. React: components / hooks / a `services/` layer for
  all backend calls (no fetch calls scattered in components). ADK: one module per agent, tools as small
  well-described functions, skills in `.agent/skills/`.
- **Specs are source of truth** — read `specs/` before building (see `specs/architecture.md`,
  `specs/teachers/*.md` for each teacher's system prompt + guardrails, `specs/safety.md`).
- Reproduce every bug with a failing test (Jest for React, ADK eval case for agents) before fixing it.
- Surgical changes only; show diffs for multi-file edits; renames are a separate task; no YOLO scaffolding —
  propose structure first.
- No hardcoded secrets, keys, URLs, or model names in code or prompts.

## 7. Security (FORGE Guard — 7-pillar, applied)
- **Keys server-side only.** Move all provider keys off the client into the backend / a secret manager.
  Client-side localStorage keys are acceptable ONLY for a local home demo, never for a published build —
  state this explicitly in the writeup.
- **Parent gate:** the client PIN is UX, not security (documented). Any real multi-family build needs real
  auth before launch.
- **Policy server / gating:** the orchestrator routes tool calls through structural + semantic gates
  (`assets/policies.yaml` style). The `safety` classifier is a mandatory gate, not advisory.
- **Sandboxing:** run ADK tool/code execution in an isolated, low-privilege sandbox; zero ambient authority
  (scoped, expiring credentials per tool).
- **Audit:** transcripts are the audit trail (last 50 retained); parent can review and clear all data.
- **Data minimization:** nothing about the child leaves the system except the minimal text needed for the
  model call; mask anything PII-shaped in context.

## 8. Antigravity / build workflow
- Use Antigravity's built-in **sandboxed browser** for E2E: load the app on localhost, exercise each
  teacher's voice→answer→TTS flow, and verify avatar animation states (idle/listening/thinking/speaking).
- Enable **Terminal Sandboxing** in Antigravity (or a sandbox Dockerfile) for any code the agent runs.
- Project artifacts Antigravity/ADK expect: this `AGENTS.md`, `GEMINI.md` (Google-specific settings),
  `specs/`, `.agent/skills/<teacher>/SKILL.md`, the ADK agent modules, and an `evalset/` per agent.
- Pin every library version in specs and `package.json` / `pyproject.toml` (defeats stale model defaults).

## 9. Commands
- Frontend: `npm install` · `npm run dev` · `npm run build` · `npm test` (Jest) · `npm run lint`
- ADK backend: `agents-cli create | playground | eval | deploy` (after `uvx google-agents-cli setup`)
- Always run the per-agent **evalset** and the React tests green before declaring a phase done.

## 10. Honest limitations to state in the submission (do NOT hide these)
- Voice input is Chrome/Edge only (Web Speech API). Lip-sync is timed, not phoneme-accurate.
- LLMs hallucinate; smaller/local models (Ollama) drift more — math is verified, general facts are not
  fully verifiable. AI supplements, never replaces, human teaching.
- Home-demo build ≠ commercial product: COPPA/GDPR-K, verifiable parental consent, content classifiers at
  scale, real auth, payments, and legal review are required before any multi-family launch (deferred phase).

## 11. Skills catalog (router)
- `forge` / `forge-sf-adk` — agentic-engineering lifecycle for any build/feature/hardening/eval work.
- `.agent/skills/professor-pi`, `ollie-owl`, `luna-explorer`, `maestro-arlo`, `coach-kai` — per-teacher pedagogy.
- `.agent/skills/child-safety` — vocabulary caps, content rules, distress escalation (always consult for any teacher).
- `.agent/skills/math-verification` — programmatic check before any numeric answer is spoken.
