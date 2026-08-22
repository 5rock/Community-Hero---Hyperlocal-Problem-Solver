import re

with open('app/api/issues.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace responses for create_issue
content = content.replace(
    '@router.post("/", response_model=schemas.IssueResponse)',
    '@router.post("/", response_model=schemas.IssueResponse, responses={409: {"description": "Duplicate issue found"}, 400: {"description": "Invalid Input"}})'
)

# Extract duplicate prevention logic
duplicate_logic = '''
def _check_duplicate(db, category, lat, lng):
    all_issues = db.query(models.Issue).filter(models.Issue.category == category).all()
    for existing in all_issues:
        dist = haversine(lat, lng, float(existing.lat), float(existing.lng))
        if dist <= 50 and existing.status not in ["RESOLVED", "CLOSED", "REJECTED"]:
            raise HTTPException(
                status_code=409,
                detail=f"Duplicate issue. A similar issue exists within 50m. ID: {existing.id}",
            )

@router.post("/", response_model=schemas.IssueResponse, responses={409: {"description": "Duplicate issue found"}, 400: {"description": "Invalid Input"}})
def create_issue(
    issue: schemas.IssueCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    category = issue.category or "Other"
    _check_duplicate(db, category, issue.lat, issue.lng)
'''

content = re.sub(
    r'@router\.post\("/", response_model=schemas\.IssueResponse, responses=\{409: \{"description": "Duplicate issue found"\}, 400: \{"description": "Invalid Input"\}\}\).*?category = issue\.category or "Other"\s*# Duplicate & Cooldown Prevention\s*all_issues = db\.query\(models\.Issue\)\.filter\(models\.Issue\.category == category\)\.all\(\)\s*for existing in all_issues:\s*dist = haversine\(issue\.lat, issue\.lng, float\(existing\.lat\), float\(existing\.lng\)\)\s*if dist <= 50:\s*if existing\.status not in \["RESOLVED", "CLOSED", "REJECTED"\]:\s*raise HTTPException\(\s*status_code=409,\s*detail=f"Duplicate issue\. A similar issue exists within 50m\. ID: \{existing\.id\}",\s*\)',
    duplicate_logic.strip(),
    content,
    flags=re.DOTALL
)


with open('app/api/issues.py', 'w', encoding='utf-8') as f:
    f.write(content)
