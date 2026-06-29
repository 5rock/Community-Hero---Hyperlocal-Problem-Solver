from google import genai


class ResearchAgent:
    """Agent responsible for gathering data and researching specific tasks."""

    def __init__(self, model_name: str = "gemini-3.5-flash"):
        self.model_name = model_name
        self.system_prompt = (
            "You are the Research Agent. Your job is to gather specific facts, "
            "data points, or context related to the given task. Be concise and factual."
        )

    def research(self, task: str) -> str:
        full_prompt = f"{self.system_prompt}\n\nTask: {task}"
        client = genai.Client()
        response = client.models.generate_content(
            model=self.model_name,
            contents=full_prompt
        )
        return response.text
