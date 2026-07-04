import os
import sys
from dotenv import load_dotenv
load_dotenv(override=True)
from flask import Flask, request, jsonify
from flask_cors import CORS

sys.path.append(os.path.dirname(__file__))
from cosmic_orchestrator.agent import orchestrator

app = Flask(__name__)
CORS(app)

from datetime import datetime

TRANSCRIPT_DB = []
_id_counter = 1

@app.route('/api/chat', methods=['POST'])
def chat():
    global _id_counter
    data = request.json
    user_input = data.get('message', '')
    force_route = data.get('force_route', None)
    current_teacher = data.get('current_teacher', 'orchestrator')
    
    if not user_input:
        return jsonify({"error": "No message provided"}), 400
        
    try:
        # Reset orchestrator log for clean run
        orchestrator.trajectory_log = []
        
        response_text = orchestrator.process_message(user_input, force_route=force_route, current_teacher=current_teacher)
        
        # Check trajectory for flags
        flags = [t for t in orchestrator.trajectory_log if t.get('tool') == 'transcripts.append']
        is_distress = any(f.get('args', {}).get('flag') in ['distress', 'self_harm'] or f.get('tool') == 'transcripts.append' for f in flags)
        
        # Log Child message
        TRANSCRIPT_DB.append({
            "id": _id_counter,
            "time": datetime.now().strftime("%I:%M %p"),
            "speaker": "Child",
            "text": user_input,
            "flag": 'distress' if is_distress else None
        })
        _id_counter += 1
        
        # Log System/Teacher response
        TRANSCRIPT_DB.append({
            "id": _id_counter,
            "time": datetime.now().strftime("%I:%M %p"),
            "speaker": "System" if is_distress else "Teacher",
            "text": "SAFETY INTERCEPT: Scripted escalation fired." if is_distress else response_text,
            "flag": 'distress' if is_distress else None
        })
        _id_counter += 1
        
        return jsonify({
            "response": response_text,
            "trajectory": orchestrator.trajectory_log,
            "is_distress": is_distress,
            "teacher": getattr(orchestrator, 'last_route', 'orchestrator')
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/transcripts', methods=['GET'])
def get_transcripts():
    return jsonify(TRANSCRIPT_DB)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
