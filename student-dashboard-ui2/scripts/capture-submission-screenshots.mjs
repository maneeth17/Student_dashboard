import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const APP_URL = process.env.APP_URL || "http://127.0.0.1:3002";
const ROOT = path.resolve(process.cwd(), "..");
const OUT_DIR = path.join(ROOT, "assets", "submission-screenshots");

const mockStudents = [
  { id: 101, name: "Aarav Singh", branch: "CSE", studentYear: 3, attendancePercentage: 88 },
  { id: 102, name: "Diya Reddy", branch: "ECE", studentYear: 2, attendancePercentage: 79 },
  { id: 103, name: "Ishaan Patel", branch: "AI", studentYear: 1, attendancePercentage: 67 },
  { id: 104, name: "Meera Nair", branch: "IT", studentYear: 4, attendancePercentage: 92 },
  { id: 105, name: "Rohan Gupta", branch: "MECH", studentYear: 2, attendancePercentage: 53 },
  { id: 106, name: "Sneha Verma", branch: "CSE", studentYear: 1, attendancePercentage: 48 }
];

fs.mkdirSync(OUT_DIR, { recursive: true });

async function wireMockApi(page) {
  await page.route("**/api/students/average-attendance", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(71.2)
    });
  });

  await page.route("**/api/students/**", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
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

  await page.route("**/auth/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "mock-token", role: "ADMIN", username: "maneeth" })
    });
  });
}

const browser = await chromium.launch({ headless: true });

try {
  const authContext = await browser.newContext({ viewport: { width: 1680, height: 980 } });
  const authPage = await authContext.newPage();
  await authPage.goto(APP_URL, { waitUntil: "networkidle" });
  await authPage.waitForTimeout(1200);
  await authPage.screenshot({ path: path.join(OUT_DIR, "01-login-page.png"), fullPage: true });

  await authPage.getByRole("button", { name: "Register" }).click();
  await authPage.waitForTimeout(900);
  await authPage.screenshot({ path: path.join(OUT_DIR, "02-register-page.png"), fullPage: true });
  await authContext.close();

  const appContext = await browser.newContext({ viewport: { width: 1800, height: 1100 } });
  await appContext.addInitScript(() => {
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("role", "ADMIN");
    localStorage.setItem("username", "maneeth");
  });

  const page = await appContext.newPage();
  await wireMockApi(page);

  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(OUT_DIR, "03-dashboard-overview.png"), fullPage: true });

  await page.getByRole("button", { name: "Students" }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, "04-students-list-filters.png"), fullPage: true });

  const deleteBtn = page.locator("button", { hasText: "Delete" }).first();
  if (await deleteBtn.count()) {
    await deleteBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, "05-delete-confirmation-dialog.png"), fullPage: true });
    const cancelBtn = page.locator("button", { hasText: "Cancel" }).first();
    if (await cancelBtn.count()) {
      await cancelBtn.click();
      await page.waitForTimeout(450);
    }
  }

  await page.locator("tbody tr").first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT_DIR, "06-student-details-drawer.png"), fullPage: true });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  await page.getByRole("button", { name: "At Risk" }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT_DIR, "07-at-risk-filter-view.png"), fullPage: true });

  await page.getByRole("button", { name: "Dashboard" }).click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Fill Demo" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, "08-add-student-form.png"), fullPage: true });

  await appContext.close();
} finally {
  await browser.close();
}

console.log("Submission screenshots generated in:", OUT_DIR);
