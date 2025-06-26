import { expect, test } from 'vitest';

import type { SourceItem } from '../../SourceItem.js';
import { sourceItemToExtendedSourceItem } from '../sourceItemToExtendedSourceItem.js';

test('error on invalid server URL', async () => {
  const entry: SourceItem = {
    relativePath: 'test.txt',
  };

  const file = sourceItemToExtendedSourceItem(entry, 'http://localhost:0/');
  async function consumeStream() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const chunk of file.stream()) {
      /* empty */
    }
  }

  await expect(consumeStream()).rejects.toThrow();
});
