async function main() {
  await import('./permissions');
  await import('./users');
}

main()
  .then(() => {
    console.log('✅ All seeders executed (via index.ts)');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 