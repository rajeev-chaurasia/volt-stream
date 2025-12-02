import { NextRequest, NextResponse } from 'next/server';
import {
  getSpeedStatistics,
  getAlertFrequency,
  getAlertDistribution,
  getSummaryStats,
  getTirePressureStats,
} from '@/lib/influx-analytics';
import { USE_DEMO_MODE } from '@/lib/constants';
import {
  generateSummaryStats,
  generateSpeedStats,
  generateAlertFrequency,
  generateAlertDistribution,
  generateTirePressureStats,
  parseTimeRangeToHours,
} from '@/lib/demo-data';

/**
 * Analytics API Route
 * 
 * Fetches historical telemetry data from InfluxDB.
 * All queries run in parallel for faster response times.
 * 
 * Query Parameters:
 * - timeRange: Time window (e.g., -1h, -24h, -7d)
 * - type: Data type (summary, speed, alerts, distribution, tire_pressure, all)
 * 
 * Caching:
 * - 60 second HTTP cache
 * - Fallback to empty data on errors
 */

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

interface AnalyticsResponse {
  summary?: any;
  speedStats?: any[];
  alertFrequency?: any[];
  alertDistribution?: any[];
  tirePressure?: any[];
  timestamp: number;
  cached: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeRange = searchParams.get('timeRange') || '-1h';
  const queryType = searchParams.get('type') || 'all';

  try {
    const result: AnalyticsResponse = {
      timestamp: Date.now(),
      cached: false,
    };
    
    // Demo Mode: Return simulated data
    if (USE_DEMO_MODE) {
      const hours = parseTimeRangeToHours(timeRange);
      
      switch (queryType) {
        case 'summary':
          result.summary = generateSummaryStats();
          break;
        case 'speed':
          result.speedStats = generateSpeedStats(hours);
          break;
        case 'alerts':
          result.alertFrequency = generateAlertFrequency();
          break;
        case 'distribution':
          result.alertDistribution = generateAlertDistribution(hours);
          break;
        case 'tire_pressure':
          result.tirePressure = generateTirePressureStats();
          break;
        case 'all':
        default:
          result.summary = generateSummaryStats();
          result.speedStats = generateSpeedStats(hours);
          result.alertFrequency = generateAlertFrequency();
          result.alertDistribution = generateAlertDistribution(hours);
          result.tirePressure = generateTirePressureStats();
          break;
      }
      
      return NextResponse.json(result, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=30',
          'Content-Type': 'application/json',
        },
      });
    }

    // Execute queries based on type
    switch (queryType) {
      case 'summary':
        result.summary = await getSummaryStats(timeRange);
        break;

      case 'speed':
        result.speedStats = await getSpeedStatistics(timeRange);
        break;

      case 'alerts':
        result.alertFrequency = await getAlertFrequency(timeRange);
        break;

      case 'distribution':
        result.alertDistribution = await getAlertDistribution(timeRange);
        break;

      case 'tire_pressure':
        result.tirePressure = await getTirePressureStats(timeRange);
        break;

      case 'all':
      default:
        // Execute all queries in parallel for efficiency
        const [summary, speedStats, alertFrequency, alertDistribution, tirePressure] = 
          await Promise.allSettled([
            getSummaryStats(timeRange),
            getSpeedStatistics(timeRange),
            getAlertFrequency(timeRange),
            getAlertDistribution(timeRange),
            getTirePressureStats(timeRange),
          ]);

        // Extract successful results with fallbacks
        result.summary = summary.status === 'fulfilled' ? summary.value : {
          total_vehicles: 0,
          total_events: 0,
          total_alerts: 0,
          avg_temp: 0,
          avg_speed: 0,
        };

        result.speedStats = speedStats.status === 'fulfilled' ? speedStats.value : [];
        result.alertFrequency = alertFrequency.status === 'fulfilled' ? alertFrequency.value : [];
        result.alertDistribution = alertDistribution.status === 'fulfilled' ? alertDistribution.value : [];
        result.tirePressure = tirePressure.status === 'fulfilled' ? tirePressure.value : [];
        break;
    }

    // Return with aggressive caching headers
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    
    // Return error with fallback data
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        cached: false,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Health check endpoint
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
