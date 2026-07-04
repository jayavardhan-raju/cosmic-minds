# Cosmic Minds — Crisis Lexicon (deterministic first gate)

> The phrase list the **first** safety layer matches on (see `mcp-contracts.md §1`, `safety.md §4`,
> `decisions.md §1`). Runs on the **child's input** before any LLM. A match triggers the scripted escalation
> immediately — the lexicon can never be "argued out of it." This is a **recall floor**, not the whole
> system: the Gemini custom-policy classifier (layer 2) catches paraphrases the lexicon misses.
>
> **STARTER — must be reviewed and expanded, ideally with child-safeguarding expertise.** It is not
> clinically validated. Tune toward **over-triggering**: a false "tell a grown-up" is acceptable; a missed
> crisis is not.

## How it is used
1. Normalize the child's transcript: lowercase, strip punctuation, collapse whitespace, expand common
   contractions. (Web Speech transcripts are messy — allow minor misspellings/stems.)
2. Match phrases as **word-boundary substrings / stems** (so "hits" matches "he hits me", "hitting").
3. On a hit → set the mapped `action` and run the escalation defined in `safety.md §4` (scripted copy +
   `transcripts.append(flag=..., resource="988")` + parent notification). Do **not** send the text to a
   teacher LLM for a normal answer.
4. If no lexicon hit, proceed to layer 2 (Gemini classifier) — which still independently classifies distress.

## Matching rules & cautions
- **Negation is NOT a safe exit.** "I don't want to die" still routes to escalation review — a 7-year-old's
  phrasing is unreliable, so err toward escalation and let the human decide.
- **Over-trigger by design.** The escalation is gentle ("tell a grown-up you trust"), so a false positive
  causes no harm; a false negative can.
- Keep the list **localized** — add your child's home language(s) and regional crisis resources (988 is US).
- Review matches in `transcripts` regularly; move newly-observed real phrasings into the list.

## The lexicon

```yaml
# action values map to safety.md flags / escalation:
#   distress   -> full scripted escalation + parent alert + 988 resource, lesson stops
#   review     -> gentle redirect to a grown-up + parent 'review' flag (softer signal)
version: 0.1-starter

self_harm:               # -> distress (highest priority)
  action: distress
  flag: self_harm
  phrases:
    - "kill myself"
    - "want to die"
    - "don't want to be alive"
    - "don't want to live"
    - "hurt myself"
    - "cut myself"
    - "wish i wasn't here"
    - "wish i was dead"
    - "nobody would miss me"
    - "end it"

abuse_physical:          # -> distress
  action: distress
  flag: distress
  phrases:
    - "hits me"
    - "hit me"
    - "hitting me"
    - "beats me"
    - "punches me"
    - "kicks me"
    - "hurts me"
    - "hurt me"
    - "grabs me"
    - "leaves marks"
    - "gave me a bruise"

abuse_sexual:            # -> distress (critical; sober detection only)
  action: distress
  flag: distress
  phrases:
    - "touches my private"
    - "touched my private"
    - "touches me where"
    - "made me touch"
    - "took my clothes off"
    - "told me not to tell"
    - "our secret"        # pair with adult-context; layer 2 disambiguates benign uses
    - "don't tell mom or dad"

neglect_unsafe_home:     # -> distress or review depending on severity
  action: distress
  flag: distress
  phrases:
    - "no food at home"
    - "haven't eaten"
    - "always hungry"
    - "left alone"
    - "nobody's home"
    - "scared to go home"
    - "sleep outside"
    - "nobody takes care of me"

harm_to_others:          # -> distress
  action: distress
  flag: distress
  phrases:
    - "want to hurt"
    - "going to hurt"
    - "kill him"
    - "kill her"
    - "hurt everyone"

fear_danger:             # -> distress
  action: distress
  flag: distress
  phrases:
    - "scared of my"
    - "afraid of my"
    - "someone is hurting"
    - "he hurts"
    - "she hurts"
    - "i'm not safe"
    - "help me"

bullying:                # -> review (softer)
  action: review
  flag: review
  phrases:
    - "kids are mean to me"
    - "they hit me at school"
    - "everyone hates me"
    - "no one likes me"
    - "they make fun of me"

severe_distress:         # -> review (escalate if repeated/combined)
  action: review
  flag: review
  phrases:
    - "i hate myself"
    - "i'm so sad"
    - "i can't stop crying"
    - "everything is my fault"
    - "i'm scared all the time"
```

## Tuning & validation (before trusting it)
- Run `evalsets/coach-kai.evalset.json` distress cases: **require 100% escalation**, sustained across
  repeated runs (`pass^k`), plus **human review** of a sample. The lexicon + classifier together must clear
  this; neither alone is the gate.
- Measure recall on paraphrased variants (the classifier's job) — lexicon-only recall will always miss some.
- Localize resources: 988 is US-only. Add the correct crisis line for the family's country.
- **Not a substitute for a caregiver.** The escalation always points the child to a trusted grown-up.

## Ownership & review
- Owner: the person responsible for child safety on the project (you, for the home build).
- Review cadence: on every new real phrasing seen in transcripts, and before any release.
- Get a qualified child-safeguarding reviewer to vet this list before any non-family use.
