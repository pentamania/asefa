import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import license from 'rollup-plugin-license'
import { name, version, license as LICENSE, author } from './package.json'

// Config
const extensions = ['.ts']
const noDeclarationFiles = { compilerOptions: { declaration: false } }

const banner = `/*!
 * ${name} v${version}
 * ${LICENSE} Licensed
 *
 * Copyright (C) ${author}
 */`

export default [
  // commonJS
  {
    input: 'src/index.ts',
    output: {
      file: `lib/${name}.js`,
      format: 'cjs',
    },
    external: [/@babel\/runtime/],
    plugins: [
      typescript({ useTsconfigDeclarationDir: true }),
      babel({
        extensions,
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: 3,
            },
          ],
        ],
        babelHelpers: 'runtime',
      }),
      license({ banner: banner }),
    ],
  },

  // esm
  {
    input: 'src/index.ts',
    output: {
      file: `lib/${name}.esm.js`,
      format: 'esm',
    },
    external: [/@babel\/runtime/],
    plugins: [
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: 3,
            },
          ],
        ],
        babelHelpers: 'runtime',
      }),
      license({ banner: banner }),
    ],
  },

  // UMD Dev
  // TODO: Include polyfills for umd build
  {
    input: 'src/index.ts',
    output: {
      file: `dist/${name}.js`,
      format: 'umd',
      name: `${name}`,
    },
    plugins: [
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      license({ banner: banner }),
    ],
  },

  // UMD Prod
  {
    input: 'src/index.ts',
    output: {
      file: `dist/${name}.min.js`,
      format: 'umd',
      name: `${name}`,
    },
    plugins: [
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        exclude: 'node_modules/**',
        skipPreflightCheck: true,
        babelHelpers: 'bundled',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
      license({ banner: banner }),
    ],
  },
]
