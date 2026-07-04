def speak(text: str, voice: str, teacher: str) -> dict:
    return {
        "ok": True,
        "audio_url": "mock_audio_url_or_base64",
        "duration_ms": 4200,
        "mouth_timings": [
            { "t_ms": 0, "open": 0.2 },
            { "t_ms": 130, "open": 0.8 }
        ]
    }
