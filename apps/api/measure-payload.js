const http = require('http');

async function measure(limit) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:5000/api/products?limit=${limit}`, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(Buffer.byteLength(data, 'utf8')));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  try {
    console.log(`limit=1: ${await measure(1)} bytes`);
    console.log(`limit=20: ${await measure(20)} bytes`);
    console.log(`limit=50: ${await measure(50)} bytes`);
  } catch (err) {
    console.error('Error during measurement:', err.message);
  }
}

main();
