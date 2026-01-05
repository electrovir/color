import {mergeDeep} from '@augment-vir/common';
import {defineConfig} from '@virmator/frontend/configs/vite.config.base.js';
import {join, resolve} from 'node:path';

export default defineConfig(
    {
        forGitHubPages: true,
        packageDirPath: resolve(import.meta.dirname, '..'),
    },
    (baseConfig, basePaths) => {
        return mergeDeep(baseConfig, {
            build: {
                outDir: join(basePaths.cwd, 'dist-pages'),
                rollupOptions: {
                    input: {
                        main: join(basePaths.cwd, 'src', 'index.html'),
                        book: join(basePaths.cwd, 'src', 'book', 'index.html'),
                    },
                },
            },
        });
    },
);
