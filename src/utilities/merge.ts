import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import { cloneExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { FileCollection } from '../FileCollection.ts';
import { cloneFileItem } from '../FileItem.ts';

import { normalizeRelativePath } from './normalize_relative_path.ts';

// eslint-disable-next-line jsdoc/require-jsdoc
export function merge(
  self: FileCollection,
  other: FileCollection,
  subPath: string,
) {
  const sanitizedSubPath = normalizeRelativePath(subPath).replace(/\/$/, '');
  const otherSourcesToSelfSources = new Map<
    ExtendedSourceItem['uuid'],
    ExtendedSourceItem['uuid']
  >();

  for (const otherSource of other.sources) {
    const source = cloneExtendedSourceItem(otherSource);
    source.uuid = crypto.randomUUID();
    source.originalRelativePath = source.relativePath;
    source.relativePath = normalizeRelativePath(
      `${sanitizedSubPath}/${source.relativePath}`,
    );
    otherSourcesToSelfSources.set(otherSource.uuid, source.uuid);

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
    const sourceUUID = otherSourcesToSelfSources.get(file.sourceUUID);
    if (!sourceUUID) {
      throw new Error('Unreachable: sourceUUID should be defined');
    }
    file.sourceUUID = sourceUUID;

    self.files.push(file);
  }
}
