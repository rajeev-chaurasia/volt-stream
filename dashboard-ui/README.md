# VoltStream Dashboard

Real-time Next.js dashboard for VoltStream electric vehicle fleet monitoring.

## Deployment Modes

### Production (Vercel - Demo Mode)

The live demo uses **simulated data** for zero-cost deployment:

```bash
cd dashboard-ui
vercel --prod
```

- **Data Source:** `lib/demo-data.ts` (realistic SF Bay Area simulation)
- **Cost:** $0/month
- **Perfect for:** Portfolio, sharing with recruiters

### Local Development (Real Backend)

Connect to local Kafka/InfluxDB for full functionality:

1. **Start backend services:**
```bash
# From project root
docker-compose up -d
go build -o bin/server ./cmd/server
KAFKA_BROKER=localhost:19092 ./bin/server
# ... start other services
```

2 **Run dashboard:**
```bash
cd dashboard-ui
npm install
npm run dev
```

3. **Access:** http://localhost:3000

The dashboard will automatically connect to local Kafka via the SSE endpoint.

## Environment Variables

### Production (Demo Mode)
No environment variables needed! The app uses simulated data.

### Local Development (Optional)
If you want to connect to a remote Kafka instance:

```env
# .env.local
KAFKA_BROKER=your-kafka-server:9092
KAFKA_USERNAME=optional-username
KAFKA_PASSWORD=optional-password
```

## Features

- **Real-time Updates:** Server-Sent Events at 10Hz
- **Vehicle Tracking:** Live map with 50-1000 vehicles
- **Charts:** Speed, temperature, battery metrics
- **Alerts:** Battery overheat, tire pressure, speeding
- **Responsive:** Works on mobile and desktop

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS
- **Maps:** Leaflet.js
- **Charts:** Chart.js
- **Real-time:** Server-Sent Events (SSE)

## Project Structure

```
dashboard-ui/
├── app/
│   ├── api/stream/         # SSE endpoint (demo or Kafka)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main dashboard
├── components/
│   ├── AlertFeed.tsx       # Alert notifications
│   ├── FleetMap.tsx        # Vehicle map
│   ├── MetricsBar.tsx      # Top stats
│   └── TelemetryChart.tsx  # Charts
├── lib/
│   ├── demo-data.ts        # Simulated data (production)
│   ├── constants.ts        # Config constants
│   └── types.ts            # TypeScript types
```

## Switching Between Modes

### To Use Demo Data (Default)
The app is already configured! `app/api/stream/route.ts` uses `demo-data.ts`.

### To Use Real Kafka Backend
Replace `app/api/stream/route.ts` with Kafka consumer implementation.

See the full implementation in git history or contact for guidance.

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Other Platforms
The app is a standard Next.js application and can be deployed anywhere that supports Node.js.

## License

MIT
