import { join } from 'path';

import { fileCollectionFromPath } from '../../../appendFromPath';
import { fileItemUngzip } from '../fileItemUngzip';

describe('fileItemUngzip', () => {
  it('default value, only gzip', async () => {
    const normalFileCollection = await fileCollectionFromPath(
      join(__dirname, '../../../__tests__/dataUngzip'),
      { ungzip: { gzipExtensions: [] } },
    );

    const files = Array.from(
      normalFileCollection.files.map((a) => `${a.relativePath} - ${a.name}`),
    );
    expect(files).toStrictEqual([
      'dataUngzip/dir1/a.txt - a.txt',
      'dataUngzip/dir1/b.txt.gz - b.txt.gz',
      'dataUngzip/dir1/dir3/e.txt - e.txt',
      'dataUngzip/dir1/dir3/f.txt.gz - f.txt.gz',
      'dataUngzip/dir2/c.txt - c.txt',
      'dataUngzip/dir2/d.txt - d.txt',
    ]);

    const first = await fileItemUngzip(normalFileCollection.files[0]);
    expect(await first.text()).toBe('a');

    const second = await fileItemUngzip(normalFileCollection.files[1]);
    expect(await second.text()).toBe('b\n');

    const arrayBuffer = await second.arrayBuffer();
    expect(arrayBuffer).toMatchInlineSnapshot(`
      Uint8Array [
        98,
        10,
      ]
    `);

    if (Number.parseInt(process.versions.node, 10) >= 18) {
      const stream = second.stream();
      const results = [];
      //@ts-expect-error feature is too new
      for await (let chunk of stream) {
        results.push(chunk);
      }
      expect(new Uint8Array(results[0])[0]).toBe(98);
    } else {
      expect(() => {
        second.stream();
      }).toThrow('');
    }
  });
});
