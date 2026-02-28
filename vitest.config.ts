/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
        exclude: ['node_modules', 'dist', 'webview-ui', 'vscodellm_ref'],
        coverage: {
            reporter: ['text', 'lcov'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
        },
    },
    resolve: {
        alias: {
            vscode: './test/mocks/vscode.ts',
        },
    },
});
