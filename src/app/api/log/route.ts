import { NextRequest, NextResponse } from 'next/server';
import { logToElasticsearch, ElasticsearchLog } from '@/lib/elasticsearch-http';

export async function POST(request: NextRequest) {
  try {
    const logData: Omit<ElasticsearchLog, 'timestamp'> = await request.json();

    // Validate required fields
    if (!logData.tab || !logData.action || !logData.user_session) {
      return NextResponse.json(
        { error: 'Missing required fields: tab, action, or user_session' },
        { status: 400 }
      );
    }

    // Log to Elasticsearch using HTTP
    const logId = await logToElasticsearch(logData);

    return NextResponse.json({
      success: true,
      logId: logId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging to Elasticsearch:', error);

    return NextResponse.json(
      {
        error: 'Failed to log data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
