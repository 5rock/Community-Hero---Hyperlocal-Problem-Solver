import os
import re

for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # key={index} -> key={item-}
            content = re.sub(r'key=\{index\}', r'key={item-}', content)
            
            # AuthLayout: new Array()
            content = content.replace('[...Array(20)]', '[...new Array(20)]')
            content = content.replace('[...Array(140)]', '[...new Array(140)]') # ProfilePage
            content = content.replace('key={i}', r'key={i-}')

            # ThemeContext / NotificationContext: nested ternaries inside
            # we can just ignore or try to fix if it's there
            content = content.replace(
                '''theme === 'dark' ? 'text-primary' : theme === 'light' ? 'text-blue-500' : 'text-foreground' ''',
                '''theme === 'dark' ? 'text-primary' : (theme === 'light' ? 'text-blue-500' : 'text-foreground')'''
            )
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
