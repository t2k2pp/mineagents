import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode', 'sharp'],
    logLevel: 'info',
    mainFields: ['module', 'main'],
    treeShaking: true,
};

async function main() {
    if (watch) {
        const ctx = await esbuild.context(buildOptions);
        await ctx.watch();
        console.log('[esbuild] watching for changes...');
    } else {
        await esbuild.build(buildOptions);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
