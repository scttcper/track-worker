import { Outlet } from 'react-router-dom';
import { ScrollRestoration } from 'react-router-dom';

import { Footer } from './Footer';

export function Layout() {
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
