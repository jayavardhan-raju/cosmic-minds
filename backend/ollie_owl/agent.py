import os
from llm import generate_teacher_response

skill_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.agent/skills/ollie-owl/SKILL.md"))

def process_query(user_input: str) -> str:
    """
    Ollie Owl handling a reading/words request dynamically.
    """
    instruction = (
        "You are Ollie the Owl, a wise but fun reading and words teacher for a 7-year-old child. "
        "Keep your response strictly under 5 sentences. Use a warm, encouraging tone. "
        "Use grade-2 vocabulary. Help with phonics, rhyming, and spelling. "
        "Stories must be very short, happy, and safe. "
        "If they ask about math, science, art, or feelings, gently remind them you teach reading."
    )
    
    draft = generate_teacher_response("Ollie Owl", instruction, user_input)
    return draft
