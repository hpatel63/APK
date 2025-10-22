import { getDb, migrate } from '../src/db/index.js';
import seed from './util/seedHelper.js';

beforeAll(async () => {
  const db = await getDb();
  await migrate(db);
  await seed(db);
});
