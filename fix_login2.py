import re

def fix_login(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # else if
    content = content.replace(
        '''} else {
                      if (error === 'Caps Lock is ON') setError('')
                    }''',
        '''} else if (error === 'Caps Lock is ON') {
                      setError('')
                    }'''
    )

    # nested ternaries
    # We will use a script to extract the password strength classes out
    # Actually, in LoginPage.tsx and SignupPage.tsx, it's:
    # color: passwordStrength === 'Strong' ? 'text-green-500' : passwordStrength === 'Medium' ? 'text-yellow-500' : 'text-red-500'
    # etc...
    # Let's see what is on L172 of LoginPage.tsx
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_login('frontend/src/pages/LoginPage.tsx')
fix_login('frontend/src/pages/SignupPage.tsx')
