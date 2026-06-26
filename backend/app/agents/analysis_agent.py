import google.generativeai as genai

class AnalysisAgent:
    """Agent responsible for synthesizing research and generating a cohesive response."""
    
    def __init__(self, model_name: str = 'gemini-1.5-flash'):
        self.model = genai.GenerativeModel(model_name)
        self.system_prompt = (
            "You are the Analysis Agent. Your job is to take raw research data "
            "and synthesize it into a clear, actionable, and user-friendly response."
        )

    def analyze(self, original_prompt: str, research_data: list) -> str:
        context = "\n\n".join([f"Research Point {i+1}: {data}" for i, data in enumerate(research_data)])
        full_prompt = f"{self.system_prompt}\n\nOriginal Request: {original_prompt}\n\nSynthesize this research:\n{context}"
        response = self.model.generate_content(full_prompt)
        return response.text
