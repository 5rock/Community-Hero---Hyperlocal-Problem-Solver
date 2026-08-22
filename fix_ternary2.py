import re

for file in ['frontend/src/pages/LoginPage.tsx', 'frontend/src/pages/SignupPage.tsx']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # The string interpolation inside className
    pattern = re.compile(r'\$\{\s*strength\s*>=\s*idx\s*\?\s*strength\s*<\s*2.*?bg-muted\'\s*\}', re.DOTALL)
    content = pattern.sub('', content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
