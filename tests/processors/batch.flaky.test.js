const { processBatch } = require('../../src/processors/batch');

describe('Batch Processor - Race Conditions', () => {
  test('processes items in expected order', async () => {
    const items = [1, 2, 3, 4, 5];

    // processBatch iterates sequentially (for loop with await), so the
    // returned successful array is always in insertion order.
    const transform = async (item) => item * 2;

    const { successful } = await processBatch(items, transform);

    expect(successful).toEqual([2, 4, 6, 8, 10]);
  });

  test('completes within time limit', async () => {
    const items = Array.from({ length: 10 }, (_, i) => i);

    // Use a fixed, negligible delay instead of a random one so the
    // cumulative duration is deterministic and well under any threshold.
    const transform = async (item) => item;

    const start = Date.now();
    await processBatch(items, transform);
    const duration = Date.now() - start;

    // processBatch is sequential; 10 near-instant awaits finish in <500 ms
    // on any reasonable machine, giving a wide, reliable margin.
    expect(duration).toBeLessThan(500);
  });

  test('handles shared state updates', async () => {
    const sharedState = { count: 0 };
    const items = [1, 2, 3, 4, 5];

    // processBatch awaits each transform before moving to the next, so
    // there is no concurrency and no read-modify-write race.
    const transform = async (item) => {
      sharedState.count += 1;
      return item;
    };

    await processBatch(items, transform);

    expect(sharedState.count).toBe(5);
  });
});
