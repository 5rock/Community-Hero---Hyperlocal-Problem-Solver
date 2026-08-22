import re

def fix_js(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'secureRandom' not in content:
        content = 'const secureRandom = () => window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;\n' + content
        
    content = content.replace('Math.random()', 'secureRandom()')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_js('frontend/src/components/layout/AuthLayout.tsx')
fix_js('frontend/src/pages/dashboard/ProfilePage.tsx')

def fix_py(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('import random', 'import secrets\nimport random')
    content = content.replace('random.choice', 'secrets.choice')
    content = content.replace('random.randint', 'secrets.randbelow')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_py('backend/seed.py')
