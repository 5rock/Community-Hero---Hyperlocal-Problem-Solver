import re

def fix_provider(path, deps):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # ensure useMemo is imported
    if 'useMemo' not in content:
        content = re.sub(r'import \{([^}]+)\} from \'react\'', r'import {\1, useMemo} from \'react\'', content)

    pattern = re.compile(r'return\s*\(\s*(<[A-Za-z]+Context\.Provider\s+value=)\{\{(.*?)\}\}(.*?>)', re.DOTALL)
    
    def repl(m):
        obj_content = m.group(2)
        return f'''const contextValue = useMemo(() => ({{{obj_content}}}), [{deps}])
  return (
    {m.group(1)}{{contextValue}}{m.group(3)}'''

    content = pattern.sub(repl, content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_provider('frontend/src/context/AuthContext.tsx', 'user, token, isLoading')
fix_provider('frontend/src/context/NotificationContext.tsx', 'notifications, unreadCount')
fix_provider('frontend/src/context/ThemeContext.tsx', 'theme')

