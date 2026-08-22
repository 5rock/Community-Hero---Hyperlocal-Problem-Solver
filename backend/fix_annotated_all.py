import re

def fix_annotated(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'from typing import ' in content and 'Annotated' not in content:
        content = content.replace('from typing import ', 'from typing import Annotated, ')
    elif 'from typing import' not in content:
        content = 'from typing import Annotated\n' + content

    # Replace param: Type = Depends(...) with param: Annotated[Type, Depends(...)]
    # We need to handle generic types carefully
    content = re.sub(
        r'(\b\w+):\s*([a-zA-Z0-9_.]+)\s*=\s*Depends\(([^)]*)\)',
        r'\1: Annotated[\2, Depends(\3)]',
        content
    )
    
    # Fastapi decorators Responses
    # Not addressing the HTTP responses documentation right now
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_annotated('app/api/auth.py')
fix_annotated('app/api/issues.py')
