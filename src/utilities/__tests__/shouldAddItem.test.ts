import { describe, expect, it } from 'vitest';

import { shouldAddItem } from '../shouldAddItem.ts';

describe('Should add file', () => {
  it('Should Ignore files with . prefix', async () => {
    expect(shouldAddItem('a.txt')).toBe(true);
    expect(shouldAddItem('.dotFile')).toBe(false);
    expect(shouldAddItem('.dotFolder/a.txt')).toBe(false);
    expect(shouldAddItem('dir1/a.txt')).toBe(true);
    expect(shouldAddItem('dir1/.b.txt')).toBe(false);
  });

  it('Should exclude with substring match', async () => {
    expect(shouldAddItem('a/EXTRA/b.jdx', { exclude: '/EXTRA/' })).toBe(false);
    expect(shouldAddItem('a/b.jdx', { exclude: '/EXTRA/' })).toBe(true);
  });

  it('Should exclude with RegExp', async () => {
    expect(
      shouldAddItem('a/EXTRA/b.jdx', { exclude: /(^|\/)EXTRA(\/|$)/i }),
    ).toBe(false);
    expect(
      shouldAddItem('a/EXTRAneous/b.jdx', { exclude: /(^|\/)EXTRA(\/|$)/i }),
    ).toBe(true);
    expect(shouldAddItem('a/b.jdx', { exclude: /(^|\/)EXTRA(\/|$)/i })).toBe(
      true,
    );
  });

  it('Should exclude with array of patterns', async () => {
    const exclude = ['/EXTRA/', /\.tmp$/i];

    expect(shouldAddItem('a/EXTRA/b.jdx', { exclude })).toBe(false);
    expect(shouldAddItem('a/b.tmp', { exclude })).toBe(false);
    expect(shouldAddItem('a/b.jdx', { exclude })).toBe(true);
  });

  it('Should include files with .jdx extension', async () => {
    expect(shouldAddItem('a/b.jdx', { include: '.jdx' })).toBe(true);
    expect(shouldAddItem('a/b.txt', { include: '.jdx' })).toBe(false);
  });

  it('Should include files with .jdx regular expression', async () => {
    expect(shouldAddItem('a/b.jdx', { include: /\.jdx$/ })).toBe(true);
    expect(shouldAddItem('a/b.sdf', { include: /\.jdx$/ })).toBe(false);
  });

  it('Should include files with array of patterns', async () => {
    const include = [/\.jdx$/, /\.sdf$/];

    expect(shouldAddItem('a/b.jdx', { include })).toBe(true);
    expect(shouldAddItem('a/b.sdf', { include })).toBe(true);
    expect(shouldAddItem('a/b.txt', { include })).toBe(false);
  });

  it('Should exclude takes precedence over include', async () => {
    expect(
      shouldAddItem('a/EXTRA/b.jdx', {
        include: /\.jdx$/,
        exclude: '/EXTRA/',
      }),
    ).toBe(false);
    expect(
      shouldAddItem('a/b.jdx', {
        include: /\.jdx$/,
        exclude: '/EXTRA/',
      }),
    ).toBe(true);
  });

  it('Should exclude files containing a specific substring like "_Sg"', async () => {
    expect(
      shouldAddItem('a/H23_SgC7_PvnPm89-IfG7uR-Uk.jdx', { exclude: '_Sg' }),
    ).toBe(false);
    expect(
      shouldAddItem('a/wolfender2020_stilbeneantimicrobials_cpd2_case01.jdx', {
        exclude: '_Sg',
      }),
    ).toBe(true);
  });
});
