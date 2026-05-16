# Static Utility Hub

A fully static, free-to-host utility website built with HTML/CSS/JS (Vite) and designed for GitHub Pages and Cloudflare Pages.

Each tool is available on its own dedicated page.

## Included Tools

1. JSON Formatter
2. Password Generator
3. Markdown Editor
4. QR Code Generator
5. Unit Converter
6. Regex Tester
7. Color Palette Generator
8. Diff Checker
9. Base64 Encoder/Decoder
10. Hash Generator (SHA-1, SHA-256, SHA-384, SHA-512)

## Page Routes

- `/index.html` home launcher
- `/json.html`
- `/password.html`
- `/markdown.html`
- `/qr.html`
- `/converter.html`
- `/regex.html`
- `/palette.html`
- `/diff.html`
- `/base64.html`
- `/hash.html`

## Stack

- Vite (vanilla JS)
- Marked + DOMPurify (markdown rendering)
- QRCode (QR generation)
- diff (text diff)
- Vitest (unit tests)
- Playwright (e2e tests)
- ESLint + Prettier

## Local Development

```bash
npm install
npm run dev
```

## Full Quality Pipeline

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

Run all quality checks in one go:

```bash
npm run test:all
```

## GitHub Pages Deployment

### Automatic

- Push this project to a GitHub repository.
- Ensure the default branch is `main`.
- The workflow at `.github/workflows/deploy-gh-pages.yml` deploys on each push to `main`.

### Repository Settings

- In GitHub: `Settings -> Pages`
- Source should be `GitHub Actions`

The `vite.config.js` automatically sets the correct base path in GitHub Actions.

## Cloudflare Pages Deployment

### Dashboard setup

- Create a new Pages project and connect your Git repository.
- Build command: `npm run build`
- Build output directory: `dist`

### Optional Wrangler CLI

`wrangler.jsonc` is included with:

- `pages_build_output_dir: dist`
- compatibility date set to `2026-05-15`

## Project Scripts

- `npm run dev`: start local dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run lint`: lint code
- `npm run format`: format code with Prettier
- `npm run check:format`: verify formatting
- `npm run test`: run unit tests with coverage
- `npm run test:e2e`: run end-to-end tests
- `npm run test:all`: lint + unit tests + e2e tests
