import { join } from 'path'
import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import babel from '@rollup/plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import license from 'rollup-plugin-license'
import { name } from './package.json'

// Config
const extensions = ['.ts']
const noDeclarationFiles = { compilerOptions: { declaration: false } }
const licenseFileTemplatePath = join(__dirname, 'rollupLicenseBanner.ejs')
const babelPluginTransformRuntimeOptions = {
  corejs: 3,
}

export default [
  // commonJS (should be at first)
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
            babelPluginTransformRuntimeOptions,
          ],
        ],
        babelHelpers: 'runtime',
      }),
      license({
        banner: {
          content: {
            file: licenseFileTemplatePath,
          },
        },
      }),
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
            babelPluginTransformRuntimeOptions,
          ],
        ],
        babelHelpers: 'runtime',
      }),
      license({
        banner: {
          content: {
            file: licenseFileTemplatePath,
          },
        },
      }),
    ],
  },

  // Browser-ready ESM, production + minify
  {
    input: 'src/index.ts',
    output: {
      file: `dist/${name}.mjs`,
      format: 'esm',
    },
    plugins: [
      // Compile typescript
      typescript({ tsconfigOverride: noDeclarationFiles }),

      // Add imports for babel&coreJs runtime modules
      babel({
        extensions,
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            babelPluginTransformRuntimeOptions,
          ],
        ],
        babelHelpers: 'runtime',
      }),

      // Fix/Resolve runtime imports
      commonjs(),
      nodeResolve(),

      // Bundle babel (REVIEW: Not required?)
      babel({ babelHelpers: 'bundled' }),

      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser(),

      // Add license comment (should be after minify)
      license({
        banner: {
          content: {
            file: licenseFileTemplatePath,
          },
        },
      }),
    ],
  },

  // commonJS bundle => UMD Dev
  {
    input: 'lib/asefa.js',
    output: {
      file: `dist/${name}.js`,
      format: 'umd',
      name: `${name}`,
      exports: 'named',
    },
    plugins: [
      commonjs(),
      nodeResolve(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      license({
        banner: {
          content: {
            file: licenseFileTemplatePath,
          },
        },
      }),
    ],
  },

  // commonJS bundle => UMD Prod
  {
    input: 'lib/asefa.js',
    output: {
      file: `dist/${name}.min.js`,
      format: 'umd',
      name: `${name}`,
      exports: 'named',
    },
    plugins: [
      commonjs(),
      nodeResolve(),
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
      license({
        banner: {
          content: {
            file: licenseFileTemplatePath,
          },
        },
      }),
    ],
  },
]
