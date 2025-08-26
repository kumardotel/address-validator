import { NextRequest, NextResponse } from 'next/server';

const AUSTRALIA_POST_API_URL = process.env.AUSTRALIA_POST_API_URL;
const AUSTRALIA_POST_TOKEN = process.env.AUSTRALIA_POST_TOKEN;

if (!AUSTRALIA_POST_API_URL || !AUSTRALIA_POST_TOKEN) {
  console.error('Missing Australia Post API configuration:', {
    hasUrl: !!AUSTRALIA_POST_API_URL,
    hasToken: !!AUSTRALIA_POST_TOKEN,
    url: AUSTRALIA_POST_API_URL ? 'Set' : 'Missing',
    token: AUSTRALIA_POST_TOKEN ? 'Set' : 'Missing',
  });
}

interface AustraliaPostApiResponse {
  localities?: {
    locality?:
      | Array<{
          category: string;
          id: number;
          latitude?: number;
          longitude?: number;
          location: string;
          postcode: string;
          state: string;
        }>
      | {
          category: string;
          id: number;
          latitude?: number;
          longitude?: number;
          location: string;
          postcode: string;
          state: string;
        };
  };
}

export async function GET(request: NextRequest) {
  try {
    // Parse URL
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const state = url.searchParams.get('state');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!AUSTRALIA_POST_API_URL || !AUSTRALIA_POST_TOKEN) {
      console.error('Environment variables missing');
      return NextResponse.json(
        { error: 'Server configuration error - missing API credentials' },
        { status: 500 }
      );
    }

    // Build Australia Post API URL
    const params = new URLSearchParams({ q: query });
    if (state) {
      params.append('state', state);
    }

    const apiUrl = `${AUSTRALIA_POST_API_URL}?${params}`;

    // Call Australia Post API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${AUSTRALIA_POST_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Australia Post API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      return NextResponse.json(
        {
          error: `Australia Post API error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status >= 500 ? 500 : 400 }
      );
    }

    const rawData = await response.text();

    let data: AustraliaPostApiResponse;
    try {
      data = JSON.parse(rawData);
    } catch (parseError) {
      console.error(
        'Failed to parse Australia Post response as JSON:',
        parseError
      );
      return NextResponse.json(
        { error: 'Invalid response format from Australia Post API' },
        { status: 502 }
      );
    }

    let localities: any[] = [];

    if (data.localities?.locality) {
      if (Array.isArray(data.localities.locality)) {
        localities = data.localities.locality;
      } else {
        // Single locality object - convert to array
        localities = [data.localities.locality];
      }
    }

    const locations = localities.map((locality, index) => {
      const location = {
        id: locality.id || index,
        location: locality.location || '',
        postcode: locality.postcode || '',
        state: locality.state || '',
        category: locality.category || 'Unknown',
        latitude:
          typeof locality.latitude === 'number' ? locality.latitude : undefined,
        longitude:
          typeof locality.longitude === 'number'
            ? locality.longitude
            : undefined,
      };

      return location;
    });

    return NextResponse.json(
      {
        locations,
        count: locations.length,
        query,
        state,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5min cache
        },
      }
    );
  } catch (error) {
    console.error('Australia Post API Route Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to search locations',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
