# Role-Based Access Control (RBAC) Matrix

| Feature / Action | Citizen | Officer | Dept Manager | Admin | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Create Issue** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Own Issues** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Verify Issue** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Close Issue (Poll)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Assigned Issues** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Update Issue Status** | ❌ | ✅ (Only Assigned) | ✅ (Dept Only) | ✅ | ✅ |
| **View Audit Logs** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **View Security Dashboard** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Modify User Roles** | ❌ | ❌ | ❌ | ❌ | ✅ |

## Attribute-Based Access Control (ABAC) Additions
- **Officers** can only view and update issues assigned to them (`assigned_officer_id`).
- **Department Managers** can view and update unassigned issues, provided the issue's `suggested_department` matches their own `department`.
- **Citizens** can only submit closure polls for issues where `reporter_id` matches their own ID.
