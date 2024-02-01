import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export function Home() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ['/status'],
  });

  useEffect(() => {
    if (query.isError) {
      navigate('/login');
    }
  }, [query.isError, navigate]);

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error</div>;
  }

  return <div>Hello</div>;
}
