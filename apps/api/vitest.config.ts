import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/wellness',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/server.ts',
        'src/lib/razorpay.ts',
        'src/performance/**',
        'scripts/**',
        '**/*.test.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 85,
        functions: 80,
        lines: 80,
      },
    },
  },
});
