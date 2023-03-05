import * as esbuild from 'esbuild'
import civetPlugin from '@danielx/civet/esbuild-plugin'

await esbuild.build({
  bundle: false,
  entryPoints: [],
  target: 'esnext',
  outdir: './build',
  plugins: [ civetPlugin ],
})
