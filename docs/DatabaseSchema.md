# Database Schema

Community Hero AI uses a PostgreSQL relational database. The schema is optimized for speed, relationships, and extensibility.

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        string email
        string full_name
        string role
        string hashed_password
    }
    
    ISSUES {
        int id PK
        string title
        string description
        float lat
        float lng
        string status
        string severity
        int reporter_id FK
    }

    NOTIFICATIONS {
        int id PK
        string user_id FK
        string title
        string message
        boolean is_read
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string target
        datetime timestamp
    }

    USERS ||--o{ ISSUES : "reports"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "performs"
```

## Tables Overview

- **Users:** Stores citizen, officer, and admin accounts. Includes RBAC rules.
- **Issues:** The core entity representing a community problem. Stores geolocation (lat, lng), AI analysis metadata, and current status.
- **Notifications:** Tracks in-app and email notifications.
- **Audit Logs:** Immutable record of sensitive actions for security compliance.
