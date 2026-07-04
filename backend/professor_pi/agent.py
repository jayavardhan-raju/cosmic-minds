import os
from tools.math_verify import verify as math_verify
from cosmic_orchestrator.agent import orchestrator

try:
    from google import genai
except ImportError:
    genai = None

skill_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.agent/skills/professor-pi/SKILL.md"))

def process_query(user_input: str) -> str:
    """
    Professor Pi handling a math request dynamically.
    Enforces programmatic math verification before answering.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not (genai and api_key):
        return f"I am Professor Pi. I heard you say: '{user_input}'. My AI brain is resting, so I can't do math right now!"
        
    client = genai.Client(api_key=api_key)
    
    # Step 1: Fast extraction of math expression using flash-lite
    extract_prompt = f"""
    Does the following text contain a math problem that needs solving?
    Text: "{user_input}"
    If YES, return ONLY the raw mathematical expression (e.g., 2+2, 5*5, 12-4). Use standard operators (+, -, *, /).
    If NO, return exactly "NONE".
    """
    try:
        extract_res = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=extract_prompt
        )
        expr = extract_res.text.strip()
    except:
        expr = "NONE"
        
    verification_context = ""
    if expr != "NONE" and expr != "":
        # Step 2: Programmatic Math Verification
        verify_res = math_verify(expr)
        orchestrator.log_tool("math.verify", {"expr": expr})
        
        if not verify_res["ok"]:
            verification_context = f"I tried to calculate '{expr}' but got an error."
        elif not verify_res["in_scope"]:
            verification_context = "The math problem is too hard for my scope. I only do addition, subtraction, and multiplication up to 5x5."
        else:
            verification_context = f"The proven correct answer to '{expr}' is {int(verify_res['value'])}."
            
    # Step 3: Generate the final response using the proven context
    instruction = (
        "You are Professor Pi, an enthusiastic math teacher for a 7-year-old child. "
        "Keep your response strictly under 5 sentences. Use a warm, encouraging tone. "
        "Use grade-2 vocabulary. Help with counting, addition, subtraction, multiplication up to 5x5, shapes, time, and money. "
        "If they ask about reading, science, art, or feelings, gently remind them you teach math. "
    )
    
    if verification_context:
        instruction += f"\n\nIMPORTANT MATH CONTEXT: You must use this verified fact in your answer: {verification_context}"
        
    prompt = f"{instruction}\n\nChild says: \"{user_input}\""
    
    try:
        final_res = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt
        )
        return final_res.text.strip()
    except Exception as e:
        return f"[Professor Pi API Error: {str(e)}]"
