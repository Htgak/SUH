import { defineConfig } from 'vite';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS && repository ? `/${repository}/` : '/';
const htmlEntries = [
  'index.html',
  'json.html',
  'password.html',
  'markdown.html',
  'qr.html',
  'converter.html',
  'regex.html',
  'palette.html',
  'diff.html',
  'base64.html',
  'hash.html',
  'ua.html',
  'flexbox.html',
  'shadow.html',
  'table.html',
  'rsa.html',
  'entropy.html',
  'escape.html',
  'morse.html',
  'scan.html'
];

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      input: htmlEntries
    }
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/utils/**/*.js']
    }
  }
});
