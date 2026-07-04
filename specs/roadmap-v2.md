# Cosmic Minds — v2 (Commercial Phase) Roadmap

> NOT for the capstone. This captures the stack/features deferred from the July-6 build, most of which the
> Duolingo-clone tutorial demonstrates well. Ship v1 (capstone) first; treat everything here as gated behind
> real compliance work, because the user is a minor.

## Platform
- **Expo / React Native.** A kids' tutoring app belongs on tablets and the app stores. Expo gives one
  codebase for iOS/Android, native audio (WebRTC), and NativeWind (same Tailwind model as the web build).
  The web (Vite) capstone code and the ADK/MCP backend carry over; the frontend is re-platformed.

## Auth & accounts
- **Clerk** for parent authentication (OAuth, OTP) — the primitive the capstone's PIN is standing in for.
- Clerk gives auth, NOT compliance: pair it with **verifiable parental consent** flows before any child uses it.

## Real-time voice (optional, carefully)
- **Gemini Live API** (e.g. `gemini-3.1-flash-live-preview`) for streaming, interruptible conversation —
  one stack, no Stream+OpenAI second vendor.
- **Constraint:** streaming voice removes the clean pre-speech safety checkpoint. Only enable on the
  **non-safety teachers**, add **streaming/real-time moderation**, and keep **Coach Kai turn-based**.

## Analytics
- Product analytics (e.g. PostHog) only if: **parent-side/aggregate**, **anonymized**, **consent-gated**,
  and ideally self-hosted. No behavioral profiling of the child.

## Compliance & production infra (blocking for launch)
- COPPA (US, <13) + GDPR-K (EU), verifiable parental consent, privacy policy, legal review (~$5–10k).
- Server-side key storage (already required), content-safety classifiers at scale, audit logging,
  encryption at rest + in transit, rate limiting/abuse detection, payments (Stripe), accessibility audit,
  educator/curriculum review, liability insurance.

## Monetization (decision deferred)
- Options discussed: free + parent's own API keys (pass-through); subscription (~$9.99/mo); one-time purchase.

## Sequencing suggestion
1. Ship & submit v1 (capstone). 2. Compliance/legal review. 3. Re-platform to Expo. 4. Clerk + consent.
5. Gemini Live on non-safety teachers. 6. Consent-gated analytics. 7. Payments + launch.
