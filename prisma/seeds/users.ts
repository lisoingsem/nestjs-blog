// All logic commented out to skip this seed as requested and avoid build errors
// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';
// 
// const prisma = new PrismaClient();
// 
// export async function seedUsers() {
//   // Create test users
//   const passwordHash = await bcrypt.hash('password123', 10);
// 
//   // Find roles
//   const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
//   const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
// 
//   if (!adminRole || !userRole) {
//     throw new Error('Required roles not found. Run permissions seeder first.');
//   }
// 
//   // Upsert admin user
//   const adminUser = await prisma.user.upsert({
//     where: { email: 'admin@example.com' },
//     update: {},
//     create: {
//       email: 'admin@example.com',
//       name: 'Admin User',
//       password: passwordHash,
//     },
//   });
// 
//   // Upsert regular user
//   const regularUser = await prisma.user.upsert({
//     where: { email: 'user@example.com' },
//     update: {},
//     create: {
//       email: 'user@example.com',
//       name: 'Regular User',
//       password: passwordHash,
//     },
//   });
// 
//   // Assign roles to users
//   await prisma.userRole.upsert({
//     where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
//     update: {},
//     create: {
//       userId: adminUser.id,
//       roleId: adminRole.id,
//       assignedBy: adminUser.id, // Admin assigns role to themselves
//     },
//   });
// 
//   await prisma.userRole.upsert({
//     where: { userId_roleId: { userId: regularUser.id, roleId: userRole.id } },
//     update: {},
//     create: {
//       userId: regularUser.id,
//       roleId: userRole.id,
//       assignedBy: adminUser.id, // Admin assigns role to regular user
//     },
//   });
// 
//   console.log('✅ Seeded users');
// } 