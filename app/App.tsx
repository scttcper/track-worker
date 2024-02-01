import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider, QueryFunction } from '@tanstack/react-query';
import { stringify } from 'fast-querystring';
import ky from 'ky';

import { Layout } from './layout/Layout';
import { Home } from './Home';
import { Login } from './Login';

const HTTP_STATUS_TO_NOT_RETRY = [400, 401, 403, 404];

// Define a default query function that will receive the query key
const defaultQueryFn: QueryFunction<any, any> = async ({ queryKey }) => {
  const [route, query = {}] = queryKey;
  const params = stringify(query);
  const url = `/api${route}${params ? '?' : ''}${params}`;
  return ky.get(url, { timeout: 30_000, retry: 0 }).json();
};

// provide the default query function to your app with defaultOptions
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      retry(failureCount, error: any) {
        if (failureCount > 5) {
          return false;
        }

        if (HTTP_STATUS_TO_NOT_RETRY.includes(error.response?.status ?? 0)) {
          return false;
        }

        return true;
      },
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
