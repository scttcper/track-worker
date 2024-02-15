import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ScrollRestoration } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Footer } from './Footer';

export function Layout() {
  const navigate = useNavigate();
  const statusQuery = useQuery({
    queryKey: ['/status'],
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (statusQuery.isError) {
      navigate('/login');
    }
  }, [statusQuery.isError, navigate]);

  return (
    <div>
      <ScrollRestoration />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
