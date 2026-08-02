import { chromium } from 'playwright';

type BenchmarkResult = Record<string, unknown>;

const url = process.argv[2] ?? 'http://127.0.0.1:4173/benchmarks/delegated-tooltip/?count=1000&recycleRounds=3';
const iterations = Number(process.argv[3] ?? 5);
const executablePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage();
const results: BenchmarkResult[][] = [];

for (let iteration = 0; iteration < iterations; iteration += 1) {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() =>
    Boolean((window as Window & { __delegatedTooltipBenchmark?: unknown }).__delegatedTooltipBenchmark),
  );
  results.push(
    await page.evaluate(
      () => (window as Window & { __delegatedTooltipBenchmark: BenchmarkResult[] }).__delegatedTooltipBenchmark,
    ),
  );
}

await browser.close();
console.log(JSON.stringify({ url, iterations, results }, null, 2));
