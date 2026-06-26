import os
import google.generativeai as genai
from fastapi import HTTPException
from app.agents.orchestrator import Orchestrator

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

orchestrator = Orchestrator()

def get_gemini_response(prompt: str, context: str = None) -> str:
    if not api_key:
        print("WARNING: Gemini API key not configured. Using fallback mode for chat.")
        return "This is a mock AI response since the Gemini API key is not configured. The AI assistant is currently running in fallback mode."
        
    try:
        # Pass the context and prompt to the orchestrator
        full_prompt = prompt
        if context:
            full_prompt = f"Context: {context}\n\nUser Request: {prompt}"
            
        final_response = orchestrator.process_request(full_prompt)
        return final_response
    except Exception as e:
        print(f"Error running Multi-Agent Orchestrator: {e}")
        raise HTTPException(status_code=500, detail="Failed to run AI Multi-Agent flow")
