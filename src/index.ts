import app from './server.js';

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// biome-ignore lint/suspicious/noEmptyInterface: for later
export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
}

export default {
  ...app,
  // async scheduled(controller: any, env: any, ctx: any) {
  //   const sentry = new Toucan({
  //     dsn: env.SENTRY_DSN,
  //     tracesSampleRate: 1.0,
  //     request: ctx.req,
  //     requestDataOptions: {
  //       allowedHeaders: /(.*)/,
  //       allowedSearchParams: /(.*)/,
  //     },
  //     context: ctx,
  //     environment: env.ENVIRONMENT,
  //     release: env.COMMIT_HASH,
  //   });
  //   const txn = sentry.startTransaction({
  //     name: 'scheduled',
  //     op: 'scheduled',
  //   });

  //   const mockContext = {
  //     get(): Transaction {
  //       // @ts-expect-error
  //       return txn;
  //     },
  //   };

  //   try {
  //     if (controller.cron === '*/2 * * * *') {
  //     }
  //   } catch (err) {
  //     sentry.captureException(err);
  //     throw err;
  //   } finally {
  //     txn.finish();
  //   }
  // },
};
