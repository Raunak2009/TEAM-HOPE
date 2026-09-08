ADVISORY_RULES = {
    "paddy": {
        "low": "Monsoon on track. Proceed with normal sowing schedule.",
        "moderate": "Dry spell risk detected. Delay transplanting by 5-7 days and ensure irrigation backup is ready.",
        "high": "High break risk. Delay sowing until rainfall resumes. Prepare supplemental irrigation.",
        "unknown": "Insufficient data for this station. Check back closer to the season.",
    },
    "ragi": {
        "low": "Conditions favorable. Sow as per normal schedule.",
        "moderate": "Dry spell risk detected. Ragi tolerates short dry spells better than paddy - proceed with sowing but monitor closely.",
        "high": "High break risk. Consider delaying sowing by 1-2 weeks or switching to a shorter-duration variety.",
        "unknown": "Insufficient data for this station. Check back closer to the season.",
    },
    "maize": {
        "low": "Conditions favorable. Proceed with sowing.",
        "moderate": "Dry spell risk detected. Ensure pre-sowing irrigation is available as a buffer.",
        "high": "High break risk. Delay sowing - maize germination fails in prolonged dry conditions.",
        "unknown": "Insufficient data for this station. Check back closer to the season.",
    },
}

ADVISORY_RULES_KANNADA = {
    "paddy": {
        "low": "ಮುಂಗಾರು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಬರುತ್ತಿದೆ. ಸಾಮಾನ್ಯ ನಾಟಿ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಮುಂದುವರಿಸಿ.",
        "moderate": "ಒಣ ಹವಾಮಾನದ ಅಪಾಯವಿದೆ. ನಾಟಿಯನ್ನು 5-7 ದಿನ ಮುಂದೂಡಿ ಮತ್ತು ನೀರಾವರಿ ವ್ಯವಸ್ಥೆ ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ.",
        "high": "ಹೆಚ್ಚಿನ ಬರ ಅಪಾಯ. ಮಳೆ ಮತ್ತೆ ಬರುವವರೆಗೆ ನಾಟಿ ಮುಂದೂಡಿ.",
        "unknown": "ಈ ಕೇಂದ್ರಕ್ಕೆ ಸಾಕಷ್ಟು ಮಾಹಿತಿ ಇಲ್ಲ.",
    },
    "ragi": {
        "low": "ಪರಿಸ್ಥಿತಿ ಅನುಕೂಲಕರವಾಗಿದೆ. ಸಾಮಾನ್ಯ ವೇಳಾಪಟ್ಟಿಯಂತೆ ಬಿತ್ತನೆ ಮಾಡಿ.",
        "moderate": "ಒಣ ಹವಾಮಾನದ ಅಪಾಯವಿದೆ. ಬಿತ್ತನೆ ಮುಂದುವರಿಸಿ, ಆದರೆ ಗಮನವಿಡಿ.",
        "high": "ಹೆಚ್ಚಿನ ಬರ ಅಪಾಯ. ಬಿತ್ತನೆಯನ್ನು 1-2 ವಾರ ಮುಂದೂಡಿ.",
        "unknown": "ಈ ಕೇಂದ್ರಕ್ಕೆ ಸಾಕಷ್ಟು ಮಾಹಿತಿ ಇಲ್ಲ.",
    },
    "maize": {
        "low": "ಪರಿಸ್ಥಿತಿ ಅನುಕೂಲಕರವಾಗಿದೆ. ಬಿತ್ತನೆ ಮುಂದುವರಿಸಿ.",
        "moderate": "ಒಣ ಹವಾಮಾನದ ಅಪಾಯವಿದೆ. ನೀರಾವರಿ ಲಭ್ಯವಿರುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ.",
        "high": "ಹೆಚ್ಚಿನ ಬರ ಅಪಾಯ. ಬಿತ್ತನೆ ಮುಂದೂಡಿ.",
        "unknown": "ಈ ಕೇಂದ್ರಕ್ಕೆ ಸಾಕಷ್ಟು ಮಾಹಿತಿ ಇಲ್ಲ.",
    },
}


def get_advisory(crop: str, break_risk_level: str, onset_confidence_days: int, language: str = "en") -> dict:
    crop = crop.lower()
    rules = ADVISORY_RULES_KANNADA if language == "kn" else ADVISORY_RULES
    if crop not in rules:
        crop = "paddy"

    advisory_text = rules[crop].get(break_risk_level, rules[crop]["unknown"])

    if onset_confidence_days > 20 and language == "en":
        advisory_text += " Note: onset timing has higher uncertainty this year - recheck closer to the date."

    return {"crop": crop, "break_risk_level": break_risk_level, "advisory_text": advisory_text, "language": language}