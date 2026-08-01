import { chromium } from 'playwright';

type BenchmarkResult = Record<string, number | number[] | undefined>;

const url =
  process.argv[2] ??
  'http://127.0.0.1:4173/benchmarks/action-title-tooltip/?count=2000&recycleRounds=5&memoryBatches=3';
const iterations = Number(process.argv[3] ?? 5);
const executablePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'],
});
const page = await browser.newPage();
const results: BenchmarkResult[] = [];

for (let iteration = 0; iteration < iterations; iteration += 1) {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() =>
    Boolean((window as Window & { __actionTooltipBenchmark?: unknown }).__actionTooltipBenchmark),
  );
  results.push(
    await page.evaluate(
      () => (window as Window & { __actionTooltipBenchmark: BenchmarkResult }).__actionTooltipBenchmark,
    ),
  );
}

await browser.close();

const median = (values: number[]) => {
  const ordered = values.toSorted((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0 ? (ordered[middle - 1]! + ordered[middle]!) / 2 : ordered[middle]!;
};

const metricNames = [
  'mountMs',
  'updateMs',
  'recycleMs',
  'unmountMs',
  'listenerAdds',
  'tooltipElementsAfterMount',
  'anchoredTriggersAfterMount',
  'tooltipElementsAfterRecycle',
  'heapBeforeBytes',
  'heapAfterRecycleBytes',
  'heapAfterUnmountBytes',
];
const medians = Object.fromEntries(
  metricNames.flatMap((name) => {
    const values = results.map((result) => result[name]).filter((value): value is number => typeof value === 'number');
    return values.length > 0 ? [[name, median(values)]] : [];
  }),
);

console.log(JSON.stringify({ url, iterations, medians, runs: results }, null, 2));
