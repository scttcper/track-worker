import { zValidator } from '@hono/zod-validator';
import type { Transaction } from '@sentry/types';
import { Hono, MiddlewareHandler } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { cache } from 'hono/cache';
import { serveStatic } from 'hono/cloudflare-workers';
import { setCookie } from 'hono/cookie';
import { etag } from 'hono/etag';
import { jwt, sign } from 'hono/jwt';
import { secureHeaders } from 'hono/secure-headers';
import { Toucan } from 'toucan-js';
import { z } from 'zod';

import { sentry } from './sentry.js';

export type Message = {
  imdbId: string;
};

export interface Bindings {
  [key: string]: unknown;
  SENTRY_DSN: string;
  ENVIRONMENT: string;
  COMMIT_HASH: string;
  // APPLE_KEY_ID: string;
  // APPLE_TEAM_ID: string;
  // APPLE_SECRET: string;
  // SPOTIFY_CLIENT_ID: string;
  // SPOTIFY_CLIENT_SECRET: string;
}
interface Variables {
  [key: string]: unknown;
  sentry: Toucan;
  transaction: Transaction;
  // sentry: Toucan;
  // transaction: Transaction;
}
interface HonoContext {
  Bindings: Bindings;
  Variables: Variables;
}

const app = new Hono<HonoContext>();
export type Context = Parameters<MiddlewareHandler<HonoContext>>[0];

// app.use('*', logger());
app.use('*', etag());
app.use('*', secureHeaders());

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const expectedUsername = 'cooper';
const expectedPassword = 'itsmorphintime';
const secret = 'ce56a3b5d406e9fa57648d635e40fb5c31fe0da9475601f2c264d7b1d817dcdd';

/**
 * Handle basic auth
 */
app.post('/auth/login', zValidator('form', loginSchema), async c => {
  const { username, password } = c.req.valid('form');
  if (username !== expectedUsername || password !== expectedPassword) {
    c.status(401);
    return c.json({ success: false });
  }

  const token = await sign({ username, password }, secret);
  setCookie(c, 'Authorization', token);
  return c.json({ success: true });
});

app.use(
  '/api/*',
  sentry(),
  jwt({
    cookie: 'Authorization',
    secret,
  }),
);

app.get('/api/status', c => c.json({ status: 'ok' }));
app.get(
  '/api/search',
  zValidator('query', z.object({ title: z.string(), artists: z.string() })),
  c => c.json({ results: [], query: c.req.valid('query') }),
);

app.get(
  '/api/page',
  bearerAuth({
    token: 'password',
  }),
  c => c.text('You are authorized'),
);

app.get(
  '/robots.txt',
  cache({
    cacheName: 'scrdb-assets',
    cacheControl: 'public, max-age=86400',
  }),
  async ctx =>
    ctx.text(
      `User-agent: *
Disallow: /`,
    ),
);

app.get(
  '/',
  serveStatic({
    root: './',
    rewriteRequestPath() {
      return '/index.html';
    },
  }),
);

app.get(
  '/assets/*',
  cache({
    cacheName: 'scrdb-assets',
    cacheControl: 'public, max-age=31536000, immutable',
  }),
  serveStatic({ root: './' }),
);

app.get('*', async (ctx, next) => {
  if (ctx.res.status === 404) {
    // rewrite to index
    return serveStatic({
      root: './',
      rewriteRequestPath() {
        return '/index.html';
      },
    })(ctx, next);
  }

  return ctx.res;
});

export default app;
