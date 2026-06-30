from google import genai


class AnalysisAgent:
    """Agent responsible for synthesizing research and generating a cohesive response."""

    def __init__(self, model_name: str = "gemini-3.5-flash"):
        self.model_name = model_name
        self.system_prompt = (
            "You are the Analysis Agent. Your job is to take raw research data "
            "and synthesize it into a clear, actionable, and user-friendly response."
        )

    def analyze(self, original_prompt: str, research_data: list) -> str:
        context = "\n\n".join(
            [f"Research Point {i+1}: {data}" for i, data in enumerate(research_data)]
        )
        full_prompt = f"{self.system_prompt}\n\nOriginal Request: {original_prompt}\n\nSynthesize this research:\n{context}"
        client = genai.Client()
        response = client.models.generate_content(
            model=self.model_name, contents=full_prompt
        )
        return response.text
