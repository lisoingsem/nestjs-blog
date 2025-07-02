import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create default permissions
  const defaultPermissions = [
    { name: 'Create User', description: 'Can create new users', resource: 'user', action: 'create' },
    { name: 'Read User', description: 'Can view user details', resource: 'user', action: 'read' },
    { name: 'Update User', description: 'Can update user information', resource: 'user', action: 'update' },
    { name: 'Delete User', description: 'Can delete users', resource: 'user', action: 'delete' },
    { name: 'Manage Roles', description: 'Can manage user roles', resource: 'role', action: 'manage' },
    { name: 'View Audit Logs', description: 'Can view audit logs', resource: 'audit', action: 'read' },
    { name: 'Manage Permissions', description: 'Can manage permissions', resource: 'permission', action: 'manage' },
  ];

  for (const permission of defaultPermissions) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: permission.resource, action: permission.action } },
      update: {},
      create: permission,
    });defaultPermissions
  }

  // 2. Create default roles
  const defaultRoles = [
    { name: 'admin', description: 'Administrator with full access' },
    { name: 'user', description: 'Regular user with basic access' },
    { name: 'moderator', description: 'Moderator with limited admin access' },
  ];

  for (const role of defaultRoles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // 3. Assign permissions to roles
  // Admin gets all permissions
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  if (!adminRole) {
    throw new Error('Admin role not found. Make sure roles are created before assigning permissions.');
  }
  
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }

  // User gets only read user
  const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
  if (!userRole) {
    throw new Error('User role not found. Make sure roles are created before assigning permissions.');
  }
  
  const readUserPermission = await prisma.permission.findUnique({ where: { resource_action: { resource: 'user', action: 'read' } } });
  if (!readUserPermission) {
    throw new Error('Read user permission not found. Make sure permissions are created before assigning to roles.');
  }
  
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: userRole.id, permissionId: readUserPermission.id } },
    update: {},
    create: { roleId: userRole.id, permissionId: readUserPermission.id },
  });

  // Moderator gets read and update user
  const moderatorRole = await prisma.role.findUnique({ where: { name: 'moderator' } });
  if (!moderatorRole) {
    throw new Error('Moderator role not found. Make sure roles are created before assigning permissions.');
  }
  
  const updateUserPermission = await prisma.permission.findUnique({ where: { resource_action: { resource: 'user', action: 'update' } } });
  if (!updateUserPermission) {
    throw new Error('Update user permission not found. Make sure permissions are created before assigning to roles.');
  }
  
  // Assign read permission to moderator
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: moderatorRole.id, permissionId: readUserPermission.id } },
    update: {},
    create: { roleId: moderatorRole.id, permissionId: readUserPermission.id },
  });
  
  // Assign update permission to moderator
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: moderatorRole.id, permissionId: updateUserPermission.id } },
    update: {},
    create: { roleId: moderatorRole.id, permissionId: updateUserPermission.id },
  });

  console.log('✅ Seeded permissions and roles');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 