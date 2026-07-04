# Spec: Cosmic Minds — MCP tool contracts

> The interface the ADK agents and the React `services/` layer build against. Tool names here MUST match the
> evalsets (`safety.classify`, `math.verify`, `tts.speak`, `transcripts.append`). Consume existing MCP
> servers where one exists; otherwise implement these as thin MCP servers on the backend. All run
> server-side; none are reachable from the browser directly. Schemas use JSON Schema-style notation.

## Conventions
- Transport: stdio for local dev, SSE/HTTP for deployed (per `architecture.md §5`).
- All tools are **least-privilege** and **parent-scoped** for any data access. No tool returns provider keys.
- Errors return `{ "ok": false, "error": { "code": str, "message": str } }`; agents must handle gracefully
  (fail safe, never expose raw errors to the child).

---

## 1. `safety` server (MANDATORY gate — see §5 below)
The single most important contract. Backs the pipeline invariant: every response is classified before TTS.

### `safety.classify`
```jsonc
// input
{ "text": "string",            // the candidate response OR the child's input
  "role": "child_input | model_response",
  "active_teacher": "professor-pi | ollie-owl | luna-explorer | maestro-arlo | coach-kai" }
// output
{ "ok": true,
  "verdict": "allow | block | distress",   // distress overrides everything
  "categories": ["violence","sexual","self_harm","scary","pii","medical","off_topic", "..."],
  "distress": { "is_distress": false, "signals": [], "confidence": 0.0 },
  "pii_found": false }
```
- `block` → caller replaces response with the safe fallback and logs.
- `distress` → caller runs the scripted escalation (`safety.md §4`) + `transcripts.append(flag="distress")`.
- **Implementation (RESOLVED — layered, see `decisions.md §1`):** (1) deterministic **crisis lexicon**
  (`specs/safety-crisis-lexicon.md`) checked FIRST on child input → instant scripted escalation on a hit;
  (2) **Gemini custom-policy classifier** (`gemini-2.5-flash`, STABLE) on BOTH child input and model output,
  returning the `{verdict, categories, distress, pii_found}` above; (3) **Gemini built-in safety settings**
  underneath as a backstop. Runs on BOTH child input and model output. **Distress recall is the gating
  metric** — tune toward over-triggering; validate against `evalsets/coach-kai.evalset.json` with human review.

---

## 2. `math-verification` (tool / local script — deterministic)
### `math.verify`
```jsonc
// input
{ "expr": "string",            // e.g. "3+4", "5*5"
  "claimed_value": 7 }          // optional: the model's proposed answer to check
// output
{ "ok": true,
  "value": 7,                   // authoritative computed result
  "matches_claim": true,
  "in_scope": true }            // false if beyond curriculum (division, fractions, >5x5, negatives)
```
- The verifier's `value` is authoritative. `in_scope=false` → agent redirects instead of answering.
- Implement with a safe expression evaluator / symbolic library — never `eval()` untrusted strings.

---

## 3. `tts` server (voice out + lip-sync timing)
### `tts.speak`
```jsonc
// input
{ "text": "string",
  "voice": "string",            // warm child-friendly voice id (parent-configurable)
  "teacher": "professor-pi | ..." }
// output
{ "ok": true,
  "audio_url": "string",        // or base64 audio
  "duration_ms": 4200,
  "mouth_timings": [ { "t_ms": 0, "open": 0.2 }, { "t_ms": 130, "open": 0.8 } ] }  // timed, ~130ms; not phoneme-accurate
```
- `mouth_timings` drives the avatar lip-sync (documented as timed, not viseme-accurate).

---

## 4. `transcripts` server (audit trail — parent-scoped)
### `transcripts.append`
```jsonc
// input
{ "session_id": "string", "teacher": "string",
  "role": "child | teacher | system",
  "text": "string",
  "flag": "none | distress | self_harm | review",   // optional
  "resource": "988" }                                // optional, set with distress/self_harm
// output
{ "ok": true, "entry_id": "string" }
```
### `transcripts.list`
```jsonc
// input  { "parent_pin_ok": true, "limit": 50 }
// output { "ok": true, "sessions": [ { "session_id": "...", "date": "...", "duration_min": 12, "teacher": "...", "flags": ["distress"] } ] }
```
### `transcripts.clear`  → `{ "parent_pin_ok": true }` → `{ "ok": true, "cleared": 37 }`
- Retain last 50 sessions. Never store child PII in `text` (mask before append). List/clear require parent auth.

---

## 5. `progress` server (session metrics — parent-scoped)
### `progress.start_session` → `{ "teacher": "..." }` → `{ "ok": true, "session_id": "...", "started_at": "..." }`
### `progress.end_session` → `{ "session_id": "..." }` → `{ "ok": true, "duration_min": 12 }`
### `progress.summary`
```jsonc
// input  { "parent_pin_ok": true }
// output { "ok": true, "per_teacher": { "professor-pi": { "sessions": 8, "minutes": 96 }, "...": {} }, "total_minutes": 240 }
```

---

## Pipeline invariant (restated for implementers)
For every child turn the orchestrator MUST call, in this order:
`safety.classify(child_input)` → delegate → (`math.verify` if numeric) → `safety.classify(model_response)` →
on allow: `tts.speak` + `transcripts.append`. The evalsets assert this `IN_ORDER`. A response that reaches
`tts.speak` without an `allow` verdict is a test failure.

## Acceptance criteria
- [ ] Tool names/signatures match the evalsets exactly.
- [ ] `safety.classify` runs on both child input and model output; distress path wired to transcripts + 988.
- [ ] `math.verify` is authoritative and never uses unsafe eval.
- [ ] `transcripts`/`progress` reads/clears require parent auth; child PII masked before storage.
- [ ] No tool exposes provider API keys to the client.
