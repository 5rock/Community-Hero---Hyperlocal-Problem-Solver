import os

for root, dirs, files in os.walk('frontend/src/context'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            content = content.replace(', useMemo, useEffect, useMemo', ', useEffect, useMemo')
            content = content.replace(', useMemo, ReactNode', ', ReactNode, useMemo')
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
