from .planner_agent import PlannerAgent
from .research_agent import ResearchAgent
from .analysis_agent import AnalysisAgent


class Orchestrator:
    """Manages the workflow between all agents."""

    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearchAgent()
        self.analyzer = AnalysisAgent()

    def process_request(self, prompt: str) -> str:
        # Step 1: Plan
        try:
            tasks = self.planner.plan(prompt)

            # Step 2: Research
            research_results = []
            for task in tasks:
                # In a real app, this could be async/parallel
                result = self.researcher.research(task)
                research_results.append(result)

            # Step 3: Analyze & Synthesize
            final_response = self.analyzer.analyze(prompt, research_results)
            return final_response

        except Exception as e:
            print(f"Orchestrator Error: {e}")
            raise
