import { expect, test } from 'vitest';

import type { SourceItem } from '../../SourceItem.ts';
import { fromIumSourceToPath } from '../source_zip.ts';

test('check path for extra', () => {
  const url = new URL('/extra//file:with$Special*<Char>.txt', 'ium:/');
  const source: SourceItem = {
    baseURL: 'ium:/',
    extra: true,
    relativePath: url.pathname,
  };

  const [, path, legacyPath] = fromIumSourceToPath(source);

  expect(path).toBe('extra/file-with$Special-Char-.txt');
  expect(legacyPath).toBe(url.pathname);
});
