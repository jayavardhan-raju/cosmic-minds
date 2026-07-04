# Cosmic Minds — Antigravity Kickoff Playbook (steps + copy-paste prompts)

> Work top to bottom. Each prompt assumes Antigravity has the repo open so it can read `AGENTS.md`,
> `GEMINI.md`, `.agent/skills/`, and `specs/`. Follow the sequence in `specs/build-handoff.md` (FORGE gates).
> **Discipline baked into every prompt:** propose-before-scaffold, write the failing test/eval FIRST, small
> reviewable batches, show diffs/trajectories. Review every diff yourself — especially safety code.

## Reusable guardrail (paste at the end of any build prompt)
> "Do not write code until you've shown me the plan and I approve. Keep changes to the smallest batch that
> satisfies this step. Don't edit tests and implementation in the same change. Use the model IDs pinned in
> `specs/architecture.md §11` — never guess or use `latest`/`preview`. Show me the diff and the eval/test
> results before moving on."

---

## Stage 0 — Preflight (manual, no prompts)
1. Install Antigravity; **enable Terminal Sandboxing** (User Settings).
2. `uvx google-agents-cli setup`  (installs the 7 lifecycle skills).
3. Confirm the 4 model strings from `architecture.md §11` in your GCP console; set `confirmed_on`.
4. Put provider keys in your secret manager (not the client). Open the repo in Antigravity.

---

## Step 1 — Orient the agent + verify harness (no code)
```
Read AGENTS.md, GEMINI.md, every file under specs/, and .agent/skills/. Then summarize back to me:
(1) the architecture and agent topology, (2) the mandatory safety pipeline and its order, (3) the pinned
model IDs, and (4) the build order in specs/build-handoff.md. Do NOT write any code. List anything
ambiguous, missing, or contradictory before we start.
```

## Step 2 — Scaffold the frontend (propose first)
```
Following specs/architecture.md §8 and §11, PROPOSE (don't build yet) the Vite + React + Tailwind + Zustand
frontend: folder layout (components/, hooks/, services/ — all backend calls go through services), exact
package versions to pin, and how you'll generate design tokens from the cosmic design-system image
(Orbitron/Space Grotesk, neon on dark). Wait for my approval.
```
Then, after review:
```
Approved. Scaffold it in small reviewable commits. Show me the diff. No feature logic yet — just the shell,
theme, and design tokens.
```

## Step 3 — Scaffold the ADK backend (propose first)
```
Using the agents-cli skills, PROPOSE the ADK project layout for cosmic-orchestrator + 5 teacher sub-agents
per specs/architecture.md §4. Each sub-agent must load its skill from .agent/skills/. Show me the plan and
the files you'll create; no code until I confirm.
```

## Step 4 — MCP servers as stubs (match the contract exactly)
```
Create stub MCP servers that match specs/mcp-contracts.md EXACTLY — same tool names and signatures:
safety.classify, math.verify, tts.speak, transcripts.append/list/clear, progress.*. Stubs return
well-typed mock data, no real logic yet. Show me the interface files so I can confirm they match the contract.
```

## Step 5 — Safety pipeline FIRST (build before any teacher)
```
Before building any teacher, implement the safety pipeline per specs/safety.md, specs/safety-crisis-lexicon.md,
and specs/mcp-contracts.md §1. Implement all three layers:
(1) deterministic crisis-lexicon matcher from safety-crisis-lexicon.md (normalize input, word-boundary match,
    negation is NOT a safe exit, over-trigger by design);
(2) safety.classify calling gemini-2.5-flash with the child-safety policy, run on BOTH child input and model output;
(3) the scripted escalation from safety.md §4 (verbatim, no model-generated advice) + transcripts.append(flag, resource="988").
Write the distress eval cases from specs/evalsets/coach-kai.evalset.json FIRST, then implement until they pass.
The safety gate MUST run before any response is emitted. Show me the trajectory for a distress input.
```

## Step 6 — Orchestrator routing
```
Implement cosmic-orchestrator per specs/architecture.md §4 with specs/evalsets/orchestrator.evalset.json as
the contract — write those eval cases first, then implement. It must: route to exactly one teacher, redirect
off-topic input WITHOUT a wrong-teacher answer, run math.verify before any numeric answer, and run the safety
gate before TTS (trajectory IN_ORDER). Run the evalset and show results.
```

## Step 7 — First teacher end-to-end (vertical slice: Professor Pi)
```
Build Professor Pi end-to-end per specs/teachers/professor-pi.md and .agent/skills/professor-pi. Write the
cases in specs/evalsets/professor-pi.evalset.json FIRST. Enforce: math.verify runs and passes before any
number is spoken; safety gate before TTS; 2–5 grade-2 sentences. Prove the full pipeline on "what is 3 + 4?"
and self-correction on "is 2+2=5?". Show the trajectory and eval results.
```

## Step 8 — Replicate the next three teachers (one at a time)
```
Now implement Ollie, then Luna, then Arlo — one at a time — each with its evalset written first
(specs/evalsets/<teacher>.evalset.json). Keep Coach Kai for last. After each teacher, run its evalset AND the
orchestrator evalset as a regression check. Report any drop before continuing.
```

## Step 9 — Coach Kai (SAFETY-CRITICAL — highest scrutiny)
```
Implement Coach Kai per specs/teachers/coach-kai.md. Distress / self-harm / abuse inputs must trigger the
scripted escalation from safety.md §4 VERBATIM (no counseling, probing, or advice), fire
transcripts.append(flag=distress, resource="988"), and stop the lesson. Everyday feelings get one healthy
coping idea only. Write specs/evalsets/coach-kai.evalset.json first. Require 100% escalation across repeated
runs. Show me EVERY distress-case trajectory for my manual review before you consider this done.
```

## Step 10 — Voice + subtitles + avatars
```
Add voice per specs/architecture.md §8: PUSH-TO-TALK (hold button → Web Speech STT → backend → tts.speak →
live subtitles). Keep it turn-based so the safety gate runs before the teacher speaks. Add avatar states
(idle / listening / thinking / speaking) with timed lip-sync (~130ms; document it's not phoneme-accurate).
Big tappable buttons, suggested starters per teacher.
```

## Step 11 — Parent dashboard
```
Build the parent dashboard (PIN-gated, child never sees it) per the requirements: model selector, API keys
(server-side), transcripts review, settings (child name, PIN, voice on/off, clear all data), and session
metrics via the progress MCP. Enforce the child/parent tool split from policies.yaml.
```

## Step 12 — Guard pass
```
Do a security pass per specs/architecture.md §7 and policies.yaml: provider keys server-side only; sandbox
all tool/code execution; zero ambient authority (scoped, expiring creds); context hygiene (no child PII
echoed or stored); structural + semantic tool gating; secret scan in CI. Report findings, then fix.
```

## Step 13 — Evaluate (ship gate)
```
Run agents-cli eval across ALL specs/evalsets/. Enforce IN_ORDER trajectory on safety paths. Report:
orchestrator routing accuracy (target ≥90%), Coach Kai distress pass rate (must be 100%), and any
regressions. Then use the built-in browser to run E2E on each teacher's voice→answer→TTS flow and the
parent dashboard. Summarize pass/fail per evalset.
```

## Step 14 — Deploy + capstone writeup
```
Deploy the ADK backend via agents-cli deploy to Agent Runtime with observability (OpenTelemetry traces +
cost metering). Then draft the capstone submission writeup mapping the four graded concepts to code:
multi-agent (architecture §4), MCP servers (§5), agent skills (§6), security (§7). Include the honest
limitations from architecture §10.
```

---

## Human checkpoints you must not delegate
- **Step 5 & 9:** read the safety/escalation code and the distress trajectories yourself. Eval-green ≠ safe.
- **Model IDs:** confirm in your GCP console (Step 0); don't accept an agent's guessed string.
- **Every shipping diff:** review it; run CodeRabbit / Gemini Code Assist on the PR; conditional-LGTM on green CI.
- **Crisis lexicon:** get a safeguarding review; localize `988` if not US.

## If time runs short (protect grade + child)
Do Steps 1–7 + 9 + 13 minimally: shell + safety pipeline + orchestrator + Professor Pi + Coach Kai +
eval + deploy. Trim voice polish, extra teachers, custom avatars, full dashboard — **never** the safety
pipeline or Coach Kai's escalation.
```
```
