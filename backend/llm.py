import os

try:
    from google import genai
except ImportError:
    genai = None

def generate_teacher_response(teacher_name: str, instruction: str, user_input: str) -> str:
    """
    Calls the Gemini API using the 3.5-flash model as required by the specs.
    If the API key or genai library is missing, returns a dynamic mock response.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if genai and api_key:
        try:
            client = genai.Client(api_key=api_key)
            
            # Fetch recent conversation history for context
            history_text = ""
            try:
                from server import TRANSCRIPT_DB
                recent = TRANSCRIPT_DB[-6:] # Get last 6 messages
                if recent:
                    history_text = "\nRecent Conversation History:\n"
                    for msg in recent:
                        speaker_name = "You (Teacher)" if msg.get("speaker") == "system" else "Child"
                        history_text += f"{speaker_name}: {msg.get('text')}\n"
            except ImportError:
                pass
                
            prompt = f"{instruction}\n{history_text}\nChild says: \"{user_input}\""
            
            response = client.models.generate_content(
                model='gemini-3.5-flash',
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            return f"[{teacher_name} API Error: {str(e)}]"
            
    # Fallback if no API key is provided
    return f"I am {teacher_name}. I heard you say: '{user_input}'. Since my AI brain is resting, I can't think of a full response right now!"
