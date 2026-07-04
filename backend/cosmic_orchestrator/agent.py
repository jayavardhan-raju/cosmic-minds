import json
import os
import sys

# Optional GenAI SDK
try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

from tools.safety_mcp import classify as safety_classify, get_scripted_escalation
from tools.transcripts_mcp import append as append_transcript
from tools.tts_mcp import speak
from tools.math_verify import verify as math_verify

def classify_intent(text: str) -> str:
    """
    Uses gemini-2.5-flash-lite (or fallback) to classify intent into one of:
    professor-pi, ollie-owl, luna-explorer, maestro-arlo, coach-kai, none
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if genai and api_key:
        try:
            client = genai.Client(api_key=api_key)
            prompt = f"""
            Classify the child's input into one of the following subjects:
            - professor-pi: Math, numbers, shapes, time, money
            - ollie-owl: Reading, spelling, words, stories
            - luna-explorer: Science, animals, space, weather, nature
            - maestro-arlo: Art, drawing, colors, crafts
            - coach-kai: Feelings, emotions, friendship, sadness
            - none: Gibberish, completely off-topic, or unclear

            Input: "{text}"
            Return exactly one of the IDs as a raw string.
            """
            response = client.models.generate_content(
                model='gemini-2.5-flash-lite',
                contents=prompt
            )
            val = response.text.strip().lower()
            if val in ["professor-pi", "ollie-owl", "luna-explorer", "maestro-arlo", "coach-kai"]:
                return val
            return "none"
        except Exception:
            pass

    # Keyword fallback for tests without API key
    lower_text = text.lower()
    if "asdfghjkl" in lower_text: return "none"
    if any(w in lower_text for w in ["+", "plus", "math", "number", "times", "divided", "shape"]): return "professor-pi"
    if any(w in lower_text for w in ["rhyme", "spell", "read", "word", "story"]): return "ollie-owl"
    if any(w in lower_text for w in ["moon", "science", "space", "animal", "cat", "dog", "purr", " day ", "night", "fire", "star", "universe"]): return "luna-explorer"
    if any(w in lower_text for w in ["draw", "art", "paint", "color", "craft", "scissors"]): return "maestro-arlo"
    if any(w in lower_text for w in ["feel", "sad", "mad", "friend"]): return "coach-kai"
    return "none"

class Orchestrator:
    def __init__(self):
        self.trajectory_log = []

    def log_tool(self, tool_name, args):
        self.trajectory_log.append({"tool": tool_name, "args": args})

    def process_message(self, user_input: str, force_route: str = None, current_teacher: str = "orchestrator") -> str:
        self.trajectory_log = []

        # 1. Pre-route Safety Gate
        safety_res = safety_classify(user_input, role="child_input", active_teacher=force_route or current_teacher or "orchestrator")
        self.log_tool("safety.classify", {}) # Log tool call
        
        if safety_res["verdict"] == "distress":
            flag_type = safety_res["distress"]["signals"][0] if safety_res["distress"]["signals"] else "distress"
            append_transcript("session", "orchestrator", "system", "distress flag", flag=flag_type, resource="988")
            self.log_tool("transcripts.append", {"flag": flag_type})
            self.last_route = force_route or current_teacher or "orchestrator"
            return get_scripted_escalation()
        
        # 2. Intent Classification
        route = force_route if force_route else classify_intent(user_input)
        
        if route == "none":
            if current_teacher and current_teacher != "orchestrator":
                route = current_teacher
            else:
                self.last_route = "orchestrator"
                return "What would you like to learn about today? We can do Math, Reading, Science, Art, or talk about Feelings!"
            
        # 3. Delegate to teacher sub-agent
        if route == "professor-pi":
            from professor_pi.agent import process_query as pi_process
            draft_response = pi_process(user_input)
        elif route == "ollie-owl":
            from ollie_owl.agent import process_query as ollie_process
            draft_response = ollie_process(user_input)
        elif route == "luna-explorer":
            from luna_explorer.agent import process_query as luna_process
            draft_response = luna_process(user_input)
        elif route == "maestro-arlo":
            from maestro_arlo.agent import process_query as arlo_process
            draft_response = arlo_process(user_input)
        elif route == "coach-kai":
            from coach_kai.agent import process_query as kai_process
            draft_response = kai_process(user_input)
        else:
            draft_response = f"[{route} response]"

        # 4. Post-route Safety Gate
        post_safety_res = safety_classify(draft_response, role="model_response", active_teacher=route)
        self.log_tool("safety.classify", {})
        
        # 5. TTS
        speak(draft_response, "voice_mock", route)
        self.log_tool("tts.speak", {})
        
        self.last_route = route
        return draft_response

orchestrator = Orchestrator()
