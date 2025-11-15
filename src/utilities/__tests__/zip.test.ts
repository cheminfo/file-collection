import {
  BlobWriter,
  TextReader,
  Uint8ArrayWriter,
  ZipWriter,
} from '@zip.js/zip.js';
import { describe, expect, it, test } from 'vitest';

import { isIum, isZip } from '../zip.ts';

describe('valid zip', () => {
  it('should validate normal zip', async () => {
    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('hello.txt', new TextReader('Hello World!'));
    const blob = await zipWriter.close();
    const buffer = await blob.arrayBuffer();

    // ensures isZip supports empty zip
    expect(isZip(buffer)).toBe(true);
  });

  it('should validate empty zip', async () => {
    const zipWriter = new ZipWriter(new BlobWriter());
    const blob = await zipWriter.close();
    const buffer = await blob.arrayBuffer();

    const view = new DataView(buffer);
    const [third, fourth] = [view.getUint8(2), view.getUint8(3)];

    // ensures zip js produce "empty zip" signature
    expect(third).toBe(0x05);
    expect(fourth).toBe(0x06);
    // ensures isZip supports empty zip
    expect(isZip(buffer)).toBe(true);
  });

  it('should validate spanned zip', async () => {
    const spanZipWriter = new ZipWriter(new Uint8ArrayWriter());
    await spanZipWriter.add('hello.txt', new TextReader('Hello World!'));
    const spanBuffer = await spanZipWriter.close();

    // I did not find how to create a spanned zip with zip.js,
    // so I simulate the span manually.
    spanBuffer[2] = 0x07;
    spanBuffer[3] = 0x08;

    const blob = new Blob([spanBuffer], { type: 'application/zip' });

    expect(isZip(await blob.arrayBuffer())).toBe(true);
  });
});

describe('invalid zip', () => {
  const invalidSignatures = [
    [
      0x50, 0x4b, 0x03, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
    [
      0x50, 0x4b, 0x03, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
    [
      0x50, 0x4b, 0x03, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
    [
      0x50, 0x4b, 0x03, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],

    [
      0x50, 0x4b, 0x05, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
    [
      0x50, 0x4b, 0x05, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
    [
      0x50, 0x4b, 0x05, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
    [
      0x50, 0x4b, 0x05, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],

    [
      0x50, 0x4b, 0x07, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
    [
      0x50, 0x4b, 0x07, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
    [
      0x50, 0x4b, 0x07, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
    [
      0x50, 0x4b, 0x07, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ],
  ];

  // it seems eslint does not support `it.for` `test.for`

  // eslint-disable-next-line vitest/require-hook
  test.for(invalidSignatures)(
    'should not valid %i %i %i %i ... (invalid signature)',
    async (array) => {
      const buffer = Uint8Array.from(array);
      const blob = new Blob([buffer], { type: 'application/zip' });

      // eslint-disable-next-line vitest/no-standalone-expect
      expect(isZip(await blob.arrayBuffer())).toBe(false);
    },
  );

  const invalidBySize = [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
    [0x50, 0x4b, 0x07, 0x08],
  ];

  // eslint-disable-next-line vitest/require-hook
  test.for(invalidBySize)(
    'should not valid %i %i %i %i (valid signature but invalid size)',
    async (array) => {
      const buffer = Uint8Array.from(array);
      const blob = new Blob([buffer], { type: 'application/zip' });

      // eslint-disable-next-line vitest/no-standalone-expect
      expect(isZip(await blob.arrayBuffer())).toBe(false);
    },
  );
});

describe('valid ium', () => {
  it('should valid ium without mimetype', async () => {
    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('index.json', new TextReader('{}'));
    const blob = await zipWriter.close();

    expect(isIum(await blob.arrayBuffer(), undefined)).toBe(true);
  });

  it('should valid ium with application/ium+zip mimetype', async () => {
    const mimetype = 'application/ium+zip';

    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('mimetype', new TextReader(mimetype), {
      compressionMethod: 0,
    });
    await zipWriter.add('index.json', new TextReader('{}'));
    const blob = await zipWriter.close();

    expect(isIum(await blob.arrayBuffer(), mimetype)).toBe(true);
  });

  it('should valid ium with application/nmrium+zip mimetype', async () => {
    const mimetype = 'application/nmrium+zip';

    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('mimetype', new TextReader(mimetype), {
      compressionMethod: 0,
    });
    await zipWriter.add('index.json', new TextReader('{}'));
    const blob = await zipWriter.close();

    expect(isIum(await blob.arrayBuffer(), mimetype)).toBe(true);
  });

  it('should invalid ium if mimetype do not match', async () => {
    const mimetype = 'application/nmrium+zip';

    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('mimetype', new TextReader(mimetype), {
      compressionMethod: 0,
    });
    await zipWriter.add('index.json', new TextReader('{}'));
    const blob = await zipWriter.close();

    expect(isIum(await blob.arrayBuffer(), 'application/ium+zip')).toBe(false);
  });

  it('should invalid ium if mimetype is compressed', async () => {
    const mimetype = 'application/nmrium+zip';

    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('mimetype', new TextReader(mimetype));
    await zipWriter.add('index.json', new TextReader('{}'));
    const blob = await zipWriter.close();

    expect(isIum(await blob.arrayBuffer(), 'application/nmrium+zip')).toBe(
      false,
    );
  });

  it.fails(
    'should invalidate ium if stored mimetype startsWith expected mimetype',
    async () => {
      const mimetypeStored = 'application/nmrium+zip';
      const mimetypeExpected = 'application/nmrium';

      const zipWriter = new ZipWriter(new BlobWriter());
      await zipWriter.add('mimetype', new TextReader(mimetypeStored), {
        compressionMethod: 0,
      });
      await zipWriter.add('index.json', new TextReader('{}'));
      const blob = await zipWriter.close();

      // It should return false, but it returns true because "uncompressed size" (and "compressed size")
      // may not be set in the "Local file header",
      // but it could be set in the "Data descriptor" or in the "Central directory header".
      // For fast check we consider this edge case is OK,
      // but if it is possible to fix it without having to parse the whole zip file,
      // it would be better.
      expect(isIum(await blob.arrayBuffer(), mimetypeExpected)).toBe(false);
    },
  );
});
