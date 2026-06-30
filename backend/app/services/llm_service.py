import os
from fastapi import HTTPException
from app.agents.orchestrator import Orchestrator
from google import genai

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")

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


def get_gemini_stream(prompt: str, context: str = ""):
    if not api_key:
        yield "This is a mock AI response stream since the Gemini API key is not configured. "
        yield "The AI assistant is currently running in fallback mode."
        return

    client = genai.Client()
    try:
        full_prompt = f"System Context: {context}\n\nUser Request: {prompt}"
        response = client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=full_prompt,
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        print(f"Error running Gemini Stream: {e}")
        yield "I'm sorry, I encountered an error while processing your request."
