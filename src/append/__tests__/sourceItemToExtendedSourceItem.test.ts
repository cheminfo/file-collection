import { expect, test } from 'vitest';

import type { SourceItem } from '../../SourceItem.js';
import { sourceItemToExtendedSourceItem } from '../sourceItemToExtendedSourceItem.js';

test('error on invalid server URL', async () => {
  const entry: SourceItem = {
    relativePath: 'test.txt',
  };

  const source = sourceItemToExtendedSourceItem(entry, 'http://localhost:0/');
  async function consumeStream() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const chunk of source.stream()) {
      /* empty */
    }
  }

  await expect(consumeStream()).rejects.toThrowError('fetch failed');
});

test('original relative path is preserved', async () => {
  const entry: SourceItem = {
    uuid: crypto.randomUUID(),
    originalRelativePath: 'test.txt',
    relativePath: 'subroot/test.txt',
  };

  const source = sourceItemToExtendedSourceItem(entry, 'http://localhost:0/');
  const { text, arrayBuffer, stream, ...item } = source;

  expect(item).toStrictEqual({
    uuid: entry.uuid,
    relativePath: 'subroot/test.txt',
    originalRelativePath: 'test.txt',
    name: 'test.txt',
    baseURL: 'http://localhost:0/',
    extra: undefined,
    lastModified: undefined,
    options: undefined,
    size: undefined,
  });
});
