import {
  BlobWriter,
  TextReader,
  Uint8ArrayWriter,
  ZipWriter,
} from '@zip.js/zip.js';
import { describe, expect, it } from 'vitest';

import { FileCollection } from '../../FileCollection.ts';
import { isIum, isZip } from '../zip.ts';

describe('valid zip', () => {
  it('should validate normal zip', async () => {
    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('hello.txt', new TextReader('Hello World!'));
    const blob = await zipWriter.close();
    const buffer = await blob.arrayBuffer();

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

  it.for(invalidSignatures)(
    'should not valid %i %i %i %i ... (invalid signature)',
    async (array) => {
      const buffer = Uint8Array.from(array);
      const blob = new Blob([buffer], { type: 'application/zip' });

      expect(isZip(await blob.arrayBuffer())).toBe(false);
    },
  );

  const invalidBySize = [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
    [0x50, 0x4b, 0x07, 0x08],
  ];

  it.for(invalidBySize)(
    'should not valid %i %i %i %i (valid signature but invalid size)',
    async (array) => {
      const buffer = Uint8Array.from(array);
      const blob = new Blob([buffer], { type: 'application/zip' });

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
      dataDescriptor: false,
      extendedTimestamp: false,
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
      dataDescriptor: false,
      extendedTimestamp: false,
    });
    await zipWriter.add('index.json', new TextReader('{}'));
    const blob = await zipWriter.close();

    expect(isIum(await blob.arrayBuffer(), mimetype)).toBe(true);
  });

  it('should validate if extra field is not empty', async () => {
    const mimetype = 'application/nmrium+zip';

    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('mimetype', new TextReader(mimetype), {
      compressionMethod: 0,
      dataDescriptor: false,
    });
    await zipWriter.add('index.json', new TextReader('{}'));
    const blob = await zipWriter.close();

    expect(isIum(await blob.arrayBuffer(), mimetype)).toBe(true);
  });
});

describe('invalid ium', () => {
  it('should invalid ium if mimetype do not match', async () => {
    const mimetype = 'application/nmrium+zip';

    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('mimetype', new TextReader(mimetype), {
      compressionMethod: 0,
      dataDescriptor: false,
      extendedTimestamp: false,
    });
    await zipWriter.add('index.json', new TextReader('{}'));
    const blob = await zipWriter.close();

    expect(isIum(await blob.arrayBuffer(), 'application/ium+zip')).toBe(false);
  });

  it('should invalid ium if mimetype is compressed', async () => {
    const mimetype = 'application/nmrium+zip';

    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('mimetype', new TextReader(mimetype), {
      dataDescriptor: false,
      extendedTimestamp: false,
    });
    await zipWriter.add('index.json', new TextReader('{}'));
    const blob = await zipWriter.close();

    expect(isIum(await blob.arrayBuffer(), 'application/nmrium+zip')).toBe(
      false,
    );
  });

  it('should invalidate ium if stored mimetype startsWith expected mimetype', async () => {
    const mimetypeStored = 'application/nmrium+zip';
    const mimetypeExpected = 'application/nmrium';

    const zipWriter = new ZipWriter(new BlobWriter(), {});
    await zipWriter.add('mimetype', new TextReader(mimetypeStored), {
      compressionMethod: 0,
      dataDescriptor: false,
      extendedTimestamp: false,
    });
    await zipWriter.add('index.json', new TextReader('{}'));
    const blob = await zipWriter.close();

    expect(isIum(await blob.arrayBuffer(), mimetypeExpected)).toBe(false);
  });
});

describe('FileCollection', () => {
  it('should create and check ium from FileCollection', async () => {
    const fileCollection = new FileCollection();
    await fileCollection.appendText('/hello.txt', 'Hello World!');
    const ium = await fileCollection.toIum();

    expect(FileCollection.isZip(ium.buffer)).toBe(true);
    expect(FileCollection.isIum(ium.buffer)).toBe(true);
    expect(FileCollection.isIum(ium.buffer), 'application/x-ium+zip').toBe(
      true,
    );
  });

  it('should validate any mimetype', async () => {
    const fileCollection = new FileCollection();
    await fileCollection.appendText('/hello.txt', 'Hello World!');
    const ium = await fileCollection.toIum({
      mimetype: 'application/nmrium+zip',
    });

    expect(FileCollection.isZip(ium.buffer)).toBe(true);
    expect(FileCollection.isIum(ium.buffer)).toBe(true);
    expect(FileCollection.isIum(ium.buffer, 'application/x-ium+zip')).toBe(
      false,
    );
    expect(FileCollection.isIum(ium.buffer, 'application/nmrium+zip')).toBe(
      true,
    );
  });

  it('should validate ium mimetype with fromIum', async () => {
    const fileCollection = new FileCollection();
    await fileCollection.appendText('/hello.txt', 'Hello World!');
    const ium = await fileCollection.toIum({
      mimetype: 'application/nmrium+zip',
    });

    await expect(
      FileCollection.fromIum(ium, {
        validateMimetype: 'application/x-ium+zip',
      }),
    ).rejects.toThrowError(
      'Invalid IUM file: invalid mimetype application/nmrium+zip, it should be application/x-ium+zip.',
    );

    await expect(FileCollection.fromIum(ium)).resolves.not.toThrowError(Error);
  });
});

describe('arbitrary zip', () => {
  it('should invalidate foo file with bar content', async () => {
    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('foo', new TextReader('bar'), {
      compressionMethod: 0,
      dataDescriptor: false,
      extendedTimestamp: false,
    });
    const blob = await zipWriter.close();

    expect(
      FileCollection.isIum(await blob.arrayBuffer(), 'application/x-ium+zip'),
    ).toBe(false);
  });

  it('should invalidate .mimemime file with application/x-ium+zip content', async () => {
    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('.mimemime', new TextReader('application/x-ium+zip'), {
      compressionMethod: 0,
      dataDescriptor: false,
      extendedTimestamp: false,
    });
    const blob = await zipWriter.close();

    expect(
      FileCollection.isIum(await blob.arrayBuffer(), 'application/x-ium+zip'),
    ).toBe(false);
  });
});
