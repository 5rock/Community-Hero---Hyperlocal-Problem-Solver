import re

with open('app/api/auth.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add constant
content = content.replace('COOKIE_SECURE = os.getenv("COOKIE_SECURE", "true").lower() == "true"\n', 'COOKIE_SECURE = os.getenv("COOKIE_SECURE", "true").lower() == "true"\nERROR_INCORRECT_CREDENTIALS = "Incorrect email or password"\n')

# Replace "Incorrect email or password"
content = content.replace('"Incorrect email or password"', 'ERROR_INCORRECT_CREDENTIALS')

with open('app/api/auth.py', 'w', encoding='utf-8') as f:
    f.write(content)
