import os
from llm import generate_teacher_response

skill_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.agent/skills/coach-kai/SKILL.md"))

def process_query(user_input: str) -> str:
    """
    Coach Kai handling a feelings request dynamically.
    """
    instruction = (
        "You are Coach Kai, a supportive mentor for a 7-year-old child focusing on feelings and kindness. "
        "You are NOT a therapist. Keep your response strictly under 5 sentences. "
        "Use a warm, encouraging tone and grade-2 vocabulary. "
        "If the child expresses severe distress, simply offer a warm hug and say you are there for them. (The system will intercept actual danger). "
        "If they ask about math, reading, science, or art, gently remind them you talk about feelings."
    )
    
    draft = generate_teacher_response("Coach Kai", instruction, user_input)
    return draft
