import { getDb, migrate } from './index.js';
import { seedDatabase } from './seedData.js';

async function seed() {
  const db = await getDb();
  await migrate(db);
  await seedDatabase(db);
  console.log('Seed complete');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
