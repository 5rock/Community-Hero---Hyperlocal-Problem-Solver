import re

with open('app/services/issue_ai_service.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Regex simplification
content = content.replace(
    r'r"[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*,\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)"',
    r'r"[-+]?\d{1,3}\.\d+\s*,\s*[-+]?\d{1,3}\.\d+"'
)

# 2. Constant for gemini-3.5-flash
content = content.replace('"gemini-3.5-flash"', 'DEFAULT_MODEL')
content = content.replace('INJECTION_KEYWORDS = [', 'DEFAULT_MODEL = "gemini-3.5-flash"\n\nINJECTION_KEYWORDS = [')

# 3. logging.exception
content = re.sub(r'logger\.error\(f"(.*?)\{e\}"\)', r'logger.exception("\1%s", e)', content)

with open('app/services/issue_ai_service.py', 'w', encoding='utf-8') as f:
    f.write(content)
