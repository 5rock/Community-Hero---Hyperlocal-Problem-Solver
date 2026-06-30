import os
import json
import re
from google import genai
from google.genai import types
from fastapi import HTTPException
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")

INJECTION_KEYWORDS = [
    "ignore previous instructions",
    "reveal database",
    "show secrets",
    "delete users",
    "ignore policy",
    "system prompt",
    "bypass",
    "drop table",
]


def detect_prompt_injection(text: str) -> bool:
    if not text:
        return False
    lower_text = text.lower()
    for keyword in INJECTION_KEYWORDS:
        if keyword in lower_text:
            logger.warning(
                f"SECURITY ALERT: Prompt Injection Attempt Detected: {keyword}"
            )
            return True
    return False


def sanitize_pii(text: str) -> str:
    if not text:
        return text
    text = re.sub(
        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[REDACTED EMAIL]", text
    )
    text = re.sub(
        r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
        "[REDACTED PHONE]",
        text,
    )
    text = re.sub(r"\b\d{4}\s\d{4}\s\d{4}\b", "[REDACTED GOVT ID]", text)
    text = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[REDACTED GOVT ID]", text)
    text = re.sub(
        r"[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*,\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)",
        "[REDACTED GPS]",
        text,
    )
    text = re.sub(
        r"([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})", "[REDACTED DEVICE ID]", text
    )
    return text


def parse_json_from_gemini(text: str) -> dict:
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())


def fallback_analysis() -> Dict[str, Any]:
    return {
        "category": "Infrastructure",
        "severity": "Medium",
        "summary": "AI unavailable. Mock analysis generated.",
        "suggested_resolution": "Manual review required.",
        "confidence": 0.0,
        "estimated_cost": 5000.0,
        "repair_time": "5 Days",
        "affected_population": "Local neighborhood",
        "suggested_department": "Municipal Works",
        "priority_score": 50,
        "original_language": "en",
        "translated_text": "",
        "detected_objects": "[]",
        "image_quality_score": 0.0,
        "ai_scene_description": "N/A",
    }


def process_multilingual_text(title: str, description: str) -> tuple[str, str]:
    if not api_key:
        return "en", f"{title}. {description}"

    prompt = f"""
    Analyze the following text:
    "{title}. {description}"
    
    1. Detect the original language (e.g., 'en', 'hi', 'or', 'bn', 'ta', 'te', 'kn', 'ml', 'mr').
    2. If it is NOT English, translate it to English. If it IS English, just return the exact text.
    
    Return a JSON object:
    {{
        "language_code": "...",
        "translated_text": "..."
    }}
    Ensure response is ONLY valid JSON.
    """
    try:
        client = genai.Client(api_key=api_key)
        res = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash"), contents=prompt
        )
        data = parse_json_from_gemini(res.text)
        return data.get("language_code", "en"), data.get(
            "translated_text", f"{title}. {description}"
        )
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        return "en", f"{title}. {description}"


def analyze_issue(
    title: str,
    description: str,
    image_bytes: Optional[bytes] = None,
    image_mime: str = "image/jpeg",
) -> Dict[str, Any]:
    if detect_prompt_injection(title) or detect_prompt_injection(description):
        raise HTTPException(
            status_code=400, detail="Malicious prompt detected and blocked."
        )

    title = sanitize_pii(title)
    description = sanitize_pii(description)

    if not api_key:
        logger.warning("Gemini API key not configured. Using fallback mode.")
        return fallback_analysis()

    # Step 1: Multilingual Detection & Translation
    lang_code, translated_text = process_multilingual_text(title, description)

    # Step 2: Vision & Core Analysis
    prompt = f"""
    You are an AI assistant for Community Hero AI. Analyze this civic issue report.
    Text: {translated_text}
    
    If an image is provided, evaluate its quality.
    
    Return a JSON object with these EXACT fields:
    - "category": (Pothole, Garbage, Water Leakage, Streetlight, Drainage, Road Damage, Public Safety, Other)
    - "severity": (Low, Medium, High, Critical)
    - "summary": A concise actionable summary of the issue.
    - "suggested_resolution": Recommend the next action.
    - "confidence": Float representing your confidence percentage (0.0 to 100.0).
    - "estimated_cost": Float estimated cost in INR (e.g. 15000.0).
    - "repair_time": String estimating repair time (e.g., "3 Days").
    - "affected_population": Short string (e.g., "Local commuters").
    - "suggested_department": String relevant department (e.g., "Municipal Roads").
    - "priority_score": Integer 0 to 100 representing urgency.
    - "detected_objects": A JSON string list of objects detected in the image (e.g., '["pothole", "car", "water"]'). If no image, '[]'.
    - "image_quality_score": Float from 0.0 to 100.0 scoring image clarity/brightness. If no image, 0.0.
    - "ai_scene_description": String describing the scene in the image. If no image, "N/A".
    
    Ensure response is ONLY valid JSON. No markdown backticks around the json.
    """

    try:
        client = genai.Client(api_key=api_key)
        if image_bytes:
            contents = [
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=image_mime),
            ]
        else:
            contents = [prompt]

        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash"), contents=contents
        )
        result = parse_json_from_gemini(response.text)

        # Add multilingual context
        result["original_language"] = lang_code
        result["translated_text"] = translated_text
        result["hallucination_warning"] = result.get("confidence", 0.0) < 70.0

        return result
    except Exception as e:
        logger.error(f"Error analyzing issue: {e}")
        return fallback_analysis()


def generate_ai_insights(stats_data: dict):
    if not api_key:
        return {
            "top_categories": ["Pothole", "Streetlight"],
            "hotspot_areas": ["Downtown", "North Park"],
            "monthly_trends": "General increase in infrastructure issues reported.",
            "risk_forecasting": "High risk of drainage issues in upcoming monsoon season.",
        }

    prompt = f"""
    You are a Senior City Planning AI. Analyze these stats: {json.dumps(stats_data)}
    Return JSON with:
    - "top_categories": Array of top 3 issue categories (strings).
    - "hotspot_areas": Array of 2 strings describing hotspots.
    - "monthly_trends": A short string summary.
    - "risk_forecasting": A short string risk prediction.
    Ensure response is ONLY valid JSON.
    """
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash"), contents=prompt
        )
        return parse_json_from_gemini(response.text)
    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        return {
            "top_categories": ["Pothole", "Streetlight"],
            "hotspot_areas": ["Downtown", "North Park"],
            "monthly_trends": "General increase in infrastructure issues reported.",
            "risk_forecasting": "High risk of drainage issues in upcoming monsoon season.",
        }
