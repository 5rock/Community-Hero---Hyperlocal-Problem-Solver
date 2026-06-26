import google.generativeai as genai

class ResearchAgent:
    """Agent responsible for gathering data and researching specific tasks."""
    
    def __init__(self, model_name: str = 'gemini-1.5-flash'):
        self.model = genai.GenerativeModel(model_name)
        self.system_prompt = (
            "You are the Research Agent. Your job is to gather specific facts, "
            "data points, or context related to the given task. Be concise and factual."
        )

    def research(self, task: str) -> str:
        full_prompt = f"{self.system_prompt}\n\nTask: {task}"
        response = self.model.generate_content(full_prompt)
        return response.text
