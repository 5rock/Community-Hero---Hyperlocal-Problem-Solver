import os
import json
import re
import google.generativeai as genai
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Prompt Injection Blocklist
INJECTION_KEYWORDS = [
    "ignore previous instructions",
    "reveal database",
    "show secrets",
    "delete users",
    "ignore policy",
    "system prompt",
    "bypass",
    "drop table"
]

def detect_prompt_injection(text: str) -> bool:
    if not text:
        return False
    lower_text = text.lower()
    for keyword in INJECTION_KEYWORDS:
        if keyword in lower_text:
            logger.warning(f"SECURITY ALERT: Prompt Injection Attempt Detected: {keyword}")
            return True
    return False

def sanitize_pii(text: str) -> str:
    if not text:
        return text
    # Remove emails
    text = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[REDACTED EMAIL]', text)
    # Remove phone numbers
    text = re.sub(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', '[REDACTED PHONE]', text)
    # Remove Govt IDs (Aadhaar, SSN, etc. heuristics)
    text = re.sub(r'\b\d{4}\s\d{4}\s\d{4}\b', '[REDACTED GOVT ID]', text) # Aadhaar
    text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[REDACTED GOVT ID]', text) # SSN
    # GPS Coordinates (e.g. 12.345, 67.890)
    text = re.sub(r'[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*,\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)', '[REDACTED GPS]', text)
    # MAC/Device IDs
    text = re.sub(r'([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})', '[REDACTED DEVICE ID]', text)
    return text

def analyze_issue(title: str, description: str):
    if detect_prompt_injection(title) or detect_prompt_injection(description):
        raise HTTPException(status_code=400, detail="Malicious prompt detected and blocked. Incident logged.")

    title = sanitize_pii(title)
    description = sanitize_pii(description)
    
    if not api_key:
        print("WARNING: Gemini API key not configured. Using fallback mode for issue analysis.")
        return {
            "category": "Infrastructure",
            "severity": "Medium",
            "summary": "AI unavailable. Mock analysis generated.",
            "resolution": "Manual review required.",
            "suggested_resolution": "Manual review required.",
            "confidence": 0.0,
            "estimated_cost": 5000.0,
            "repair_time": "5 Days",
            "affected_population": "Local neighborhood",
            "suggested_department": "Municipal Works",
            "priority_score": 50,
            "hallucination_warning": True
        }
    
    prompt = f"""
    You are an AI assistant for a civic issue reporting platform called Community Hero AI.
    Analyze the following issue report:
    Title: {title}
    Description: {description}
    
    Return a JSON object with the following fields:
    - "category": Categorize the issue into one of these: Pothole, Garbage, Water Leakage, Streetlight, Drainage, Road Damage, Public Safety, Other.
    - "severity": Predict the severity level: Low, Medium, High, Critical.
    - "summary": A concise actionable summary of the issue.
    - "suggested_resolution": Recommend the next action to resolve the issue.
    - "confidence": A float representing your confidence percentage in this analysis (0.0 to 100.0).
    - "estimated_cost": A float representing the estimated cost in INR (e.g. 15000.0).
    - "repair_time": A string estimating repair time (e.g., "3 Days").
    - "affected_population": A short string describing who is affected (e.g., "Local commuters").
    - "suggested_department": A string for the relevant department (e.g., "Municipal Roads").
    - "priority_score": An integer from 0 to 100 representing the urgency.

    Ensure the response is ONLY a valid JSON string without markdown formatting or code blocks.
    """
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean markdown code block if present
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        result = json.loads(text.strip())
        
        # Output Validation & Hallucination Check
        confidence = result.get("confidence", 0.0)
        result["hallucination_warning"] = confidence < 70.0
        
        return result
    except Exception as e:
        print(f"Error analyzing issue with Gemini: {e}")
        # Return fallback values
        return {
            "category": "Infrastructure",
            "severity": "Medium",
            "summary": "AI unavailable. Mock analysis generated.",
            "resolution": "Manual review required.",
            "suggested_resolution": "Manual review required.",
            "confidence": 0.0,
            "estimated_cost": 5000.0,
            "repair_time": "5 Days",
            "affected_population": "Local neighborhood",
            "suggested_department": "Municipal Works",
            "priority_score": 50,
            "hallucination_warning": True
        }

def generate_ai_insights(stats_data: dict):
    if not api_key:
        return {
            "top_categories": ["Pothole", "Streetlight"],
            "hotspot_areas": ["Downtown", "North Park"],
            "monthly_trends": "General increase in infrastructure issues reported.",
            "risk_forecasting": "High risk of drainage issues in upcoming monsoon season."
        }
        
    prompt = f"""
    You are a Senior City Planning AI for Community Hero AI.
    Analyze the following platform statistics:
    {json.dumps(stats_data)}
    
    Return a JSON object with the following fields:
    - "top_categories": Array of top 3 issue categories (strings).
    - "hotspot_areas": Array of 2 strings describing potential hotspots based on the data.
    - "monthly_trends": A short string summarizing the trend.
    - "risk_forecasting": A short string predicting future risks based on the data.
    
    Ensure the response is ONLY a valid JSON string without markdown formatting or code blocks.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Error generating insights with Gemini: {e}")
        return {
            "top_categories": ["Pothole", "Streetlight"],
            "hotspot_areas": ["Downtown", "North Park"],
            "monthly_trends": "General increase in infrastructure issues reported.",
            "risk_forecasting": "High risk of drainage issues in upcoming monsoon season."
        }
