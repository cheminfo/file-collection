import { expect, test } from 'vitest';

import { migrateV1ToV2 } from '../migrations/v01_to_v02.ts';
import type { ToIumIndexV1 } from '../v01.ts';

test('should migrate to v2', () => {
  const indexV1: ToIumIndexV1 = {
    version: 1,
    options: {},
    sources: [
      {
        uuid: 'a',
        relativePath: new URL('/extra//file:with$Special*<Char>.txt', 'ium:/')
          .pathname,
        extra: true,
        baseURL: 'ium:/',
      },
      {
        uuid: 'b',
        relativePath: new URL('/subroot//file:with$Special*<Char>.txt', 'ium:/')
          .pathname,
        baseURL: 'ium:/',
      },
      {
        uuid: 'c',
        relativePath: './ethylvinylether/index.nmrium',
        baseURL: 'https://cheminfo.github.io/nmr-dataset-demo/',
      },
    ],
  };
  const indexV2 = migrateV1ToV2(indexV1);
  const expectedPaths = {
    /* eslint-disable camelcase */
    a: 'extra/file-with$Special-Char-.txt',
    b: 'data/subroot/file-with$Special-Char-.txt',
    c: 'data/nmr-dataset-demo/ethylvinylether/index.nmrium',
    a_legacy: '/extra//file:with$Special*%3CChar%3E.txt',
    b_legacy: '/data/subroot//file:with$Special*%3CChar%3E.txt',
    c_legacy: '/data/nmr-dataset-demo/ethylvinylether/index.nmrium',
    /* eslint-enable camelcase */
  };

  expect(indexV2).toStrictEqual({
    version: 2,
    options: {},
    sources: indexV1.sources,
    paths: expectedPaths,
  });
});
