import {
  TextReader,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
  ZipWriter,
} from '@zip.js/zip.js';
import { expect, test, describe } from 'vitest';

import { FileCollection } from '../FileCollection.js';
import { UNSUPPORTED_ZIP_CONTENT_ERROR } from '../zip/get_zip_reader.js';

describe('invalid ium file', () => {
  test('missing index.json', async () => {
    const zipWriter = new ZipWriter(new Uint8ArrayWriter());
    await zipWriter.add('not-index.json', new TextReader('{}'));
    const zipBuffer = await zipWriter.close();

    await expect(FileCollection.fromIum(zipBuffer)).rejects.toThrow(
      'Invalid IUM file: missing index.json',
    );
  });

  test('missing data file', async () => {
    const fileCollection = new FileCollection();
    await fileCollection.appendText('/hello.txt', 'Hello Word!');
    const ium = await fileCollection.toIum();

    const zipReader = new ZipReader(new Uint8ArrayReader(ium));
    const zipWriter = new ZipWriter(new Uint8ArrayWriter());

    for await (const entry of zipReader.getEntriesGenerator()) {
      if (entry.directory) continue;
      if (entry.filename === '/data/hello.txt') continue;
      const buffer = await entry.getData(new Uint8ArrayWriter());
      await zipWriter.add(entry.filename, new Uint8ArrayReader(buffer));
    }

    const filteredIum = await zipWriter.close();

    await expect(FileCollection.fromIum(filteredIum)).rejects.toThrow(
      'Invalid IUM file: missing /hello.txt',
    );
  });
});

describe('check input types', async () => {
  const fileCollection = new FileCollection();
  await fileCollection.appendText('hello.txt', 'Hello Word!');
  const ium = await fileCollection.toIum();

  test('Uint8Array', async () => {
    await expect(FileCollection.fromIum(ium)).resolves.not.toThrow();
  });

  test('ArrayBuffer', async () => {
    await expect(FileCollection.fromIum(ium.buffer)).resolves.not.toThrow();
  });

  test('Blob', async () => {
    const blob = new Blob([ium], { type: 'application/zip' });

    await expect(FileCollection.fromIum(blob)).resolves.not.toThrow();
  });

  test('ReadableStream', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(ium);
        controller.close();
      },
    });

    await expect(FileCollection.fromIum(stream)).resolves.not.toThrow();
  });

  test('unknown', async () => {
    await expect(FileCollection.fromIum(null as never)).rejects.toThrow(
      UNSUPPORTED_ZIP_CONTENT_ERROR,
    );
  });
});
