import { test, expect } from 'vitest';

import { shouldAddItem } from '../shouldAddItem';

test('shouldAddItem', async () => {
  expect(shouldAddItem('a.txt')).toBe(true);
  expect(shouldAddItem('.dotFile')).toBe(false);
  expect(shouldAddItem('.dotFolder/a.txt')).toBe(false);
  expect(shouldAddItem('dir1/a.txt')).toBe(true);
  expect(shouldAddItem('dir1/.b.txt')).toBe(false);
});
