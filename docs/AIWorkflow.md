# AI Workflow

Community Hero AI leverages multi-agent AI to automate triage, estimation, and routing.

## AI Processing Pipeline

```mermaid
sequenceDiagram
    participant Citizen
    participant API
    participant AI Agent
    participant Officer

    Citizen->>API: Submits Issue (Image + Text)
    API->>AI Agent: Send Image & Text
    AI Agent-->>AI Agent: Vision: Detect Objects
    AI Agent-->>AI Agent: NLP: Categorize & Assess Severity
    AI Agent-->>API: Return Structured JSON
    API->>Citizen: Preview AI Insights
    Citizen->>API: Confirm Submission
    API->>Officer: Route based on Category
```

## AI Capabilities

- **Computer Vision:** Detects potholes, garbage, broken infrastructure from uploaded images.
- **Multilingual Support:** Translates non-English descriptions into English seamlessly.
- **Severity Scoring:** Automatically determines Priority (Low, Medium, High, Critical).
- **Cost Estimation:** Generates rough estimates of repair costs for admin dashboards.
- **Smart Routing:** Assigns issues to relevant municipal departments (e.g., Water Board, Traffic).
