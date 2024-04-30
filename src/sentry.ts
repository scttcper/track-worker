// eslint-disable-next-line simple-import-sort/imports
import type { Context, MiddlewareHandler } from 'hono';
import { Toucan } from 'toucan-js';
import '@sentry/tracing';

class MockContext implements ExecutionContext {
  passThroughOnException(): void {
    throw new Error('Method not implemented.');
  }

  async waitUntil(promise: Promise<any>): Promise<void> {
    await promise;
  }
}

export const sentry = (): MiddlewareHandler => async (c, next) => {
  let hasExecutionContext = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    c.executionCtx;
  } catch {
    hasExecutionContext = false;
  }

  const sentry = new Toucan({
    dsn: c.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    request: c.req.raw,
    requestDataOptions: {
      allowedHeaders: [
        'user-agent',
        'cf-challenge',
        'accept-encoding',
        'accept-language',
        'cf-ray',
        'content-length',
        'content-type',
        'x-real-ip',
        'host',
      ],
      allowedSearchParams: /(.*)/,
    },
    context: hasExecutionContext ? c.executionCtx : new MockContext(),
    environment: c.env.ENVIRONMENT,
    release: c.env.COMMIT_HASH,
  });
  c.set('sentry', sentry);
  await next();
};

export const wrapRoute = (): MiddlewareHandler => async (c, next) => {
  const sentry: Toucan = c.get('sentry');
  const t = sentry.startTransaction({
    name: c.req.routePath,
    op: 'http.server',
  });

  const request = c.req.raw as any;
  const colo = request?.cf?.colo ? request.cf.colo : 'UNKNOWN';
  sentry.setTag('colo', colo);

  // cf-connecting-ip should always be present, but if not we can fallback to XFF.
  const ipAddress =
    request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for');
  const userAgent = request.headers.get('user-agent') || '';
  sentry.setUser({ ip: ipAddress, userAgent, colo });

  sentry.configureScope(scope => {
    scope.setSpan(t);
  });
  c.set('transaction', t);

  await next();
  if (c.error) {
    t.setStatus('internal_error');
    sentry.captureException(c.error);
  } else if (c.res.status === 400) {
    t.setStatus('invalid_argument');
  } else if (c.res.status === 401) {
    t.setStatus('unauthenticated');
  } else if (c.res.status === 403) {
    t.setStatus('permission_denied');
  } else {
    t.setStatus('ok');
  }

  t.setHttpStatus(c.res.status);
  t.finish();
};

export const getSentry = (c: Context) => c.get('sentry');
