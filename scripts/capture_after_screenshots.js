import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve('screenshots/after');

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const viewports = [
    { name: '1440px', width: 1440, height: 900, isMobile: false },
    { name: '375px', width: 375, height: 812, isMobile: true },
  ];

  for (const vp of viewports) {
    console.log(`\nCapturing after-restyle screenshots for viewport ${vp.name}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });

    // Ensure light theme is loaded initially
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.setItem('distribution_solver_theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // 1. Calculator Mode (Normal) - Light Theme "Warm Paper"
    await page.screenshot({
      path: path.join(OUT_DIR, `01_calculator_normal_${vp.name}.png`),
      fullPage: true,
    });
    console.log(`Saved 01_calculator_normal_${vp.name}.png`);

    // 2. Calculator Mode (Binomial)
    await page.select('#distSelect', 'binomial');
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, `02_calculator_binomial_${vp.name}.png`),
      fullPage: true,
    });
    console.log(`Saved 02_calculator_binomial_${vp.name}.png`);

    // 3. Ask Mode
    const askTab = await page.$('button[data-mode="ask"]');
    if (askTab) await askTab.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, `03_ask_mode_${vp.name}.png`),
      fullPage: true,
    });
    console.log(`Saved 03_ask_mode_${vp.name}.png`);

    // 4. Solved Output in Ask Mode
    const solveBtn = await page.$('#solveProblemBtn');
    if (solveBtn) await solveBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, `04_ask_solved_${vp.name}.png`),
      fullPage: true,
    });
    console.log(`Saved 04_ask_solved_${vp.name}.png`);

    // 5. Question Bank Open
    const bankBtn = await page.$('#openQuestionBankBtnHeader');
    if (bankBtn) await bankBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(OUT_DIR, `05_question_bank_${vp.name}.png`),
      fullPage: vp.name !== '375px',
    });
    console.log(`Saved 05_question_bank_${vp.name}.png`);

    // Close Question Bank
    await page.evaluate(() => {
      const btn = document.querySelector('#closeBankBtn');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // 6. Practice Variations Open
    await page.evaluate(() => {
      const varBtn = document.querySelector('#openVariationsBtnAsk') || document.querySelector('#openVariationsBtn');
      if (varBtn) varBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));
    await page.evaluate(() => {
      const revealBtn = document.querySelector('.btn-reveal');
      if (revealBtn) revealBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({
      path: path.join(OUT_DIR, `06_practice_variations_${vp.name}.png`),
      fullPage: true,
    });
    console.log(`Saved 06_practice_variations_${vp.name}.png`);

    // 7. Dark Theme ("Sepia Night") Toggle
    await page.evaluate(() => {
      const themeBtn = document.querySelector('#themeToggleBtn');
      if (themeBtn) themeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, `07_dark_theme_${vp.name}.png`),
      fullPage: true,
    });
    console.log(`Saved 07_dark_theme_${vp.name}.png`);

    await page.close();
  }

  await browser.close();
  console.log('\nAll "after" screenshots captured successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
