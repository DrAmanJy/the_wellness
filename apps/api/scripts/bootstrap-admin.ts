import { db, role, userRole, user } from '@wellness/db';
import { eq } from 'drizzle-orm';

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
      adminRole = newRole;
      console.log('Created admin role.');
    }

    // Check if user already has admin role
    const existingUserRole = await db.query.userRole.findFirst({
      where: (userRole, { and, eq }) =>
        and(eq(userRole.userId, userId), eq(userRole.roleId, adminRole!.id)),
    });

    if (existingUserRole) {
      console.log(`User ${userId} is already an admin.`);
      process.exit(0);
    }

    // Assign admin role
    await db.insert(userRole).values({
      userId,
      roleId: adminRole!.id,
    });

    console.log(`Successfully assigned admin role to user ${userId}.`);
    process.exit(0);
  } catch (error) {
    console.error('Bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrap();
