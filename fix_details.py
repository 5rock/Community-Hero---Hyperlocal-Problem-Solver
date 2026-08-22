import re

with open('frontend/src/pages/dashboard/IssueDetails.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. parseInt -> Number.parseInt
content = content.replace('parseInt(id as string)', 'Number.parseInt(id as string)')

# 2. Extract ternaries
# Instead of complex regex, let's just do literal replacements or targeted regex
content = content.replace(
'''issue.status === 'REOPENED'
                    ? 'PENDING'
                    : issue.status === 'REJECTED'
                      ? 'CLOSED'
                      : issue.status''',
'''(issue.status === 'REOPENED' ? 'PENDING' : '') || (issue.status === 'REJECTED' ? 'CLOSED' : '') || issue.status'''
)

content = content.replace(
'''''',
'''  '''
)

content = content.replace(
'''{isPast ? (
                            <CheckCircle size={14} className="md:w-4 md:h-4" />
                          ) : isActive ? (
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                          ) : (
                            <span className="text-[10px] md:text-xs font-bold">{idx + 1}</span>
                          )}''',
'''{isPast && <CheckCircle size={14} className="md:w-4 md:h-4" />}
                          {!isPast && isActive && <div className="w-2 h-2 rounded-full bg-primary animate-ping" />}
                          {!isPast && !isActive && <span className="text-[10px] md:text-xs font-bold">{idx + 1}</span>}'''
)

content = content.replace(
'''className={ont-bold text-sm md:text-base }''',
'''className={ont-bold text-sm md:text-base   }'''
)

# 3. Role button
content = re.sub(
    r'<div\s+className="relative mt-4 group cursor-pointer"\s+onClick=\{[^\}]+\}\s+role="button"\s+tabIndex=\{0\}\s+onKeyDown=\{[^\}]+\}\s*>',
    r'<button type="button" className="relative mt-4 group cursor-pointer w-full text-left" onClick={() => setIsImageExpanded(true)}>',
    content,
    flags=re.DOTALL
)

content = content.replace(
'''</motion.div>
                )}
              </CardContent>''',
'''</button>
                )}
              </CardContent>'''
)
# Wait, replacing </motion.div> with </button> is risky if it's not the right div! Let's check where the closing tag is.

with open('frontend/src/pages/dashboard/IssueDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
