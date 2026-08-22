with open('backend/seed.py', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('secrets.randbelow', 'secrets.SystemRandom().randint')
content = content.replace('secrets.choice', 'secrets.SystemRandom().choice')
with open('backend/seed.py', 'w', encoding='utf-8') as f:
    f.write(content)
