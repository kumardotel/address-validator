import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Australia Post API configuration
const AUSTRALIA_POST_API_URL =
  'https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json';
const AUSTRALIA_POST_TOKEN = '7710a8c5-ccd1-160f-70cf03e8-b2bbaf01';

// HTTP link for our GraphQL proxy
const httpLink = createHttpLink({
  uri: '/api/graphql',
});

// Auth link to add headers
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    },
  };
});

const errorLink = onError((error) => {
  // errors
  console.error('Apollo Client Error:', error);
});

// Configure Apollo Client
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Cache policy for location searches
          searchLocations: {
            keyArgs: ['query', 'state'],
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
});

// Helper function to make direct REST API calls (fallback)
export async function fetchAustraliaPostDirect(query: string, state?: string) {
  const params = new URLSearchParams({ q: query });
  if (state) params.append('state', state);

  const response = await fetch(`${AUSTRALIA_POST_API_URL}?${params}`, {
    headers: {
      Authorization: `Bearer ${AUSTRALIA_POST_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Australia Post API error: ${response.status}`);
  }

  return response.json();
}

export default client;
