import re

def fix_strength(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    helper = '''const getStrengthColor = (idx: number, s: number) => {
    if (s < idx) return 'bg-muted';
    if (s < 2) return 'bg-red-500';
    if (s < 3) return 'bg-yellow-500';
    if (s < 4) return 'bg-blue-500';
    return 'bg-green-500';
  }'''

    if 'const getStrengthColor' not in content:
        # inject helper before the return statement of the component
        content = content.replace('  return (\n    <div', helper + '\n\n  return (\n    <div')
        # wait, they use layout components so it might be <AuthLayout
        content = content.replace('  return (\n    <AuthLayout', helper + '\n\n  return (\n    <AuthLayout')
        
    old_ternary = ''''''
    
    content = content.replace(old_ternary, '')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_strength('frontend/src/pages/LoginPage.tsx')
fix_strength('frontend/src/pages/SignupPage.tsx')

