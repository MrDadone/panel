import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { LanguageData } from 'shared';
import { defineConfig } from 'vite';
import dynamicPublicDirectory from 'vite-multiple-assets';
import tsconfigPaths from 'vite-tsconfig-paths';

// Minifies all JSON translation files in the dist/translations/ directory after build
const minifyTranslations = () => {
  return {
    name: 'minify-translations',
    closeBundle: () => {
      const dir = path.resolve(__dirname, 'dist/translations');

      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        let count = 0;
        let total = 0;
        let minified = 0;

        const languageData: Record<string, Record<string, LanguageData>> = {};

        files.forEach((file) => {
          if (file.endsWith('.json')) {
            const filePath = path.join(dir, file);
            try {
              const content = fs.readFileSync(filePath, 'utf-8');
              total += content.length;

              const jsonParsed = JSON.parse(content);
              languageData[file.replace('.json', '')] = { '': jsonParsed };
            } catch (error) {
              console.error(`[minify-translations] Error processing ${file}:`, error);
            }
          } else {
            const subDirPath = path.join(dir, file);
            if (fs.statSync(subDirPath).isDirectory()) {
              const subFiles = fs.readdirSync(subDirPath);
              subFiles.forEach((subFile) => {
                if (subFile.endsWith('.json')) {
                  const subFilePath = path.join(subDirPath, subFile);
                  try {
                    const content = fs.readFileSync(subFilePath, 'utf-8');
                    total += content.length;

                    const jsonParsed = JSON.parse(content);
                    if (!languageData[subFile.replace('.json', '')]) {
                      languageData[subFile.replace('.json', '')] = {};
                    }
                    languageData[subFile.replace('.json', '')][file] = jsonParsed;
                  } catch (error) {
                    console.error(`[minify-translations] Error processing ${subFile} in ${file}:`, error);
                  }
                }
              });
            }
          }
        });

        // Now write minified files
        for (const [language, namespaces] of Object.entries(languageData)) {
          const minifiedContent = JSON.stringify(namespaces);
          fs.writeFileSync(path.join(dir, `${language}.json`), minifiedContent);
          count++;
          minified += minifiedContent.length;
        }

        console.log(`[minify-translations] Minified ${count} JSON files in dist/translations`);
        console.log(`[minify-translations] Total size before minification: ${total} bytes`);
        console.log(`[minify-translations] Total size after minification: ${minified} bytes`);
      }
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    dynamicPublicDirectory(['public/**', 'extensions/*/public/**'], {
      dst(path) {
        if (path.baseFile.startsWith('extensions/')) {
          return path.dstFile.split('/').slice(2).join('/');
        }

        return path.dstFile;
      },
    }),
    minifyTranslations(),
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1024,
    target: 'es2020',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        experimentalMinChunkSize: 102400,
        manualChunks(id) {
          if (id.includes('zod/v4/locales')) {
            return 'zod-locale';
          }
          if (
            id.includes('src/providers/') ||
            id.includes('src/plugins/') ||
            id.includes('src/stores/') ||
            id.includes('src/lib/')
          ) {
            return 'shared';
          }
          if (id.includes('monaco-editor')) {
            return 'monaco-editor';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/openapi.json': `http://localhost:${process.env.BACKEND_PORT ?? 8000}`,
      '/api': `http://localhost:${process.env.BACKEND_PORT ?? 8000}`,
      '/assets': `http://localhost:${process.env.BACKEND_PORT ?? 8000}`,
      '/avatars': `http://localhost:${process.env.BACKEND_PORT ?? 8000}`,
    },
    allowedHosts: true,
  },
  publicDir: false,
});
