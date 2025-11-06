import type { Logger } from 'cheminfo-types';

import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import { cloneExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { FileCollection } from '../FileCollection.ts';
import type { FileItem } from '../FileItem.ts';
import { cloneFileItem } from '../FileItem.ts';
import { normalizeRelativePath } from '../utilities/normalize_relative_path.ts';

export const MERGE_STRATEGY = Object.freeze({
  /**
   * If a file item (identified by relativePath) is already present in the `self` collection,
   * Then it will throw an error.
   *
   * It is the default strategy.
   */
  ERROR: 'error',

  /**
   * If a file item (identified by relativePath) is already present in the `self` collection,
   *   and if the related source item (identified by uuid and relativePath) is already present in the `self`
   *   collection.
   * Then, the file item will be ignored and the source item will be marked as ignored.
   * Else, it will throw an error.
   */
  IGNORE_SIMILAR: 'ignore-similar',

  /**
   * If a source item (identified by uuid) is already present in the `self` collection, it will be ignored.
   * All files attached to this source item will also be ignored.
   * If a file item (identified by relativePath) is already present in the `self` collection, it will be ignored.
   * If a logger is provided (from `options` or `self.options`), a warning will be logged.
   */
  IGNORE: 'ignore',
} as const);
export type MergeStrategy =
  (typeof MERGE_STRATEGY)[keyof typeof MERGE_STRATEGY];

export interface AppendFileCollectionOptions {
  /**
   * @default `MERGE_STRATEGY.ERROR`
   */
  mergeStrategy?: MergeStrategy;
  logger?: Logger;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export function appendFileCollection(
  self: FileCollection,
  other: FileCollection,
  subPath: string,
  options: AppendFileCollectionOptions,
) {
  const sanitizedSubPath = normalizeRelativePath(subPath)
    // trim ending slash
    .replace(/\/$/, '');
  const { mergeStrategy = MERGE_STRATEGY.ERROR } = options;
  const logger = options.logger ?? self.options?.logger;

  switch (mergeStrategy) {
    case MERGE_STRATEGY.ERROR:
      return appendError(self, other, sanitizedSubPath);
    case MERGE_STRATEGY.IGNORE_SIMILAR:
      return appendIgnoreSimilar(self, other, sanitizedSubPath);
    case MERGE_STRATEGY.IGNORE:
      return appendIgnore(self, other, sanitizedSubPath, logger);
    default:
      throw new Error(`Unknown merge strategy: ${String(mergeStrategy)}`);
  }
}

function appendError(
  self: FileCollection,
  other: FileCollection,
  sanitizedSubPath: string,
) {
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

function appendIgnore(
  self: FileCollection,
  other: FileCollection,
  sanitizedSubPath: string,
  logger: Logger | undefined,
) {
  const selfSourcesById = new Set(self.sources.map((s) => s.uuid));
  const selfSourcesByPath = new Set(self.sources.map((s) => s.relativePath));
  const ignoredSourcesById = new Map<string, ExtendedSourceItem>();
  for (const otherSource of other.sources) {
    if (selfSourcesById.has(otherSource.uuid)) {
      ignoredSourcesById.set(otherSource.uuid, otherSource);
      continue;
    }
    if (selfSourcesByPath.has(otherSource.relativePath)) {
      ignoredSourcesById.set(otherSource.uuid, otherSource);
      continue;
    }

    const source = cloneExtendedSourceItem(otherSource);
    source.originalRelativePath ??= source.relativePath;
    source.relativePath = normalizeRelativePath(
      `${sanitizedSubPath}/${source.relativePath}`,
    );

    self.sources.push(source);
  }

  const existingFiles = new Set(self.files.map((f) => f.relativePath));
  const ignoredFiles = new Map<string, FileItem>();
  for (const otherFile of other.files) {
    const relativePath = normalizeRelativePath(
      `${sanitizedSubPath}/${otherFile.relativePath}`,
    );
    if (
      ignoredSourcesById.has(otherFile.sourceUUID) ||
      existingFiles.has(relativePath)
    ) {
      ignoredFiles.set(relativePath, otherFile);
      continue;
    }
    const file = cloneFileItem(otherFile);
    file.relativePath = relativePath;

    self.files.push(file);
  }

  if (logger && (ignoredFiles.size > 0 || ignoredSourcesById.size > 0)) {
    const sources = Object.fromEntries(ignoredSourcesById.entries());
    const files = Object.fromEntries(ignoredFiles.entries());

    logger.warn({ sources, files }, 'Ignored files or sources');
  }
}

function appendIgnoreSimilar(
  self: FileCollection,
  other: FileCollection,
  sanitizedSubPath: string,
) {
  /**
   * If a file item (identified by relativePath) is already present in the `self` collection,
   *   and if the related source item (identified by uuid and relativePath) is already present in the `self`
   *   collection.
   * Then, the file item will be ignored and the source item will be marked as ignored.
   * Else, it will throw an error.
   */

  const selfSources = new Set(
    self.sources.map((s) => `${s.uuid}:${s.relativePath}`),
  );
  const selfFiles = new Set(self.files.map((f) => f.relativePath));
  const otherSources = new Map(other.sources.map((s) => [s.uuid, s]));
  const ignoredSources = new Set<string>();

  for (const otherFile of other.files) {
    const relativePath = normalizeRelativePath(
      `${sanitizedSubPath}/${otherFile.relativePath}`,
    );
    if (selfFiles.has(relativePath)) {
      const otherSource = otherSources.get(otherFile.sourceUUID);
      if (!otherSource) continue;
      const sourceRelativePath = normalizeRelativePath(
        `${sanitizedSubPath}/${otherSource.relativePath}`,
      );
      if (selfSources.has(`${otherFile.sourceUUID}:${sourceRelativePath}`)) {
        ignoredSources.add(otherFile.sourceUUID);
        continue;
      } else {
        throw new Error(`Duplicate relativePath: ${otherFile.relativePath}`);
      }
    }

    const file = cloneFileItem(otherFile);
    file.relativePath = relativePath;

    self.files.push(file);
  }

  for (const otherSource of other.sources) {
    if (ignoredSources.has(otherSource.uuid)) continue;

    const source = cloneExtendedSourceItem(otherSource);
    source.originalRelativePath ??= source.relativePath;
    source.relativePath = normalizeRelativePath(
      `${sanitizedSubPath}/${source.relativePath}`,
    );

    self.sources.push(source);
  }
}
