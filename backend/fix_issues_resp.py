import re

with open('app/api/issues.py', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    ('@router.get("/", response_model=list[schemas.IssueResponse])', '@router.get("/", response_model=list[schemas.IssueResponse], responses={401: {"description": "Unauthorized"}})' ),
    ('@router.get("/{issue_id}", response_model=schemas.IssueResponse)', '@router.get("/{issue_id}", response_model=schemas.IssueResponse, responses={404: {"description": "Issue not found"}, 401: {"description": "Unauthorized"}})' ),
    ('@router.put("/{issue_id}", response_model=schemas.IssueResponse)', '@router.put("/{issue_id}", response_model=schemas.IssueResponse, responses={404: {"description": "Issue not found"}, 403: {"description": "Forbidden"}})' ),
    ('@router.post("/{issue_id}/upvote")', '@router.post("/{issue_id}/upvote", responses={404: {"description": "Issue not found"}, 400: {"description": "Bad Request"}})' ),
    ('@router.post("/upload_image")', '@router.post("/upload_image", responses={400: {"description": "Invalid image"}, 413: {"description": "Payload too large"}, 503: {"description": "Storage unavailable"}})' )
]

for old, new in replacements:
    content = content.replace(old, new)

with open('app/api/issues.py', 'w', encoding='utf-8') as f:
    f.write(content)
