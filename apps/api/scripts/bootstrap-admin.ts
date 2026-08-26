import { db, role, userRole, user, eq, and } from '@wellness/db';

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

    // Ensure admin role exists
    let adminRole = await db.query.role.findFirst({
      where: eq(role.name, 'admin'),
    });

    if (!adminRole) {
      const [newRole] = await db
        .insert(role)
        .values({
          id: crypto.randomUUID(),
          name: 'admin',
        })
        .returning();

      if (!newRole) {
        throw new Error('Failed to create admin role');
      }

      adminRole = newRole;
      console.log('Created admin role.');
    }

    // Check if user already has admin role
    const existingUserRole = await db.query.userRole.findFirst({
      where: and(eq(userRole.userId, userId), eq(userRole.roleId, adminRole.id)),
    });

    if (existingUserRole) {
      console.log(`User ${userId} is already an admin.`);
      process.exit(0);
    }

    // Assign admin role
    await db.insert(userRole).values({
      userId,
      roleId: adminRole.id,
    });

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
