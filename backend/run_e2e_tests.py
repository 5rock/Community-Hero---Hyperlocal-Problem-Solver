import asyncio
import json
import os
from playwright.async_api import async_playwright, expect

E2E_DIR = "../e2e_artifacts"
os.makedirs(f"{E2E_DIR}/screenshots", exist_ok=True)
os.makedirs(f"{E2E_DIR}/logs", exist_ok=True)

console_logs = []
network_errors = []
js_errors = []

async def run_tests():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            record_video_dir=f"{E2E_DIR}/videos",
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        # Hooks
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda exc: js_errors.append(str(exc)))
        
        def handle_response(response):
            if response.status >= 400 and "/api/" in response.url:
                network_errors.append(f"{response.status} {response.url}")
        page.on("response", handle_response)

        BASE_URL = "http://localhost:5173"

        try:
            print("Navigating to Landing Page...")
            await page.goto(BASE_URL)
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=f"{E2E_DIR}/screenshots/01_LandingPage.png", full_page=True)

            print("Navigating to Login Page...")
            await page.goto(f"{BASE_URL}/login")
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=f"{E2E_DIR}/screenshots/02_LoginPage.png", full_page=True)
            
            print("Navigating to Signup Page...")
            await page.goto(f"{BASE_URL}/signup")
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=f"{E2E_DIR}/screenshots/03_SignupPage.png", full_page=True)

            # Log in as Citizen
            print("Logging in as Citizen...")
            await page.goto(f"{BASE_URL}/login")
            await page.fill("input[type='email']", "sarah@example.com")
            await page.fill("input[type='password']", "password")
            await page.click("button[type='submit']")
            await page.wait_for_url("**/dashboard", timeout=10000)
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=f"{E2E_DIR}/screenshots/04_CitizenDashboard.png", full_page=True)

            # Report Issue Page
            print("Navigating to Report Issue...")
            await page.goto(f"{BASE_URL}/dashboard/report")
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=f"{E2E_DIR}/screenshots/05_ReportIssue.png", full_page=True)

            # Community Map
            print("Navigating to Community Map...")
            await page.goto(f"{BASE_URL}/dashboard/map")
            await page.wait_for_load_state("networkidle")
            # Let map load tiles
            await asyncio.sleep(2)
            await page.screenshot(path=f"{E2E_DIR}/screenshots/06_CommunityMap.png", full_page=True)

            # Leaderboard
            print("Navigating to Leaderboard...")
            await page.goto(f"{BASE_URL}/dashboard/leaderboard")
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=f"{E2E_DIR}/screenshots/07_Leaderboard.png", full_page=True)

            # Logout
            print("Logging out...")
            await page.click("text=Logout")
            await page.wait_for_url("**/")

            # Log in as Officer
            print("Logging in as Officer...")
            await page.goto(f"{BASE_URL}/login")
            await page.fill("input[type='email']", "officer@hero.ai")
            await page.fill("input[type='password']", "password")
            await page.click("button[type='submit']")
            await page.wait_for_url("**/dashboard", timeout=10000)
            await page.wait_for_load_state("networkidle")
            await page.goto(f"{BASE_URL}/dashboard/officer")
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=f"{E2E_DIR}/screenshots/08_OfficerDashboard.png", full_page=True)
            await page.click("text=Logout")
            
            # Log in as Admin
            print("Logging in as Admin...")
            await page.goto(f"{BASE_URL}/login")
            await page.fill("input[type='email']", "admin@hero.ai")
            await page.fill("input[type='password']", "password")
            await page.click("button[type='submit']")
            await page.wait_for_url("**/dashboard", timeout=10000)
            await page.wait_for_load_state("networkidle")
            await page.goto(f"{BASE_URL}/dashboard/admin")
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=f"{E2E_DIR}/screenshots/09_AdminDashboard.png", full_page=True)
            await page.click("text=Logout")

            # Swagger Docs
            print("Navigating to Swagger Docs...")
            await page.goto("http://localhost:8000/docs")
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=f"{E2E_DIR}/screenshots/10_SwaggerDocs.png", full_page=True)

        except Exception as e:
            print(f"Test failed: {e}")
        finally:
            await context.close()
            await browser.close()
            
            # Save logs
            with open(f"{E2E_DIR}/logs/console_logs.json", "w") as f:
                json.dump(console_logs, f, indent=2)
            with open(f"{E2E_DIR}/logs/js_errors.json", "w") as f:
                json.dump(js_errors, f, indent=2)
            with open(f"{E2E_DIR}/logs/network_errors.json", "w") as f:
                json.dump(network_errors, f, indent=2)

            print("Testing complete.")

if __name__ == "__main__":
    asyncio.run(run_tests())
