export interface ElasticsearchLog {
  timestamp: string;
  tab: 'verifier' | 'source';
  action: string;
  user_session: string;
  input: Record<string, any>;
  output: Record<string, any>;
}

// Elasticsearch configuration
const ES_API_KEY = process.env.ELASTICSEARCH_API_KEY!;
const ES_NODE = process.env.ELASTICSEARCH_NODE!;
const INDEX_NAME = process.env.ELASTICSEARCH_INDEX;

// Create headers for Elasticsearch requests
function createESHeaders() {
  return {
    Authorization: `ApiKey ${ES_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

// Log data to Elasticsearch using direct HTTP
export async function logToElasticsearch(
  logData: Omit<ElasticsearchLog, 'timestamp'>
): Promise<string | null> {
  try {
    const document: ElasticsearchLog = {
      ...logData,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${ES_NODE}/${INDEX_NAME}/_doc`, {
      method: 'POST',
      headers: createESHeaders(),
      body: JSON.stringify(document),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Elasticsearch API error: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    return result._id;
  } catch (error) {
    console.error('Error logging to Elasticsearch:', error);
    return null;
  }
}

// Search logs from Elasticsearch using direct HTTP
export async function searchLogs(filters?: {
  tab?: 'verifier' | 'source';
  action?: string;
  from?: Date;
  to?: Date;
  size?: number;
}): Promise<(ElasticsearchLog & { id: string })[]> {
  try {
    const query: any = {
      bool: {
        must: [],
      },
    };

    if (filters?.tab) {
      query.bool.must.push({ term: { tab: filters.tab } });
    }

    if (filters?.action) {
      query.bool.must.push({ term: { action: filters.action } });
    }

    if (filters?.from || filters?.to) {
      const rangeQuery: any = {};
      if (filters.from) rangeQuery.gte = filters.from.toISOString();
      if (filters.to) rangeQuery.lte = filters.to.toISOString();
      query.bool.must.push({ range: { timestamp: rangeQuery } });
    }

    const searchBody = {
      query: query.bool.must.length > 0 ? query : { match_all: {} },
      sort: [{ timestamp: { order: 'desc' } }],
      size: filters?.size || 50,
    };

    const response = await fetch(`${ES_NODE}/${INDEX_NAME}/_search`, {
      method: 'POST',
      headers: createESHeaders(),
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Elasticsearch search error: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
    }));
  } catch (error) {
    console.error('Error searching logs:', error);
    return [];
  }
}

// Get recent logs for display
export async function getRecentLogs(
  limit = 10
): Promise<(ElasticsearchLog & { id: string })[]> {
  return searchLogs({ size: limit });
}

// Initialize index (if needed)
export async function initializeIndex(): Promise<void> {
  try {
    // Check if index exists
    const checkResponse = await fetch(`${ES_NODE}/${INDEX_NAME}`, {
      method: 'HEAD',
      headers: createESHeaders(),
    });

    if (checkResponse.status === 404) {
      // Create index
      const createResponse = await fetch(`${ES_NODE}/${INDEX_NAME}`, {
        method: 'PUT',
        headers: createESHeaders(),
        body: JSON.stringify({
          mappings: {
            properties: {
              timestamp: { type: 'date' },
              tab: { type: 'keyword' },
              action: { type: 'keyword' },
              user_session: { type: 'keyword' },
              input: { type: 'object' },
              output: { type: 'object' },
            },
          },
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(
          `Failed to create index: ${createResponse.status} - ${errorText}`
        );
      }
    } else {
      console.log(`Index ${INDEX_NAME} already exists`);
    }
  } catch (error) {
    console.error('Error initializing Elasticsearch index:', error);
    throw error;
  }
}

export { INDEX_NAME };
