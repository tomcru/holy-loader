import { Options } from 'tsup';
export const tsup: Options = {
  target: 'es6',
  clean: true,
  dts: true,
  entry: ['src/index.tsx'],
  keepNames: true,
  sourcemap: true,
  format: ['cjs', 'esm'],
};
