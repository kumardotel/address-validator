import { NextResponse } from 'next/server';
import { getRecentLogs } from '@/lib/elasticsearch-http';

export async function GET() {
  try {
    const logs = await getRecentLogs(50); // Get last 50 logs

    return NextResponse.json({
      logs,
      count: logs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching logs:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch logs',
        logs: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
