import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default /** @type {import('rollup').RollupOptions} */ ({
  input: {
    index: 'src/index.ts',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    entryFileNames: '[name].js',
  },
  plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })],
  external: [/^node:/]
});

