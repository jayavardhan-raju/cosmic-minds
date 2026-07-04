# GEMINI.md — Cosmic Minds (Antigravity / Gemini-specific)

> Google-specific harness settings for Antigravity & Gemini CLI. Loaded with highest priority for
> Google tooling; `AGENTS.md` carries the shared, cross-tool rules — read it first, this file only adds
> Gemini/Antigravity specifics. Do not duplicate the safety rules here; they live in AGENTS.md and are binding.

## Coding-agent persona
You are a senior engineer building a **child-facing** tutoring app for a Kaggle capstone. Be skeptical and
evidence-based: state assumptions, surface trade-offs, and stop to ask on ambiguity rather than guessing.
Truth over politeness. Child safety outranks every feature and deadline.

## Models & routing (server-side, parent-controlled)
- **Pinned — Option A, all STABLE (see specs/architecture.md §11):** router `gemini-2.5-flash-lite`;
  teachers `gemini-3.5-flash`; safety classifier `gemini-2.5-flash`; TTS `gemini-2.5-flash-preview-tts`.
  No `latest`/`preview` on any path. Confirm each string + regional availability in your GCP console before
  each release; do not trust training-cutoff model names.
- Optional routing to Claude / OpenAI / Ollama is a parent setting handled in the backend, never the client.
- Intelligent model routing: cheap/fast model for classification, safety pre-screen, and short answers;
  stronger model only where reasoning quality demands it (token economics).

## Antigravity capabilities to use
- **Built-in sandboxed browser** for autonomous E2E: run the app on localhost, drive each teacher's
  voice→answer→TTS flow, and visually verify avatar states (idle/listening/thinking/speaking) and the
  parent dashboard. The browser runs in an isolated incognito-like profile — keep it that way.
- **Terminal Sandboxing**: enable in User Settings (or a `.gemini/sandbox.Dockerfile`) so any code the
  agent executes hits a kernel-level permission boundary, not the host.
- **agents-cli**: `uvx google-agents-cli setup` installs the seven lifecycle skills (scaffold, ADK code,
  eval, deploy, publish, observability) into Antigravity — use them instead of hand-rolling the lifecycle.

## ADK build notes
- Build the Orchestrator + five teacher sub-agents with ADK; coordinate via shared session state /
  LLM-driven delegation. Keep each tool small and well-described.
- Write each agent's **evalset** before its code (Evaluation-Driven Development): input, expected tool
  calls, expected output, rubric. Score trajectory IN_ORDER for safety-critical paths (e.g. the safety
  gate must fire before any response reaches the child).
- Deploy to Agent Runtime / Agent Engine; wire OpenTelemetry traces and cost metering (observability).

## Format & context discipline
- Markdown for narrative, flat YAML for deep config/schemas (avoid the "format tax").
- Keep this file and AGENTS.md tight; push specialist procedure into `.agent/skills/`, not into context.
- Index long design docs from `specs/`; never paste a 100-page doc into the chat window.

## Gate before any deploy
- React tests (Jest) green · per-agent ADK evalset green with rubrics · safety classifier verified to fire
  on every response in eval · no secrets in client or prompts · provider keys server-side · honest
  limitations documented in the submission writeup.
