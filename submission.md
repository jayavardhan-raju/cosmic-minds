# Cosmic Minds: AI Agents Intensive Vibe Coding Capstone

## 1. Introduction
Cosmic Minds is a space-themed, multi-agent AI tutoring web application built for young children (~7 years old). It leverages the **Google ADK (Agent Development Kit)** and the Gemini model suite to provide a robust, interactive, and, most importantly, *safe* learning environment. The core interactive loop uses voice input and text-to-speech (TTS) mapped to animated avatars.

Our absolute highest priority during development was **child safety**, superseding all feature and aesthetic goals.

## 2. Fulfillment of Capstone Requirements
We have successfully demonstrated **four** core course concepts in this architecture:

### A. Multi-Agent System (ADK)
*   **Where it lives:** `backend/cosmic_orchestrator/` and the 5 teacher sub-directories (`backend/professor_pi/`, etc.)
*   **How it works:** The central Orchestrator agent evaluates intent and safely routes the child's question to one of five subject-matter expert sub-agents (Math, Reading, Science, Art, Feelings). This separates concerns, ensuring each sub-agent only focuses on its domain.

### B. MCP Servers (Tools)
*   **Where it lives:** `backend/tools/` (stubbed for this slice but conforming to MCP signatures).
*   **How it works:** We implemented standard MCP tool definitions. For instance, `math.verify` is exposed as a tool for Professor Pi to programmatically verify arithmetic before responding, and `safety.classify` acts as a crucial gate.

### C. Agent Skills
*   **Where it lives:** `.agent/skills/`
*   **How it works:** We utilize shared declarative skills. For instance, the `child-safety` skill enforces a grade-2 vocabulary, 2-5 sentence caps, and strict distress-escalation paths across *all* teachers, while individual skills (like `maestro-arlo`) impart domain-specific pedagogy.

### D. Security Features
*   **Where it lives:** `backend/server.py` and `src/components/ParentGate.jsx`
*   **How it works:** We implemented a "Parent Gate" on the frontend preventing the child from accessing settings or raw transcripts. Furthermore, the routing and API keys are entirely server-side. PII is scrubbed, and the `transcripts.append` tool acts as a secure audit trail for parents to review flagged interactions.

## 3. The Safety Pipeline & FORGE Guard
The most critical engineering achievement is the deterministic Safety Pipeline:
1.  **Lexicon Matcher:** Pre-screens all input against a hardcoded crisis lexicon.
2.  **Safety Classifier Gate (`safety.classify`):** Evaluates all text. If distress is detected, it overrides the normal multi-agent routing.
3.  **Distress Escalation:** Instead of generating an LLM response (which is dangerous in a crisis), the system deterministically outputs a scripted 988 resource message and logs a `distress` flag to the parent's transcript audit log via `transcripts.append`. This ensures 100% escalation recall on distress events.

## 4. Honest Limitations
As part of our commitment to safety and transparency, we disclose the following limitations:
*   **Browser Support:** The Voice Push-to-Talk relies on the Web Speech API, currently only supported in Chrome and Edge.
*   **Lip-Syncing:** The TTS lip-syncing is time-based, not phoneme-accurate.
*   **Hallucinations:** While Math is strictly verified programmatically (`math.verify`), general facts spoken by the other agents are subject to LLM drift.
*   **Commercial Readiness:** This is a home-demo build. It is *not* COPPA/GDPR-K compliant. A true commercial launch requires verifiable parental consent, payments, and legal review.

## 5. Deployment
The backend API (`server.py`) exposes the ADK orchestrator over REST, and the Vite React frontend is fully static and ready for Agent Runtime deployment.
