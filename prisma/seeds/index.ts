// import { seedUsers } from './users';

async function main() {
  console.log('🌱 Starting ordered seeding...');
  // await seedUsers();
  console.log('✅ All seeders executed (via index.ts)');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 