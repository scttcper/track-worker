// @ts-expect-error
import manifest from '__STATIC_CONTENT_MANIFEST';
import { zValidator } from '@hono/zod-validator';
import type { Transaction } from '@sentry/types';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
import { Hono, MiddlewareHandler } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { cache } from 'hono/cache';
import { serveStatic } from 'hono/cloudflare-workers';
import { getCookie, setCookie } from 'hono/cookie';
import { etag } from 'hono/etag';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import type { Toucan } from 'toucan-js';
import { z } from 'zod';

import { searchMusic as spotifySearchMusic } from './spotify/search.js';
import { fuzzymatchSong } from './fuzzymatch.js';
import { sentry, wrapRoute } from './sentry.js';

export type Message = {
  imdbId: string;
};

export interface Bindings {
  [key: string]: unknown;
  TOKEN: KVNamespace;
  SENTRY_DSN: string;
  ENVIRONMENT: string;
  COMMIT_HASH: string;
  // APPLE_KEY_ID: string;
  // APPLE_TEAM_ID: string;
  // APPLE_SECRET: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
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

// // app.use('*', logger());
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

  const token = await sign({ username }, secret);
  setCookie(c, 'Authorization', token, {
    /**
     * 1 year
     */
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });
  return c.json({ success: true });
});

function unauthorizedResponse(opts: {
  ctx: Context;
  error: string;
  errDescription: string;
  statusText?: string;
}) {
  return new Response('Unauthorized', {
    status: 401,
    statusText: opts.statusText,
    headers: {
      'WWW-Authenticate': `Bearer realm="${opts.ctx.req.url}",error="${opts.error}",error_description="${opts.errDescription}"`,
    },
  });
}

const filterMinScore = (minScore: number) => (x: { score: number }) =>
  x.score && x.score >= minScore;
const defaultMinScore = 0.95;

app.use('/api/*', sentry(), async (ctx, next) => {
  // based on https://github.com/honojs/hono/blob/main/src/middleware/jwt/index.ts
  const authHeader = ctx.req.header('Authorization');
  if (authHeader === secret) {
    await next();
    return;
  }

  const token = getCookie(ctx, 'Authorization');

  if (!token) {
    throw new HTTPException(401, {
      res: unauthorizedResponse({
        ctx,
        error: 'invalid_request',
        errDescription: 'no authorization included in request',
      }),
    });
  }

  let payload;
  let msg = '';
  try {
    payload = await verify(token, secret);
  } catch (e: any) {
    msg = `${e}`;
  }

  if (!payload) {
    throw new HTTPException(401, {
      res: unauthorizedResponse({
        ctx,
        error: 'invalid_token',
        statusText: msg,
        errDescription: 'token verification failure',
      }),
    });
  }

  ctx.set('jwtPayload', payload);

  await next();
});

app.get('/api/status', c => c.json({ status: 'ok' }));
export const search = app.get(
  '/api/search',
  zValidator(
    'query',
    z.object({
      title: z.string().trim(),
      artists: z.string().trim(),
      minScore: z.coerce.number().positive().optional(),
    }),
  ),
  wrapRoute(),
  async c => {
    const query = c.req.valid('query');
    const genericQuery = `${query.title} ${query.artists}`;
    const spotifyResults = await spotifySearchMusic(genericQuery, c);
    const scores = fuzzymatchSong(
      query,
      spotifyResults.map(x => ({
        id: x.id,
        title: x.name,
        isrc: x.external_ids.isrc,
        artists: x.artists.map(x => x.name).join(' '),
        album: x.album.name,
        releaseDate: x.album.release_date,
      })),
    );

    const results = spotifyResults
      .map(result => ({ ...result, score: scores.find(x => x.id === result.id)!.score }))
      .filter(filterMinScore(query.minScore ?? defaultMinScore))
      // sort by score then by popularity
      .sort((a, b) => b.score - a.score || b.popularity - a.popularity);
    return c.json({ query: c.req.valid('query'), results });
  },
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
    manifest,
  }),
);

app.get(
  '/assets/*',
  cache({
    cacheName: 'scrdb-assets',
    cacheControl: 'public, max-age=31536000, immutable',
  }),
  serveStatic({ root: './', manifest }),
);

app.get('*', async (ctx, next) => {
  if (ctx.res.status === 404) {
    // rewrite to index
    return serveStatic({
      root: './',
      rewriteRequestPath() {
        return '/index.html';
      },
      manifest,
    })(ctx, next);
  }

  return ctx.res;
});

export default app;
