import { defineConfig, globalIgnores } from 'eslint/config';
import cheminfo from 'eslint-config-cheminfo-typescript';

export default defineConfig(
  globalIgnores(['coverage', 'lib', 'dist', 'html']),
  cheminfo,
  {
    rules: {
      'jsdoc/lines-before-block': 'off',
      'no-loss-of-precision': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
    },
  },
);
