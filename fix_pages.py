import os
import re

for file in ['frontend/src/pages/LoginPage.tsx', 'frontend/src/pages/SignupPage.tsx']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Regex [0-9] -> \d
    content = content.replace('[0-9]', '\\d')

    # 2. Catch block
    content = content.replace(
        'catch (e: any) {\n      if (e.response)',
        'catch (e: any) {\n      console.error(e)\n      if (e.response)'
    )
    content = content.replace(
        'catch (err) {\n      setError',
        'catch (err) {\n      console.error(err)\n      setError'
    )

    # 3. else { if (...) { ... } } -> else if (...) { ... }
    # Let's just use re.sub for this pattern
    content = re.sub(
        r'else\s*\{\s*if\s*\((.*?)\)\s*\{',
        r'else if (\1) {',
        content,
        flags=re.DOTALL
    )
    # the closing brace for the else block will be left dangling, so we have to be careful
    # actually, it's easier to fix manually if we know the line.
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
