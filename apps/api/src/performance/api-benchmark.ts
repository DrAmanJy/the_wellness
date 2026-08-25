import autocannon from 'autocannon';

const URL = 'http://localhost:5000';
const DURATION = 10;
const CONCURRENCY_LEVELS = [1, 10, 25, 50, 100];

async function runBenchmark(name: string, url: string, connections: number) {
  console.log(`\n========================================`);
  console.log(`Running benchmark: ${name}`);
  console.log(`URL: ${url}`);
  console.log(`Connections: ${connections}, Duration: ${DURATION}s`);
  console.log(`========================================`);
  
  return new Promise((resolve, reject) => {
    autocannon({
      url,
      connections: connections,
      duration: DURATION,
    }, (err, result) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      
      console.log(`Requests/sec: ${result.requests.average}`);
      console.log(`Latency p50: ${result.latency.p50} ms`);
      console.log(`Latency p99: ${result.latency.p99} ms`);
      console.log(`Total Requests: ${result.requests.total}`);
      console.log(`Errors: ${result.errors}`);
      console.log(`Timeouts: ${result.timeouts}`);
      
      resolve(result);
    });
  });
}

async function main() {
  console.log('Starting API Benchmarks Grid...');
  
  try {
    for (const limit of LIMITS) {
      for (const connections of CONCURRENCY_LEVELS) {
        await runBenchmark(`Public Products (Limit ${limit})`, `${URL}/api/products?limit=${limit}`, connections);
      }
    }
    
    console.log('\nAll benchmarks finished.');
    process.exit(0);
  } catch (err) {
    console.error('Benchmark failed:', err);
    process.exit(1);
  }
}

main();
