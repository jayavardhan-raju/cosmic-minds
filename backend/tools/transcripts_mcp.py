def append(session_id: str, teacher: str, role: str, text: str, flag: str = "none", resource: str = None) -> dict:
    return {
        "ok": True,
        "entry_id": "mock_entry_id_123"
    }

def list_transcripts(parent_pin_ok: bool, limit: int = 50) -> dict:
    if not parent_pin_ok:
        return { "ok": False, "error": { "code": "UNAUTHORIZED", "message": "Invalid PIN" } }
    return {
        "ok": True,
        "sessions": [
            { "session_id": "session_123", "date": "2026-07-03T10:00:00Z", "duration_min": 12, "teacher": "professor-pi", "flags": [] }
        ]
    }

def clear(parent_pin_ok: bool) -> dict:
    if not parent_pin_ok:
        return { "ok": False, "error": { "code": "UNAUTHORIZED", "message": "Invalid PIN" } }
    return {
        "ok": True,
        "cleared": 1
    }
