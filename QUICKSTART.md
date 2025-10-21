# Aurora POS - Quick Start Guide

## Instant Local Testing

### 1. Start the Backend Server

```bash
cd server
npm start
```

The API server will start on **http://localhost:4000**

### 2. Start the Frontend (New Terminal)

```bash
cd client
npm run dev
```

The web app will open at **http://localhost:5173**

### 3. Login Credentials

**Manager Account:**
- Username: `manager`
- Password: `Manager@123`

**Associate Account:**
- Username: `associate`
- Password: `Associate@123`

## What You Can Test Immediately

### Dashboard
- View multi-property KPIs
- Switch between properties
- See occupancy rates, revenue, payment mix

### Rooms
- View all rooms in a grid layout
- Double-click any room to create a booking
- Walk through the 6-step check-in flow:
  1. Enter guest information
  2. Upload ID (placeholder for OCR)
  3. Set check-in/check-out dates
  4. Choose payment method (Cash, Card, Cash App)
  5. Signature capture (placeholder)
  6. Confirmation and receipt

### Reports
- Select date range and report type
- Run revenue, occupancy, or payment mix reports
- Export as PDF or CSV

### Settings
- Update branding information
- Manage rooms and room types
- Configure tax profiles
- Create/edit users and assign roles

### Search
- Search across guests, reservations, and payments
- Works even when offline

## Offline Testing

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Check "Offline" to simulate network disconnection
4. Create a booking - it will queue locally
5. Uncheck "Offline" to reconnect
6. Watch the booking sync automatically

## Testing Different Roles

### Manager Role
- Full access to all features
- Can void/refund transactions
- Can export reports
- Can manage users and settings

### Associate Role
- Can create and view reservations
- Can view reports (but not export)
- Cannot modify settings
- Cannot manage users

## Docker Deployment

```bash
# Build the image
docker build -t aurora-pos .

# Run the container
docker run -p 4000:4000 aurora-pos
```

Access at http://localhost:4000

## Database Location

The SQLite database is at: `aurora-pos.db`

To reset the database:
```bash
cd server
rm ../aurora-pos.db
npm run seed
```

## API Testing

The GraphQL playground is available at:
**http://localhost:4000/graphql**

REST API base URL:
**http://localhost:4000/api**

## Key Features to Try

1. **Multi-Property Management**: Switch between properties in the dashboard
2. **Offline Support**: Disconnect and create bookings, then reconnect to sync
3. **Payment Flow**: Try Cash, Card, and Cash App payment methods
4. **Report Generation**: Export reports as PDF or CSV
5. **Role-Based Access**: Login as manager vs associate to see different permissions
6. **Real-time KPIs**: Watch occupancy and revenue update as you create bookings

## Troubleshooting

**Port already in use:**
```bash
# Change the port in server/.env or client/vite.config.ts
```

**Database not seeded:**
```bash
cd server
npm run seed
```

**Build fails:**
```bash
# Clean install dependencies
cd client && rm -rf node_modules && npm install
cd ../server && rm -rf node_modules && npm install
```

---

**Enjoy testing Aurora POS!**
