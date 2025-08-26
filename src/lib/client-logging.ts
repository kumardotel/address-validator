// Client-side logging utility that calls our API
export interface LogData {
  tab: 'verifier' | 'source';
  action: string;
  input: Record<string, any>;
  output: Record<string, any>;
  user_session: string;
}

export async function logToElasticsearch(
  logData: LogData
): Promise<string | null> {
  try {
    const response = await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Logging API error: ${errorData.error}`);
    }

    const result = await response.json();
    return result.logId;
  } catch (error) {
    console.error('Error logging to Elasticsearch:', error);
    return null;
  }
}

// Helper to generate session IDs
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
