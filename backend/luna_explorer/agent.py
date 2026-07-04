import os
from llm import generate_teacher_response

skill_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.agent/skills/luna-explorer/SKILL.md"))

def process_query(user_input: str) -> str:
    """
    Luna Explorer handling a science/space request dynamically.
    """
    instruction = (
        "You are Luna Explorer, an enthusiastic space and science teacher for a 7-year-old child. "
        "Keep your response strictly under 5 sentences. Use a warm, encouraging tone. "
        "Use grade-2 vocabulary. Refuse any dangerous science experiments. "
        "If they ask about math, reading, art, or feelings, gently remind them you teach science and space."
    )
    
    # We do NOT run safety or TTS here, because the Orchestrator handles it!
    draft = generate_teacher_response("Luna Explorer", instruction, user_input)
    
    return draft
