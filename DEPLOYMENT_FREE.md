# Vercel + Render Free Tier Deployment

**Status:** Backend on Render (Free), Dashboard on Vercel (Free)  
**Cost:** $0/month  
**Limitations:** Services sleep after 15 min, wake in ~30-60 sec

---

## Step 1: Deploy Backend to Render

### Option A: Using Blueprint (Easiest)

1. **Go to:** https://render.com/dashboard
2. **Sign up** with GitHub
3. **New → Blueprint**
4. **Connect repository:** `rajeev-chaurasia/volt-stream`
5. **Render will auto-detect** `render.yaml`
6. **Click "Apply"**
7. **Wait ~10 minutes** for all services to build

### Option B: Manual Deployment

**If blueprint doesn't work, deploy each service manually:**

1. **Deploy Kafka:**
   - New Web Service
   - Repository: volt-stream
   - Name: voltstream-kafka
   - Dockerfile: Dockerfile.kafka-combined
   - Plan: Free

2. **Deploy InfluxDB:**
   - New Web Service
   - Repository: volt-stream
   - Name: voltstream-influxdb
   - Dockerfile: Dockerfile.influxdb
   - Plan: Free
   - Add environment variables (see render.yaml)

3. **Deploy gRPC Server, Workers, Simulator**
   - Follow same pattern for each service
   - Set environment variables to point to Kafka/InfluxDB

---

## Step 2: Get Backend URLs

After all services deploy, note these URLs:

```
Kafka: voltstream-kafka.onrender.com:XXXXX
InfluxDB: voltstream-influxdb.onrender.com
gRPC: voltstream-grpc.onrender.com:50051
```

---

## Step 3: Deploy Dashboard to Vercel

```bash
cd dashboard-ui

# Create environment file
cat > .env.production <<EOF
# Point to your Render backend
KAFKA_BROKER=voltstream-kafka.onrender.com:10000
NEXT_PUBLIC_API_URL=https://your-dashboard.vercel.app
EOF

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Set Environment Variables in Vercel

1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Add:
   - `KAFKA_BROKER` = `voltstream-kafka.onrender.com:10000`

---

## Step 4: Test the System

1. **Open Vercel dashboard URL**
2. **Wait ~60 seconds** (services waking up)
3. **Refresh page**
4. **See data flowing!**

---

## Important Notes

### Free Tier Limitations

**Services sleep after 15 min of no activity**
- First visit takes 30-60 seconds to wake
- Subsequent visits are instant (while active)

**How to handle:**
1. Add loading state to dashboard
2. Show "Waking up services..." message
3. Auto-retry after wake time

**Updated Dashboard Code:**

```typescript
// dashboard-ui/app/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isWaking, setIsWaking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Try to connect
    const eventSource = new EventSource('/api/stream');
    
    eventSource.onopen = () => {
      setIsWaking(false);
    };

    eventSource.onerror = () => {
      if (retryCount < 3) {
        setIsWaking(true);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          window.location.reload();
        }, 15000); // Retry after 15s
      }
    };

    return () => eventSource.close();
  }, [retryCount]);

  if (isWaking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-xl">Waking up services...</p>
          <p className="text-sm text-gray-400">This takes ~30-60 seconds on free tier</p>
        </div>
      </div>
    );
  }

  return <YourDashboard />;
}
```

---

## Cost Breakdown

| Service | Hours/Month | Sleep Behavior | Cost |
|---------|-------------|----------------|------|
| Kafka | 750 free | Sleeps after 15min | $0 |
| InfluxDB | 750 free | Sleeps after 15min | $0 |
| gRPC Server | 750 free | Sleeps after 15min | $0 |
| Workers | 750 free | Sleeps after 15min | $0 |
| Vercel Dashboard | Unlimited | Never sleeps | $0 |
| **Total** | | | **$0/month** |

---

## Tips for Best Performance

### 1. Keep Services Awake (Optional)

Use free service like UptimeRobot to ping every 14 minutes:

```
https://uptimerobot.com
Add monitors for:
- voltstream-grpc.onrender.com
- voltstream-kafka.onrender.com
- voltstream-influxdb.onrender.com
```

**Result:** Services stay awake 24/7 on free tier!

### 2. Reduce System Load

```bash
# In render.yaml, set simulator to:
NUM_VEHICLES: "25"  # Instead of 50
SEND_FREQUENCY_HZ: "1"  # Instead of 2
```

Lighter load = more stable on free tier

### 3. Add Demo Mode Fallback

If backend is asleep, show demo data:

```typescript
// dashboard-ui/app/api/stream/route.ts
export async function GET() {
  try {
    const backendResponse = await fetch(
      process.env.KAFKA_BROKER,
      { signal: AbortSignal.timeout(10000) }
    );
    
    if (!backendResponse.ok) throw new Error('Backend sleeping');
    
    return proxyBackendStream(backendResponse);
  } catch (error) {
    console.log('Backend asleep, using demo mode');
    return generateDemoStream(); // Fallback
  }
}
```

---

## Troubleshooting

### Services won't start?
- Check Render logs for each service
- Verify environment variables are set
- Ensure Dockerfiles are in repo root

### Dashboard shows no data?
- Wait 60 seconds for services to wake
- Check browser console for errors
- Verify KAFKA_BROKER env var in Vercel

### Kafka connection fails?
- Render free tier has network limitations
- Services must communicate via internal URLs
- Use service names, not public URLs

---

## Upgrade Path

**If you want to eliminate sleep:**

1. **Upgrade Kafka to Starter:** $7/month (always on)
2. **Keep everything else free**
3. **Total cost:** $7/month with no sleep!

---

## Next Steps

1. ✅ Deploy to Render (use blueprint)
2. ✅ Deploy to Vercel
3. ✅ Test with 60-second wake time
4. ✅ (Optional) Add UptimeRobot for 24/7 uptime
5. ✅ Update README with live URLs

**You'll have a fully functional system for $0!** 🎉
