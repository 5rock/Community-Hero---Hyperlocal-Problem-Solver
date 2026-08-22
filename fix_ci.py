with open('.github/workflows/ci.yml', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('|| pip install -r requirements.txt', '')
content = content.replace('|| pip install ruff==0.4.2 pytest==8.1.1', '')
with open('.github/workflows/ci.yml', 'w', encoding='utf-8') as f:
    f.write(content)

with open('.github/workflows/devsecops.yml', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('|| pip install -r requirements.txt', '')
content = content.replace('|| pip install pip-audit==2.7.2', '')
with open('.github/workflows/devsecops.yml', 'w', encoding='utf-8') as f:
    f.write(content)

with open('backend/Dockerfile', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('|| pip install --no-cache-dir -r requirements.txt', '')
with open('backend/Dockerfile', 'w', encoding='utf-8') as f:
    f.write(content)

