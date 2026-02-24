import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.ts';

test('ium a moderately-sized zip', async () => {
  const zipContent = await readFile(join(import.meta.dirname, 'data_1MB.zip'));
  const fileCollection = await FileCollection.fromZip(zipContent);

  await expect(fileCollection.toIum()).resolves.toBeDefined();
});
