import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { env } from '@wellness/config';
import { db } from '@wellness/db';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins: [
    (function () {
      if (!env.CORS_ORIGIN || env.CORS_ORIGIN === '*') {
        throw new Error('CORS_ORIGIN must be a specific absolute origin, not a wildcard');
      }
      return env.CORS_ORIGIN;
    })(),
    ...(env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:4000'] : []),
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  accountLinking: {
    enabled: true,
    trustedProviders: ['google', 'apple'],
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        required: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    ...(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET
      ? {
          apple: {
            clientId: env.APPLE_CLIENT_ID,
            clientSecret: env.APPLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
});
