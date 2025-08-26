import { NextRequest, NextResponse } from 'next/server';
import {
  searchLocations,
  validateAddress,
  searchSuburbs,
} from '@/services/australia-post';

interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

interface GraphQLResponse {
  data?: any;
  errors?: Array<{ message: string; path?: string[] }>;
}

// Query to extract operation details
function parseGraphQLQuery(query: string): {
  operationType: string;
  operationName: string;
} {
  if (query.includes('searchLocations')) {
    return { operationType: 'query', operationName: 'searchLocations' };
  }
  if (query.includes('validateAddress')) {
    return { operationType: 'query', operationName: 'validateAddress' };
  }
  if (query.includes('searchSuburbs')) {
    return { operationType: 'query', operationName: 'searchSuburbs' };
  }
  return { operationType: 'unknown', operationName: 'unknown' };
}

export async function POST(request: NextRequest) {
  try {
    const body: GraphQLRequest = await request.json();
    const { query, variables = {} } = body;

    const { operationName } = parseGraphQLQuery(query);

    let data: any = null;
    const errors: Array<{ message: string; path?: string[] }> = [];

    try {
      switch (operationName) {
        case 'searchLocations':
          data = {
            searchLocations: await searchLocations(
              variables.query,
              variables.state
            ),
          };
          break;

        case 'validateAddress':
          const validationResult = await validateAddress(
            variables.postcode,
            variables.suburb,
            variables.state
          );

          data = {
            validateAddress: {
              isValid: validationResult.isValid,
              error: validationResult.error || null,
              matchedLocation: validationResult.matchedLocation || null,
            },
          };
          break;

        case 'searchSuburbs':
          data = {
            searchSuburbs: await searchSuburbs(variables.query, {
              state: variables.state,
              categories: variables.categories,
            }),
          };
          break;

        default:
          errors.push({ message: `Unknown operation: ${operationName}` });
      }
    } catch (error) {
      errors.push({
        message: `Failed to execute ${operationName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        path: [operationName],
      });
    }

    const response: GraphQLResponse = errors.length > 0 ? { errors } : { data };

    return NextResponse.json(response, {
      status: errors.length > 0 ? 400 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        errors: [
          {
            message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Handle OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Handle GET requests
export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    const playgroundHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lawpath GraphQL API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .endpoint { background: #f0f0f0; padding: 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Lawpath Address Validator GraphQL API</h1>
        <p><strong>Endpoint:</strong> <span class="endpoint">POST /api/graphql</span></p>
        <p><em>Note: This endpoint now proxies through /api/australia-post for consistency</em></p>
        
        <h2>Available Operations:</h2>
        <ul>
          <li><strong>searchLocations</strong> - Search for locations by query</li>
          <li><strong>validateAddress</strong> - Validate postcode, suburb, and state</li>
          <li><strong>searchSuburbs</strong> - Search suburbs with filtering</li>
        </ul>

        <h2>Test in Browser Console:</h2>
        <pre style="background: #f0f0f0; padding: 10px; border-radius: 4px;">
fetch('/api/australia-post?q=2007')
  .then(r => r.json())
  .then(data => console.log(data));
        </pre>
      </body>
      </html>
    `;

    return new NextResponse(playgroundHTML, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return NextResponse.json(
    { message: 'GraphQL API - Use POST method to send queries' },
    { status: 200 }
  );
}
