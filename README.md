# Aurora Motel/Hotel POS + PMS

Aurora is a full-stack Motel/Hotel point-of-sale and property management system designed for multi-property operations with offline-first workflows. The project contains a Node.js/Express API with SQLite storage and a React + Redux web client optimized for landscape tablets and desktop browsers.

## Features

- Multi-property dashboard with occupancy, ADR, RevPAR, revenue KPIs, payment mix, and AI insight card.
- Rooms grid with double-click booking workflow (Guest Info → ID Upload placeholder → Rate & Stay → Payment → Signature → Confirmation).
- Offline queue backed by IndexedDB with AES hashing, banner indicator, and background sync reconciliation.
- Reports center with CSV/PDF export for revenue, occupancy, and payment mix plus daily close summary.
- Settings hub for branding, inventory, tax profiles, user management, and OpenAI toggle placeholder.
- Global search across guests, reservations, and payments that also works offline with cached data.
- Mock services for OCR, payments (tokenized card + Cash App QR placeholder), and document PDF generation.
- REST + GraphQL hybrid API with JWT auth, RBAC, audit logging, and rate limiting.
- Seeded SQLite database with two demo properties and 20 rooms each.
- Unit tests for server reservation edge cases and client dashboard rendering.

## Project Structure

```
.
├── client/              # React + Redux Toolkit frontend (Vite + Tailwind)
├── server/              # Express API with SQLite database
├── uploads/             # Generated documents (created at runtime)
├── aurora-pos.db        # SQLite database (generated/seeded)
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Seed the database
cd ../server && npm run seed
```

## Running Locally

In one terminal, start the API server:

```bash
cd server
npm run dev
```

In a second terminal, start the web client:

```bash
cd client
npm run dev
```

Open the app at [http://localhost:5173](http://localhost:5173). Log in using demo accounts:

- Manager: `manager / Manager@123`
- Associate: `associate / Associate@123`

## Testing

```bash
cd server
npm test

cd ../client
npm test
```

## API Highlights

- `POST /api/auth/login` – JWT authentication (bcrypt hashed passwords)
- `GET /api/rooms` – Property-aware inventory
- `POST /api/reservations` – Booking creation with payment + document stubs
- `POST /api/sync/apply` – Offline sync reconciliation
- `GET /api/reports/:type` – CSV/PDF exports for revenue, occupancy, payment mix
- GraphQL endpoint at `/graphql`

## Deployment

- Configure environment variables (`PORT`, `JWT_SECRET`, `DB_PATH`, `DEMO_MODE=false` for production).
- Serve the `client` build artifacts behind HTTPS (Vite `npm run build`).
- SQLite database file can be persisted using a mounted volume. For Postgres, adapt `src/db/index.js` accordingly.

## Offline & Sync Notes

- Client caches bookings in IndexedDB when offline and replays them when reconnected.
- Server prioritizes server timestamps to avoid double bookings and logs audit entries for changes.

## Mock Integrations

- OCR: Returns sample parsed ID data.
- Payments: Tokenizes cards, simulates capture/refund, and generates Cash App QR placeholder URLs.
- PDF: Generates receipts using PDFKit and template variables.

## Accessibility & UX

- Glassmorphism panels with neon hover effects and keyboard-friendly navigation.
- Responsive layout optimized for desktop and large-tablet landscape screens.
- Optional housekeeping and AI modules included in architecture for extension.

## Demo Mode

Demo mode is enabled by default to avoid real payment calls. Disable via `DEMO_MODE=false` in the server environment when integrating production payment processors.
