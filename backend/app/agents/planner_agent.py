import google.generativeai as genai
from typing import List

class PlannerAgent:
    """Agent responsible for breaking down a complex task into manageable sub-tasks."""
    
    def __init__(self, model_name: str = 'gemini-1.5-flash'):
        self.model = genai.GenerativeModel(model_name)
        self.system_prompt = (
            "You are the Planner Agent. Your job is to take a user prompt and "
            "break it down into 2-3 specific research or analysis tasks. "
            "Return ONLY the tasks separated by newlines."
        )

    def plan(self, prompt: str) -> List[str]:
        full_prompt = f"{self.system_prompt}\n\nUser Request: {prompt}"
        response = self.model.generate_content(full_prompt)
        tasks = [task.strip() for task in response.text.strip().split('\n') if task.strip()]
        return tasks
