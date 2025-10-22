import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { graphqlHTTP } from 'express-graphql';
import multer from 'multer';
import { getDb, migrate } from './db/index.js';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, UPLOAD_DIR } from './config.js';
import authRoutes from './routes/auth.js';
import reservationsRoutes from './routes/reservations.js';
import roomsRoutes from './routes/rooms.js';
import reportsRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';
import syncRoutes from './routes/sync.js';
import searchRoutes from './routes/search.js';
import housekeepingRoutes from './routes/housekeeping.js';
import insightsRoutes from './routes/insights.js';
import { schema, createRootResolver } from './graphql/schema.js';

export async function createServer() {
  const db = await getDb();
  await migrate(db);

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));

  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
      const timestamp = Date.now();
      cb(null, `${timestamp}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });
  app.use('/uploads', express.static(UPLOAD_DIR));

  app.use('/api/auth', authRoutes(db));
  app.use('/api/reservations', reservationsRoutes(db, upload));
  app.use('/api/rooms', roomsRoutes(db));
  app.use('/api/reports', reportsRoutes(db));
  app.use('/api/settings', settingsRoutes(db, upload));
  app.use('/api/sync', syncRoutes(db));
  app.use('/api/search', searchRoutes(db));
  app.use('/api/housekeeping', housekeepingRoutes(db));
  app.use('/api/insights', insightsRoutes(db));

  app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: createRootResolver(db),
    graphiql: process.env.NODE_ENV !== 'production',
  }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return { app, db };
}

if (process.env.NODE_ENV !== 'test') {
  createServer().then(({ app }) => {
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`Aurora POS API running on port ${port}`);
    });
  }).catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
}
