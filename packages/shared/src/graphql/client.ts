import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import auth from '@react-native-firebase/auth';
import { GRAPHQL_ENDPOINT } from '../constants/config';

// Create Apollo Client factory function for React Native
export function createApolloClient(graphqlUrl?: string) {
  const httpLink = new HttpLink({
    uri: graphqlUrl || GRAPHQL_ENDPOINT,
  });

  // Auth link: attaches Firebase ID token for authenticated endpoints
  const authLink = setContext(async (_, { headers }) => {
    const currentUser = auth().currentUser;
    const idToken = currentUser ? await currentUser.getIdToken() : null;
    return {
      headers: {
        ...headers,
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
    };
  });

  const link = ApolloLink.from([authLink, httpLink]);

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            weather: { keyArgs: ['lat', 'lon'] },
            currentWeather: { keyArgs: ['lat', 'lon'] },
            forecast: { keyArgs: ['lat', 'lon'] },
            hourlyForecast: { keyArgs: ['lat', 'lon'] },
            stockQuote: { keyArgs: ['symbol'] },
            stockCandles: { keyArgs: ['symbol', 'from', 'to'] },
            searchStocks: { keyArgs: ['query'] },
            searchPodcasts: { keyArgs: ['query'] },
            podcastEpisodes: { keyArgs: ['feedId'] },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  });

  return client;
}

// Default singleton client
let defaultClient: ApolloClient<any> | null = null;

export function getApolloClient(): ApolloClient<any> {
  if (!defaultClient) {
    defaultClient = createApolloClient();
  }
  return defaultClient;
}
