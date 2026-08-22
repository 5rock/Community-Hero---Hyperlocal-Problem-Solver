import re

with open('frontend/src/pages/dashboard/IssueDetails.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. parseInt -> Number.parseInt
content = content.replace('parseInt(id as string)', 'Number.parseInt(id as string)')

# 2. Extract ternaries
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
content = content.replace(
'''<div
                    className="relative mt-4 group cursor-pointer"
                    onClick={() => setIsImageExpanded(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setIsImageExpanded(true)
                      }
                    }}
                  >''',
'''<button type="button" className="relative mt-4 group cursor-pointer w-full text-left" onClick={() => setIsImageExpanded(true)}>'''
)
content = content.replace(
'''</div>
                )}
              </CardContent>''',
'''</button>
                )}
              </CardContent>'''
)

with open('frontend/src/pages/dashboard/IssueDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
