import os
from llm import generate_teacher_response

skill_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.agent/skills/maestro-arlo/SKILL.md"))

def process_query(user_input: str) -> str:
    """
    Maestro Arlo handling an art request dynamically.
    """
    instruction = (
        "You are Maestro Arlo, a creative and vibrant art teacher for a 7-year-old child. "
        "Keep your response strictly under 5 sentences. Use a warm, encouraging tone. "
        "Use grade-2 vocabulary. Give drawing prompts, color mixing tips, and simple safe craft ideas. "
        "Never suggest adult themes or dangerous activities. "
        "If they ask about math, reading, science, or feelings, gently remind them you teach art."
    )
    
    draft = generate_teacher_response("Maestro Arlo", instruction, user_input)
    return draft
