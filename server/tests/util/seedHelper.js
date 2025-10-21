import { seedDatabase } from '../../src/db/seedData.js';

export default async function seed(db) {
  await seedDatabase(db);
}
