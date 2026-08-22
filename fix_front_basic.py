import os
import re

def fix_frontend():
    # 1. Fix Button Types
    for root, dirs, files in os.walk('frontend/src'):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace <button ...> with <button type="button" ...> if it doesn't have a type
                content = re.sub(r'<button(?![^>]*type=)', r'<button type="button"', content)
                
                # Fix Readonly Props (e.g. }: Props) -> }: Readonly<Props>)
                # Only if it's not already Readonly
                content = re.sub(r'}:\s*([A-Za-z0-9_]+Props)\s*\)', r'}: Readonly<\1>)', content)

                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

    # 2. Fix AIAssistantWidget optional chaining
    w_path = 'frontend/src/components/AIAssistantWidget.tsx'
    if os.path.exists(w_path):
        with open(w_path, 'r', encoding='utf-8') as f:
            c = f.read()
        c = c.replace("lastMsg && lastMsg.role === 'assistant'", "lastMsg?.role === 'assistant'")
        c = c.replace("!wsRef.current || wsRef.current.readyState !==", "wsRef.current?.readyState !==")
        
        # fix ternary inside AIAssistantWidget L217
        # we can just use a normal let / if block or simplify
        # it was probably: className={role === 'user' ? '...' : (isStreaming ? '...' : '...')}
        # let's leave ternary for a specific replace
        with open(w_path, 'w', encoding='utf-8') as f:
            f.write(c)

fix_frontend()
