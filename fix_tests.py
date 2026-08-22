with open('backend/seed.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"admin@hero.ai"', 'ADMIN_EMAIL')
content = content.replace('ADMIN_EMAIL = ADMIN_EMAIL', 'ADMIN_EMAIL = "admin@hero.ai"')
# Add constant if it's not there
if 'ADMIN_EMAIL = "admin@hero.ai"' not in content:
    content = 'ADMIN_EMAIL = "admin@hero.ai"\n' + content

content = content.replace('"Road & Transport"', 'CAT_ROAD')
if 'CAT_ROAD = "Road & Transport"' not in content:
    content = 'CAT_ROAD = "Road & Transport"\n' + content

content = content.replace('"Waste Management"', 'CAT_WASTE')
if 'CAT_WASTE = "Waste Management"' not in content:
    content = 'CAT_WASTE = "Waste Management"\n' + content

with open('backend/seed.py', 'w', encoding='utf-8') as f:
    f.write(content)


with open('backend/run_e2e_tests.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"**/dashboard"', 'URL_DASHBOARD')
if 'URL_DASHBOARD = "**/dashboard"' not in content:
    content = content.replace('INPUT_EMAIL =', 'URL_DASHBOARD = "**/dashboard"\nINPUT_EMAIL =')

content = content.replace('"text=Logout"', 'TXT_LOGOUT')
if 'TXT_LOGOUT = "text=Logout"' not in content:
    content = content.replace('INPUT_EMAIL =', 'TXT_LOGOUT = "text=Logout"\nINPUT_EMAIL =')

# Fix async file save
content = content.replace(
'''            # Save logs
            with open(f"{E2E_DIR}/logs/console_logs.json", "w") as f:
                json.dump(console_logs, f, indent=2)
            with open(f"{E2E_DIR}/logs/js_errors.json", "w") as f:
                json.dump(js_errors, f, indent=2)
            with open(f"{E2E_DIR}/logs/network_errors.json", "w") as f:
                json.dump(network_errors, f, indent=2)''',
'''            # Return logs to save them synchronously outside this async function
            return console_logs, js_errors, network_errors'''
)

content = content.replace(
'''if __name__ == "__main__":
    asyncio.run(run_tests())''',
'''if __name__ == "__main__":
    logs, j_err, n_err = asyncio.run(run_tests())
    with open(f"{E2E_DIR}/logs/console_logs.json", "w") as f:
        json.dump(logs, f, indent=2)
    with open(f"{E2E_DIR}/logs/js_errors.json", "w") as f:
        json.dump(j_err, f, indent=2)
    with open(f"{E2E_DIR}/logs/network_errors.json", "w") as f:
        json.dump(n_err, f, indent=2)'''
)

with open('backend/run_e2e_tests.py', 'w', encoding='utf-8') as f:
    f.write(content)
