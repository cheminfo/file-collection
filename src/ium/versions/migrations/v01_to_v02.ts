import { fromIumSourceToPath } from '../../../transformation/source_zip.ts';
import type { ToIumIndexV1 } from '../v01.ts';
import type { ToIumIndexV2 } from '../v02.ts';

/**
 * Migrate index from v1 to v2.
 * Add `paths` property in `index`, associate uuid to zip path, and `<uuid>_legacy` to legacy zip path.
 * @param index - the index to migrate
 * @returns the index migrated
 */
export function migrateV1ToV2(index: ToIumIndexV1): ToIumIndexV2 {
  const paths: Record<string, string | undefined> = {};

  for (const source of index.sources) {
    const [, zipPath, legacyZipPath] = fromIumSourceToPath(source);
    paths[source.uuid] = zipPath;
    paths[`${source.uuid}_legacy`] = legacyZipPath;
  }

  return {
    ...index,
    version: 2,
    paths,
  };
}
