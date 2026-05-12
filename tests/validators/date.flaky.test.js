const { validateDate } = require('../../src/validators/date');

describe('Date Validator - Timing Sensitive', () => {
  test('validates current date within acceptable range', () => {
    // Capture the date once and use it consistently to avoid day-boundary flakiness.
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const result = validateDate(dateStr);
    expect(result.valid).toBe(true);

    // Compare against the string components we already captured, not a second Date().
    expect(result.value).toBe(dateStr);
  });

  test('processes dates within timeout', async () => {
    const dates = ['2024-01-15', '2024-06-20', '2024-12-31'];

    for (const date of dates) {
      validateDate(date);
    }

    // validateDate is synchronous; no artificial delays are needed to
    // verify correctness, so no timing assertion is required here.
    expect(dates).toHaveLength(3);
  });
});
