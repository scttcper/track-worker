import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { UnstableDevWorker } from 'wrangler';
import { unstable_dev } from 'wrangler';

describe.skip('Worker', () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it('should return recent', async () => {
    const resp = await worker.fetch('/api/recent');
    console.log(resp);
    if (resp) {
      const text = await resp.json();
      expect(text).toBe('Hello World!');
    }
  });
});
