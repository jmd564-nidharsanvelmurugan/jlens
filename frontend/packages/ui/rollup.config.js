import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';


import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolves @/ path aliases to src/
 */
const aliasPlugin = () => ({
  name: 'alias-resolver',
  resolveId(source) {
    if (source.startsWith('@/')) {
      const base = path.resolve(__dirname, 'src', source.slice(2));
      // Try direct file with extensions
      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        if (fs.existsSync(base + ext) && fs.statSync(base + ext).isFile()) return { id: base + ext, external: false };
      }
      // Try index file in directory
      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        const idx = path.join(base, 'index' + ext);
        if (fs.existsSync(idx) && fs.statSync(idx).isFile()) return { id: idx, external: false };
      }
      return null;
    }
    return null;
  }
});

/**
 * Removes "use client" directives from Radix UI packages.
 */
const stripUseClientPlugin = () => ({
  name: "strip-use-client-directive",
  transform(code, id) {
    if (code.startsWith('"use client"') || code.startsWith("'use client'")) {
      return {
        code: code.replace(/^["']use client["'];?\s*/, ""),
        map: null,
      };
    }
  },
});

/** JS + CSS Build */
const jsBuild = {
  input: {
    components: 'src/components/index.tsx',
    layouts: 'src/layouts/index.tsx',
    context: 'src/context/index.tsx',
    hooks: 'src/hooks/index.tsx',
  },
  output: {
    format: 'esm',
    dir: 'dist',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: true,
  },
  external: [
    /@babel\/runtime/,
    'react', 'react-dom', 'react/jsx-runtime',
    // Heavy deps — let the app bundle them once, not the UI package
    /^next/,
    /^framer-motion/,
    /^motion-dom/,
    /^motion-utils/,
    /^date-fns/,
    /^embla-carousel/,
    /^@tanstack/,
    /^@radix-ui/,
    /^@floating-ui/,
    /^lucide-react/,
    /^class-variance-authority/,
    /^clsx/,
    /^tailwind-merge/,
    /^sonner/,
    /^next-themes/,
    /^zustand/,
    /^react-router/,
    'jsonwebtoken',
    'winston',
    'winston-daily-rotate-file',
  ],
  plugins: [
    aliasPlugin(),
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.svg']
    }),
    commonjs(),
     stripUseClientPlugin(),
    json(),
    image(),
    postcss({
      modules: false,
      minimize: true,
      extract: true
    }),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/*.stories.tsx', '**/*.test.tsx']
    }),
    babel({
      babelHelpers: 'runtime',
      extensions: ['.ts', '.tsx'],
      presets: [
        ['@babel/preset-env', { modules: false }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
      plugins: [
        ['@babel/plugin-transform-runtime', {
          regenerator: true,
          useESModules: true
        }]
      ]
    })
  ]
};

/** Type Declarations Build */
const dtsBuild = {
  input: {
    components: 'src/components/index.tsx',
    layouts: 'src/layouts/index.tsx'
  },
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  external: ['react', 'react-dom', 'class-variance-authority', 'class-variance-authority/types'],
  plugins: [aliasPlugin(), dts()]
};

export default [jsBuild, dtsBuild];
