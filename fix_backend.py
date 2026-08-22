with open('backend/app/api/auth.py', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('ERROR_INCORRECT_CREDENTIALS = ERROR_INCORRECT_CREDENTIALS', 'ERROR_INCORRECT_CREDENTIALS = "Incorrect email or password"')
with open('backend/app/api/auth.py', 'w', encoding='utf-8') as f:
    f.write(content)

with open('backend/app/api/dependencies.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix dependencies.py
content = content.replace(
    '    if user_level >= 4:\n        pass\n    elif user_level == 1:',
    '    if user_level == 1:'
)
content = content.replace(
    '''        if issue.assigned_officer_id != user.id:
            if (
                user.department
                and issue.suggested_department
                and user.department != issue.suggested_department
            ):''',
    '''        if issue.assigned_officer_id != user.id and (
            user.department
            and issue.suggested_department
            and user.department != issue.suggested_department
        ):'''
)
with open('backend/app/api/dependencies.py', 'w', encoding='utf-8') as f:
    f.write(content)

