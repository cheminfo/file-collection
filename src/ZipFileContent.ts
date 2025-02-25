import type JSZip from 'jszip';

export type ZipFileContent = Parameters<typeof JSZip.loadAsync>[0];
