import autocannon from 'autocannon';

const URL = 'http://localhost:5000';
const DURATION = 10;
const CONCURRENCY_LEVELS = [1, 10, 25, 50, 100];
const LIMITS = [10, 50, 100];

async function runBenchmark(name: string, url: string, connections: number) {
  console.log(`\n========================================`);
  console.log(`Running benchmark: ${name}`);
  console.log(`URL: ${url}`);
  console.log(`Connections: ${String(connections)}, Duration: ${String(DURATION)}s`);
  console.log(`========================================`);

  return new Promise((resolve, reject) => {
    autocannon(
      {
        url,
        connections: connections,
        duration: DURATION,
      },
      (err, result) => {
        if (err) {
          console.error(err);
          reject(new Error(String(err)));
          return;
        }

        console.log(`Requests/sec: ${String(result.requests.average)}`);
        console.log(`Latency p50: ${String(result.latency.p50)} ms`);
        console.log(`Latency p99: ${String(result.latency.p99)} ms`);
        console.log(`Total Requests: ${String(result.requests.total)}`);
        console.log(`Errors: ${String(result.errors)}`);
        console.log(`Timeouts: ${String(result.timeouts)}`);

        if (result.errors > 0 || result.timeouts > 0) {
          reject(
            new Error(
              `Benchmark "${name}" failed: ${String(result.errors)} errors, ${String(result.timeouts)} timeouts`,
            ),
          );
          return;
        }

        resolve(result);
      },
    );
  });
}

async function main() {
  console.log('Starting API Benchmarks Grid...');

  try {
    for (const limit of LIMITS) {
      for (const connections of CONCURRENCY_LEVELS) {
        await runBenchmark(
          `Public Products (Limit ${String(limit)})`,
          `${URL}/api/products?limit=${String(limit)}`,
          connections,
        );
      }
    }

    console.log('\nAll benchmarks finished.');
    process.exit(0);
  } catch (err) {
    console.error('Benchmark failed:', err);
    process.exit(1);
  }
}

void main();
