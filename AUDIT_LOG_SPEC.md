# Audit Log Specification

## Immutability & Storage
Audit logs are stored in a strictly append-only `AuditLog` table. Update and Delete operations are prohibited at the application layer for this model.

## Monitored Events
- `LOGIN_SUCCESS`: Successful authentication.
- `LOGIN_FAILED`: Failed authentication (triggers Security Dashboard alert).
- `CREATE_ISSUE`: A new civic issue was reported.
- `VERIFY_ISSUE`: A community member confirmed an issue.
- `UPDATE_ISSUE_STATUS`: An Officer or Admin changed an issue's state.
- `PROMPT_INJECTION`: A user attempted to exploit the AI Gateway (triggers high-risk alert).

## Schema Definition
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `user_id` | Integer | ID of the actor (if authenticated) |
| `role` | String | Role of the actor at the time of the event |
| `action` | String | Enumerated action identifier |
| `ip_address` | String | Client remote IP address |
| `browser` | String | Extracted from User-Agent |
| `os` | String | Extracted from User-Agent |
| `result` | String | `SUCCESS`, `FAILURE`, or `BLOCKED` |
| `details` | String | Optional JSON or string context |
| `created_at` | DateTime | Auto-generated timestamp |

## Integrations
The Audit Log feeds directly into the `/api/admin/security-dashboard` endpoint, enabling threat detection, risk score calculation, and incident response.
