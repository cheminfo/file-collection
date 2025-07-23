import { expect, test } from 'vitest';

import { normalizeRelativePath } from '../normalize_relative_path.ts';

const paths = ['a', '.b', 'c.txt', 'sub/a', 'sub/.b', 'sub/c.txt'];

test.each(paths)('should work with %s', (path) => {
  expect(normalizeRelativePath(path)).toBe(path);
  expect(normalizeRelativePath(`/${path}`)).toBe(path);
  expect(normalizeRelativePath(`./${path}`)).toBe(path);
});
