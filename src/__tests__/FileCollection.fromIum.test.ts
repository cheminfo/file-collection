import {
  TextReader,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
  ZipWriter,
} from '@zip.js/zip.js';
import { describe, expect, it } from 'vitest';

import { FileCollection } from '../FileCollection.js';
import { UNSUPPORTED_ZIP_CONTENT_ERROR } from '../zip/get_zip_reader.js';

describe('invalid ium file', () => {
  it('missing index.json', async () => {
    const zipWriter = new ZipWriter(new Uint8ArrayWriter());
    await zipWriter.add('not-index.json', new TextReader('{}'));
    const zipBuffer = await zipWriter.close();

    await expect(FileCollection.fromIum(zipBuffer)).rejects.toThrowError(
      'Invalid IUM file: missing index.json',
    );
  });

  it('missing data file', async () => {
    const fileCollection = new FileCollection();
    await fileCollection.appendText('/hello.txt', 'Hello Word!');
    const ium = await fileCollection.toIum();

    const zipReader = new ZipReader(new Uint8ArrayReader(ium));
    const zipWriter = new ZipWriter(new Uint8ArrayWriter());

    for await (const entry of zipReader.getEntriesGenerator()) {
      if (entry.directory) continue;
      if (entry.filename === 'data/hello.txt') continue;
      const buffer = await entry.getData(new Uint8ArrayWriter());
      await zipWriter.add(entry.filename, new Uint8ArrayReader(buffer));
    }

    const filteredIum = await zipWriter.close();

    await expect(FileCollection.fromIum(filteredIum)).rejects.toThrowError(
      'Invalid IUM file: missing /hello.txt',
    );
  });
});

describe('check input types', async () => {
  const fileCollection = new FileCollection();
  await fileCollection.appendText('hello.txt', 'Hello Word!');
  const ium = await fileCollection.toIum();

  it('Uint8Array', async () => {
    await expect(FileCollection.fromIum(ium)).resolves.not.toThrowError();
  });

  it('ArrayBuffer', async () => {
    await expect(FileCollection.fromIum(ium.buffer)).resolves.not.toThrowError();
  });

  it('Blob', async () => {
    const blob = new Blob([ium], { type: 'application/zip' });

    await expect(FileCollection.fromIum(blob)).resolves.not.toThrowError();
  });

  it('ReadableStream', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(ium);
        controller.close();
      },
    });

    await expect(FileCollection.fromIum(stream)).resolves.not.toThrowError();
  });

  it('unknown', async () => {
    await expect(FileCollection.fromIum(null as never)).rejects.toThrowError(
      UNSUPPORTED_ZIP_CONTENT_ERROR,
    );
  });
});
