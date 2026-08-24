import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { env } from '@wellness/config';
import { db, role, userRole, eq } from '@wellness/db';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Assign customer role by default
          try {
            const customerRole = await db.query.role.findFirst({
              where: eq(role.name, 'customer'),
            });

            if (customerRole) {
              await db.insert(userRole).values({
                userId: user.id,
                roleId: customerRole.id,
              });
            }
          } catch (error) {
            console.error('Failed to assign default role:', error);
          }
        },
      },
    },
  },
});
