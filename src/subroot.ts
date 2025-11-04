import { cloneExtendedSourceItem } from './ExtendedSourceItem.ts';
import type { FileCollection } from './FileCollection.ts';
import { cloneFileItem } from './FileItem.ts';
import { normalizeRelativePath } from './utilities/normalize_relative_path.ts';

// eslint-disable-next-line jsdoc/require-jsdoc
export function subroot(
  top: FileCollection,
  sub: FileCollection,
  subPath: string,
) {
  const sanitizedSubPath = normalizeRelativePath(subPath).replace(/\/+$/, '');
  const pathMatch = `${sanitizedSubPath}/`;
  const sources = new Map(top.sources.map((source) => [source.uuid, source]));
  const addedSources = new Map<string, string>(); // top source uuid -> sub source uuid

  for (const topFile of top.files) {
    if (!topFile.relativePath.startsWith(pathMatch)) continue;

    if (!addedSources.has(topFile.sourceUUID)) {
      const source = sources.get(topFile.sourceUUID);
      assert(source, 'source');

      const subSource = cloneExtendedSourceItem(source);
      subSource.uuid = crypto.randomUUID();
      subSource.originalRelativePath =
        source.originalRelativePath ?? source.relativePath;
      subSource.relativePath = source.relativePath.slice(pathMatch.length);
      addedSources.set(topFile.sourceUUID, subSource.uuid);
      sub.sources.push(subSource);
    }

    const file = cloneFileItem(topFile);
    const sourceUUID = addedSources.get(topFile.sourceUUID);
    assert(sourceUUID, 'sourceUUID');
    file.sourceUUID = sourceUUID;
    file.relativePath = file.relativePath.slice(pathMatch.length);
    sub.files.push(file);
  }
}

function assert<T>(
  value: T,
  variableName: string,
): asserts value is Exclude<T, null | undefined | '' | false | 0> {
  if (!value) throw new Error(`Unreachable: ${variableName} is not defined`);
}
