const http = require('http');

async function measure(limit) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000/api/products?limit=${limit}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(Buffer.byteLength(data, 'utf8')));
    });
  });
}

async function main() {
  console.log(`limit=1: ${await measure(1)} bytes`);
  console.log(`limit=20: ${await measure(20)} bytes`);
  console.log(`limit=50: ${await measure(50)} bytes`);
}

main();
