import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const APP_URL = "http://127.0.0.1:3000";
const ROOT = path.resolve(process.cwd(), "..");
const OUT_DIR = path.join(ROOT, "assets", "generated");

const mockStudents = [
  { id: 101, name: "Aarav Singh", branch: "CSE", studentYear: 3, attendancePercentage: 88 },
  { id: 102, name: "Diya Reddy", branch: "ECE", studentYear: 2, attendancePercentage: 79 },
  { id: 103, name: "Ishaan Patel", branch: "AI", studentYear: 1, attendancePercentage: 67 },
  { id: 104, name: "Meera Nair", branch: "IT", studentYear: 4, attendancePercentage: 92 },
  { id: 105, name: "Rohan Gupta", branch: "MECH", studentYear: 2, attendancePercentage: 53 }
];

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const loginContext = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const loginPage = await loginContext.newPage();

  await loginPage.goto(APP_URL, { waitUntil: "networkidle" });
  await loginPage.waitForTimeout(1200);
  await loginPage.screenshot({ path: path.join(OUT_DIR, "login-screen.png"), fullPage: true });

  const registerButton = loginPage.getByRole("button", { name: "Register" });
  await registerButton.click();
  await loginPage.waitForTimeout(900);
  await loginPage.screenshot({ path: path.join(OUT_DIR, "register-screen.png"), fullPage: true });
  await loginContext.close();

  const dashboardContext = await browser.newContext({ viewport: { width: 1700, height: 1100 } });
  await dashboardContext.addInitScript(() => {
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("role", "ADMIN");
    localStorage.setItem("username", "maneeth");
  });

  const dashboardPage = await dashboardContext.newPage();
  await dashboardPage.route("**/api/students/average-attendance", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(75.8)
    });
  });

  await dashboardPage.route("**/api/students", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockStudents)
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true })
    });
  });

  await dashboardPage.goto(APP_URL, { waitUntil: "networkidle" });
  await dashboardPage.waitForTimeout(1500);
  await dashboardPage.screenshot({ path: path.join(OUT_DIR, "dashboard-screen.png"), fullPage: true });
  await dashboardContext.close();
} finally {
  await browser.close();
}

console.log("UI screenshots generated in:", OUT_DIR);
