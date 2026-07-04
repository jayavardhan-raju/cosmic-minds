# Cosmic Minds — Build Handoff Runbook (Antigravity + agents-cli × FORGE gates)

> The ordered procedure to take these specs to a working, submitted capstone. Each stage maps to a FORGE
> phase gate; **do not advance a stage until its gate is green.** Greenfield rebuild; GCP/Agent Runtime
> provisioned; models = Option A (all stable); safety = layered lexicon + classifier. Deadline: **2026-07-06**.
>
> Golden rule for this project: **build and prove the safety pipeline before the teachers go live.** Safety
> is not a final-polish step.

---

## Stage 0 — Preflight (before Antigravity writes any code)  ·  gate: FORGE **F**

- [ ] `specs/decisions.md`: both decisions show `[x]`. Open GCP console, confirm the four Option-A model
      strings resolve in your project + region, set `confirmed_on` in `architecture.md §11`.
- [ ] GCP project ready: Agent Runtime/Engine access; provider keys in a **secret manager** (not the client).
- [ ] Install Antigravity; **enable Terminal Sandboxing** (User Settings or `.gemini/sandbox.Dockerfile`).
- [ ] `uvx google-agents-cli setup` → installs the 7 lifecycle skills (scaffold/ADK/eval/deploy/publish/observe).
- [ ] Repo root has `AGENTS.md`, `GEMINI.md`, `.agent/skills/` (7 skills), `policies.yaml`, full `specs/`.
- [ ] Localize `988` in `safety.md`/`safety-crisis-lexicon.md` if not US.

**F gate:** specs reviewed by a human (`architecture`, `safety`, `safety-crisis-lexicon`, `teachers/*`,
`mcp-contracts`, `evalsets/*`); acceptance criteria + evalsets exist. → proceed.

---

## Stage 1 — Harness setup  ·  gate: FORGE **O**

- [ ] Open the repo in Antigravity; confirm it loads `AGENTS.md`, `GEMINI.md`, and the `.agent/skills/`.
- [ ] Install official **framework skills** (React/Vite patterns) alongside the agents-cli skills.
- [ ] Scaffold **frontend**: Vite + React, multi-file (`components/`, `hooks/`, `services/`), Tailwind,
      **Zustand**. Generate design tokens from the cosmic design-system image (`architecture §8`).
- [ ] Scaffold **backend**: `agents-cli create` → ADK project for `cosmic-orchestrator` + 5 teacher sub-agents
      (`architecture §4`).
- [ ] Create **MCP servers as stubs** first, matching `mcp-contracts.md` signatures exactly
      (`safety.classify`, `math.verify`, `tts.speak`, `transcripts.*`, `progress.*`).

**O gate:** agent has its rules, the framework/lifecycle skills, and stubbed tools; credentials server-side;
no production data in the dev harness. → proceed.

---

## Stage 2 — Build, feature-by-feature  ·  gate: FORGE **R** (per feature)

Build in this dependency order. **The first vertical slice is the safety pipeline + one teacher** — prove
the gate end-to-end before replicating.

1. App shell + navigation + design system (onboarding, teacher picker).
2. **Safety pipeline (BUILD FIRST):** crisis lexicon (`safety-crisis-lexicon.md`) → `safety.classify`
   (Gemini `gemini-2.5-flash`) → escalation path + `transcripts.append(flag,988)`. Wire `math.verify`.
3. **Orchestrator routing** (`orchestrator.evalset.json` is its contract).
4. **One teacher end-to-end (vertical slice):** Professor Pi — routing → skill → `math.verify` → safety gate
   → response. Prove the `IN_ORDER` pipeline works on a real turn.
5. **Replicate remaining teachers:** Ollie, Luna, Arlo, then **Coach Kai** (highest-scrutiny; do last, review hardest).
6. **Voice:** push-to-talk UI → STT → backend → TTS (`tts.speak`) → **live subtitles**; avatar states + lip-sync.
7. **Parent dashboard:** model/keys/transcripts/settings (PIN); `progress` + `transcripts` reads (parent-scoped).

**Per-feature inner loop (repeat for each):**
`spec → write the failing test/eval first → implement in a small batch → review the diff → CodeRabbit /
Gemini Code Assist on the PR → run the feature's eval/tests`.

**R gate (per feature):** its BDD scenarios pass; diffs small and reviewed; bug fixes have a committed
failing-test-first; no unrelated changes. → next feature.

---

## Stage 3 — Guard  ·  gate: FORGE **G**

- [ ] All ADK tool/code execution runs in the sandbox; zero ambient authority (scoped, expiring creds).
- [ ] Provider keys server-side only; `policies.yaml` structural + semantic gating in the tool pipeline.
- [ ] Crisis lexicon + `safety.classify` fire on **every** child input and model response (no fast path).
- [ ] Irreversible/parent actions (settings.write, transcripts.clear) gated by human approval.
- [ ] Context hygiene: no child PII echoed or stored; secret scan clean in CI.

**G gate:** no secrets; scoped; sandboxed; safety gate + lexicon live on every turn; irreversible actions gated.

---

## Stage 4 — Evaluate  ·  gate: FORGE **E** (ship gate)

- [ ] `agents-cli eval` against every set in `specs/evalsets/`. Trajectory **IN_ORDER** on safety-critical
      paths (safety gate before TTS; math.verify before any number).
- [ ] **Coach Kai distress cases: 100% escalation, sustained across repeated runs (`pass^k`), + human review.**
      This is the release blocker, not a warning.
- [ ] Orchestrator routing ≥ ~90%; off-topic redirects without a wrong-teacher answer; PII never stored.
- [ ] **Antigravity built-in browser** E2E: each teacher's voice→answer→TTS flow + avatar states + parent dashboard.
- [ ] CodeRabbit/Gemini Code Assist clean on the final PRs; conditional-LGTM on green CI.

**E gate:** eval suite passes with explicit rubrics; safety recall validated with a human in the loop. → ship.

---

## Stage 5 — Deploy & submit

- [ ] `agents-cli deploy` → Agent Runtime; wire observability (OpenTelemetry traces + cost metering).
- [ ] Set hard spend limits per provider (no client-side rate limiting exists).
- [ ] **Capstone writeup:** point to where each of the 4 graded concepts lives (multi-agent §4, MCP §5,
      skills §6, security §7) and state the honest limitations (`architecture §10`): Chrome/Edge voice,
      timed lip-sync, hallucination (math verified / facts not), home-demo ≠ commercial.
- [ ] Submit before **2026-07-06 23:59 PT**.

---

## Minimum critical path if time is tight (protect the grade + the child)
1. App shell + one teacher (Professor Pi) end-to-end, **with the full safety pipeline + lexicon**.
2. Orchestrator routing across ≥3 teachers (demonstrates multi-agent).
3. At least the `safety` + one more MCP server real (demonstrates MCP); skills already present.
4. Coach Kai + distress escalation validated (non-negotiable, even in a minimal build).
5. Eval green on the above; deploy; writeup mapping the 4 concepts.
Voice polish, all 5 teachers, custom avatars, and the full dashboard are the first things to trim — **never**
trim the safety pipeline or Coach Kai's escalation.

## FORGE gate ↔ stage map
F = Stage 0 · O = Stage 1 · R = Stage 2 (per feature) · G = Stage 3 · E = Stage 4 · (deploy/submit = Stage 5).
Re-enter any phase as the loop iterates; the gates are the invariants.
