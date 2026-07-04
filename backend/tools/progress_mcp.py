def start_session(teacher: str) -> dict:
    return {
        "ok": True,
        "session_id": "session_123",
        "started_at": "2026-07-03T10:00:00Z"
    }

def end_session(session_id: str) -> dict:
    return {
        "ok": True,
        "duration_min": 12
    }

def summary(parent_pin_ok: bool) -> dict:
    if not parent_pin_ok:
        return { "ok": False, "error": { "code": "UNAUTHORIZED", "message": "Invalid PIN" } }
    return {
        "ok": True,
        "per_teacher": {
            "professor-pi": { "sessions": 1, "minutes": 12 }
        },
        "total_minutes": 12
    }
