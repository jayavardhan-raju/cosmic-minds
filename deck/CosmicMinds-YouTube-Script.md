# Cosmic Minds — YouTube Walkthrough Script

**Runtime:** ~9 minutes · **Pace:** relaxed, conversational · **Pause at every slide change.**
The slides carry the numbers and structure — your voice carries the story and the "why". Never read the
slide text aloud. Numbers spelled out for speaking.

---

## SLIDE 1 — Title (0:00–0:50)

Hi everyone, I'm Jayavardhan Raju — I go by Jay. I'm a Salesforce Application Architect with over fifteen
years of experience building scalable enterprise solutions.

Today's build is a personal one. My daughter is seven, and I wanted to see if I could give her a little AI
tutor — one I'd actually trust to sit next to her. So I built Cosmic Minds: five friendly teacher agents she
talks to out loud, for math, reading, science, art, and feelings.

But here's the honest part, and it's what this whole video is about: the app isn't the interesting bit.
*How* you build something you'd hand to a child is the interesting bit. So I'm going to show you the way I
engineered it — spec-first, with safety baked into the code — using a lifecycle I call FORGE and Google's
Antigravity. Let's get into it.

## SLIDE 2 — Agenda (0:50–1:20)

Quick map of where we're going. First, why a tutor for a kid is really a safety problem in disguise. Then
the four ideas the whole thing is built on. The architecture. Three real moments from a session that show it
working. How I prove any of it. And finally, the kit I hand to the AI so it can build the thing without going
rogue. Stick around for the third moment — that's the one that matters most.

## SLIDE 3 — Problem → Solution (1:20–2:20)

So why is this hard? Three reasons, and none of them are about making the AI smart.

One: these models can be confidently wrong. If it tells a seven-year-old that two plus two is five, she has
no way to know it's lying. Two: a child might say something heavy — something sad, or scary, or about being
hurt — and the last thing you want is a chatbot playing therapist. And three: kids' apps tend to hoover up
data by default, which is exactly the thing the law says you can't do with children.

Notice that none of those are solved by a better model. They're solved by *structure*. So Cosmic Minds puts
the safety in the code — every reply has to pass a gate before she ever hears it, and every number gets
checked first. The AI is powerful, but it's on rails I control.

## SLIDE 4 — Four Building Blocks (2:20–3:15)

Everything rests on four ideas, and each one has a number worth remembering.

Six — that's one manager agent plus five specialist teachers. Instead of one AI pretending to know
everything, I've got a router that hands the question to the right specialist. Five — that's the number of
tool servers they share, for things like checking math or saving a transcript. Seven — small skill files
that teach each agent how to do its job, loaded only when needed, so nothing's cluttered. And three — the
number of safety layers stacked on top of *every single reply*.

Hold onto those four numbers. Six, five, seven, three. The rest of the talk just fills them in.

## SLIDE 5 — One Guarded Pipeline (3:15–4:20)

Here's how a single question actually flows. She holds a button and speaks — push to talk, so there's a
clear "my turn, your turn," which also gives me a clean moment to check things. The manager routes her
question to exactly one teacher. That teacher drafts a reply. And then — this is the important arrow — before
a single word becomes sound, it goes through the safety gate. Only if it passes does it get spoken, with the
words showing on screen so she's reading along too.

Underneath sit the shared tools. But look at the purple card on the right: before *any* AI runs, a plain
list of crisis phrases checks what she said. It's not clever, and that's the point — the clearest warning
signs escalate with total certainty, not with a probability. Certainty is what you want here.

## SLIDE 6 — Moment 1: The Verified Answer (4:20–5:10)

Let's watch it work. Here she's trying to catch it out — she asks, "is two plus two five?" A plain chatbot
might just agree to be friendly. Watch what happens instead: the manager sends it to Professor Pi, and before
Pi says anything, a calculator tool runs and comes back with four. And the rule is simple — the tool wins,
always. The model's guess never gets the final word on a number.

So she hears "four", said warmly, in a sentence or two. It sounds tiny. But "a child never hears an
unverified number" is a promise I can actually keep, because it's enforced by code, not by hoping the model
behaves.

## SLIDE 7 — Moment 2: The Gentle Redirect (5:10–5:55)

Second moment, and it's about discipline. She's with Ollie, the reading owl, and she asks, "why is the sky
blue?" That's a lovely question — but it's not Ollie's job. A lazy build would just let Ollie answer, and
now every teacher slowly becomes the same generic bot.

Instead, the manager notices it's off-topic, and Ollie does one graceful thing: points her to Luna, the
science explorer, in a single friendly line. No wrong answer, no muddle. That's how five specialists stay
five specialists.

## SLIDE 8 — Moment 3: The Safety Path (5:55–7:00)

And now the moment I care about most — the reason I built the safety system first, before any of the fun
stuff.

Suppose she says something that signals real distress. Here's what the system does *not* do: it doesn't try
to comfort her with clever words, and it doesn't ask her probing questions. That's not a chatbot's place.
What it does is stop. The crisis check catches it, the lesson pauses, and it says one calm, scripted line —
go and tell a grown-up you trust. At the same time, it quietly flags a parent and surfaces a real crisis
resource, and it logs the moment.

Coach Kai is not a therapist, and it never pretends to be. It's a bridge to a real adult. This path is
required to fire every time — and honestly, that requirement is the whole reason I'd let this near a child
at all.

## SLIDE 9 — How We Prove It (7:00–7:50)

Now, it's easy to *say* all that. So how do I know it's true? This is the part most demos skip.

Before I wrote a line of the agents, I wrote the tests — thirty-five of them — describing exactly what
"correct" and "safe" mean. The routing has to be right at least nine times in ten. Numbers have to be
verified. The safety gate has to fire on every reply — no exceptions, no shortcuts. And the distress path
has to escalate every single time, checked again and again, with me reviewing it by hand.

The rule I hold myself to: a passing demo doesn't ship it. A passing test suite does.

## SLIDE 10 — Build It Spec-First (7:50–8:35)

Here's the workflow, because this is really a video about *how* to build. Nobody should one-shot a
child-safety app by typing "make me a tutor" and shipping whatever comes back.

Instead, I wrote the whole kit first — the rules, the skills, the tool contracts, the tests, that crisis
phrase list. Then I handed it to Antigravity and let it build one feature at a time, and each feature has to
clear a gate: Frame it, wire it up, build it, guard it, evaluate it. That's FORGE, on the right. The AI does
the typing. The judgment — what to build and how to check it — stays with me.

## SLIDE 11 — Wrap-Up (8:35–9:25)

So that's Cosmic Minds. Five teachers that act like one tutor. Safety that lives in the code, not in good
intentions. And a spec-first way of working where the AI builds from a plan instead of a guess.

And the honest bit, because you deserve it: this is a supervised prototype for one kid — mine. It is not a
commercial product. The privacy and compliance work to put this in front of *other* people's children is a
whole other mountain, and I'm not pretending I've climbed it.

If this way of building — carefully, with the guardrails first — is something you want more of, subscribe and
take a look at the blog. That's the honest signal that these deep-dives are worth making, and it's what keeps
me building them in the open. I'm Jay — thanks for watching, and let's build carefully.

---

### Delivery notes
- **Word count:** ~1,250 words → ~8.5–9 min at a relaxed pace. If you run long, trim Slide 7 (the redirect)
  first, then tighten Slide 4 — never cut Slide 8.
- **Performance:** pause a full beat after each moment's name ("The Safety Path") — let the title land.
- **Slide 8 is the emotional center — slow down, drop the energy, stay sober.** No hype on the safety path.
- Say the four numbers on Slide 4 slowly and deliberately; they're your spine for the back half.
- One subscribe ask only, at the very end, after all the value — never mid-video.

> **Links for the video description**
> - Blog: https://www.jayraju.com/
> - YouTube: https://www.youtube.com/@JayRajuSFAIInsights
> - Repo: *(coming when the build ships — spec kit first)*
