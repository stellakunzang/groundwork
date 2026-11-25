import fs from 'fs';
import { expect, test } from '@playwright/test';

test.use({ video: 'on' });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = 'nextjs-portal { display: none !important; }';
    document.documentElement.appendChild(style);
  });
});

test('walks the sample search', async ({ page }) => {
  fs.mkdirSync('docs/screenshots', { recursive: true });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Gryzzl' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sweetums' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'You got the offer' })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/pipeline.png', fullPage: true });
  await page.waitForTimeout(1200);

  await page.getByRole('button', { name: /Ghosted/ }).click();
  await expect(page.getByRole('heading', { name: 'Sweetums' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Gryzzl' })).toHaveCount(0);
  await page.waitForTimeout(800);

  await page.getByRole('button', { name: /^All/ }).click();
  await page.getByRole('link', { name: /Gryzzl/ }).click();
  await expect(page.getByRole('heading', { name: 'Gryzzl', level: 1 })).toBeVisible();
  await expect(page.getByText('Talked through a boring, reliable design.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/company.png', fullPage: true });
  await page.waitForTimeout(1200);

  await page.goto('/insights');
  await expect(page.getByRole('heading', { name: 'Weekly activity report' })).toBeVisible();
  await expect(page.getByText('A copy-paste log of applications, interviews, and outreach')).toBeVisible();
  await expect(page.getByRole('textbox')).toContainText('Gryzzl');
  await page.screenshot({ path: 'docs/screenshots/momentum.png', fullPage: true });
  await page.waitForTimeout(1200);
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.title !== 'walks the sample search') return;
  const video = page.video();
  if (!page.isClosed()) await page.close();
  if (video) await video.saveAs('docs/demo.webm');
});

test('opens a new chapter and lands on the company', async ({ page }) => {
  await page.goto('/companies/new');
  await page.locator('form input[type="text"]').nth(0).fill('Jurassic Fork');
  await page.locator('form input[type="text"]').nth(1).fill('Line cook');
  await page.getByRole('button', { name: /Begin this Chapter/ }).click();

  await expect(page.getByRole('heading', { name: 'Jurassic Fork', level: 1 })).toBeVisible();
  await expect(page.getByText('Line cook')).toBeVisible();
});
