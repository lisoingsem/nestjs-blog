import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Hash passwords
  const passwordHash = await bcrypt.hash('password', 10);

  // 2. Create users
  const lisoing = await prisma.user.upsert({
    where: { email: 'lisoingsem@gmail.com' },
    update: {},
    create: {
      name: 'lisoing sem',
      email: 'lisoingsem@gmail.com',
      password: passwordHash,
    },
  });

  const genrate = await prisma.user.upsert({
    where: { email: 'genrate@gmail.com' },
    update: {},
    create: {
      name: 'genrate',
      email: 'genrate@gmail.com',
      password: passwordHash,
    },
  });

  // 3. Assign roles
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const userRole = await prisma.role.findUnique({ where: { name: 'user' } });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: lisoing.id, roleId: adminRole.id } },
      update: {},
      create: {
        userId: lisoing.id,
        roleId: adminRole.id,
        assignedBy: lisoing.id,
      },
    });
  }

  if (userRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: genrate.id, roleId: userRole.id } },
      update: {},
      create: {
        userId: genrate.id,
        roleId: userRole.id,
        assignedBy: lisoing.id,
      },
    });
  }

  console.log('✅ Seeded test users and assigned roles');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 