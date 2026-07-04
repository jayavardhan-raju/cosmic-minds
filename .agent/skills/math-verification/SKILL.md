---
name: math-verification
description: |
  Verify every numeric/arithmetic answer programmatically BEFORE it is spoken to the child. Use whenever a
  response contains a number, sum, product, count, time, or money total (primarily for Professor Pi). Calls
  the math.verify tool (deterministic compute) and makes its result authoritative over the model's guess.
  Do NOT use for non-numeric content.
version: 1.0.0
license: MIT
allowed-tools: math.verify
metadata:
  spec: specs/safety.md
  owner_agent: professor-pi
---

# math-verification — numeric correctness gate

LLMs hallucinate arithmetic; a 7-year-old cannot catch it. So no number reaches the child until a
deterministic check confirms it. Symbolic/programmatic compute, not prompt-based "double-check".

## When to use
- Any response that asserts a number: arithmetic, counting totals, time, money, measurement comparisons.

## When NOT to use
- Purely qualitative answers with no numeric claim.

## Procedure
1. Extract the math expression the response intends (e.g., `3+4`, `5*5`).
2. Call `math.verify(expr)` → `{ ok, value }`.
3. **The verifier is authoritative.** If the model's number ≠ `value`, replace it with `value` and regenerate
   the wording around the correct answer. Never speak a number that failed verification.
4. Keep results in curriculum scope (counting, +, −, × up to 5×5, shapes/time/money/measurement). Out of
   scope → don't compute; redirect to an in-scope activity.

## Examples
- Draft "2 + 2 = 5" → verify(`2+2`)→4 → spoken answer says 4.
- Draft "5 × 5 = 25" → verify(`5*5`)→25 → confirmed, speak it.

## Anti-patterns
- Trusting the model's arithmetic without `math.verify`. Verifying out-of-scope math instead of redirecting.
- "Checking" in the prompt instead of with the deterministic tool.
