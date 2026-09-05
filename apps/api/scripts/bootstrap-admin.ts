import { db, user, eq } from '@wellness/db';

async function bootstrap() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('Usage: pnpm run bootstrap-admin <user-id>');
    process.exit(1);
  }

  try {
    // Check if user exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      console.error(`User with ID ${userId} not found.`);
      process.exit(1);
    }

    if (existingUser.role === 'admin') {
      console.log(`User ${userId} is already an admin.`);
      process.exit(0);
    }

    // Assign admin role directly on user table
    await db.update(user).set({ role: 'admin' }).where(eq(user.id, userId));

    console.log(`Successfully assigned admin role to user ${userId}.`);
    process.exit(0);
  } catch (error) {
    console.error('Bootstrap failed:', error);
    process.exitCode = 1;
  }
}

void bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
