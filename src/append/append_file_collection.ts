import { cloneExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { FileCollection } from '../FileCollection.ts';
import { cloneFileItem } from '../FileItem.ts';
import { normalizeRelativePath } from '../utilities/normalize_relative_path.ts';

// eslint-disable-next-line jsdoc/require-jsdoc
export function appendFileCollection(
  self: FileCollection,
  other: FileCollection,
  subPath: string,
) {
  const sanitizedSubPath = normalizeRelativePath(subPath)
    // trim ending slash
    .replace(/\/$/, '');

  for (const otherSource of other.sources) {
    const source = cloneExtendedSourceItem(otherSource);
    source.originalRelativePath ??= source.relativePath;
    source.relativePath = normalizeRelativePath(
      `${sanitizedSubPath}/${source.relativePath}`,
    );

    self.sources.push(source);
  }

  const existingFiles = new Set(self.files.map((f) => f.relativePath));
  for (const otherFile of other.files) {
    const relativePath = normalizeRelativePath(
      `${sanitizedSubPath}/${otherFile.relativePath}`,
    );
    if (existingFiles.has(relativePath)) {
      throw new Error(`Duplicate relativePath: ${otherFile.relativePath}`);
    }
    const file = cloneFileItem(otherFile);
    file.relativePath = relativePath;

    self.files.push(file);
  }
}
