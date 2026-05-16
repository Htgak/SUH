import { marked } from 'marked';
import DOMPurify from 'dompurify';
import QRCode from 'qrcode';
import { formatJson, minifyJson, validateJson } from './utils/json.js';
import { generatePassword, getPasswordStrength, calculateEntropy } from './utils/password.js';
import { convertUnit, getUnitsByCategory } from './utils/unitConverter.js';
import { highlightMatches, testRegex } from './utils/regex.js';
import { generatePalette } from './utils/palette.js';
import { buildDiff } from './utils/diff.js';
import { decodeBase64, encodeBase64 } from './utils/base64.js';
import { hashText, SUPPORTED_HASHES } from './utils/hash.js';
import { parseUserAgent } from './utils/ua.js';

marked.setOptions({ breaks: true, gfm: true });

const TOOLS = [
  {
    id: 'json',
    title: 'JSON Formatter',
    description: 'Format, minify, and validate JSON instantly.',
    file: 'json.html'
  },
  {
    id: 'password',
    title: 'Password Generator',
    description: 'Generate strong random passwords with flexible options.',
    file: 'password.html'
  },
  {
    id: 'markdown',
    title: 'Markdown Editor',
    description: 'Live markdown preview with sanitization for safety.',
    file: 'markdown.html'
  },
  {
    id: 'qr',
    title: 'QR Code Generator',
    description: 'Generate QR codes from any text or link.',
    file: 'qr.html'
  },
  {
    id: 'converter',
    title: 'Unit Converter',
    description: 'Quick conversions across popular categories.',
    file: 'converter.html'
  },
  {
    id: 'regex',
    title: 'Regex Tester',
    description: 'Validate patterns and inspect all matches.',
    file: 'regex.html'
  },
  {
    id: 'palette',
    title: 'Color Palette Generator',
    description: 'Create palettes for branding, UI, and illustration.',
    file: 'palette.html'
  },
  {
    id: 'diff',
    title: 'Diff Checker',
    description: 'Compare two text blocks and highlight line changes.',
    file: 'diff.html'
  },
  {
    id: 'base64',
    title: 'Base64 Encoder / Decoder',
    description: 'Encode plain text or decode Base64 text.',
    file: 'base64.html'
  },
  {
    id: 'hash',
    title: 'Hash Generator',
    description: 'Generate secure hashes using Web Crypto algorithms.',
    file: 'hash.html'
  },
  {
    id: 'ua',
    title: 'User Agent Parser',
    description: 'Analyze browser user agent string.',
    file: 'ua.html'
  },
  {
    id: 'flexbox',
    title: 'CSS Flexbox & Grid Builder',
    description: 'Interactive CSS Flexbox and Grid builder.',
    file: 'flexbox.html'
  },
  {
    id: 'shadow',
    title: 'Box-Shadow & Glassmorphism',
    description: 'Generate CSS box-shadow and glassmorphism effects.',
    file: 'shadow.html'
  },
  {
    id: 'table',
    title: 'HTML Table Generator',
    description: 'Generate clean HTML and CSS table code.',
    file: 'table.html'
  },
  {
    id: 'rsa',
    title: 'RSA Key Pair Generator',
    description: 'Generate RSA public and private key pairs.',
    file: 'rsa.html'
  },
  {
    id: 'entropy',
    title: 'Password Entropy Analyzer',
    description: 'Analyze password strength and entropy.',
    file: 'entropy.html'
  },
  {
    id: 'escape',
    title: 'HTML Entity / JS Escaper',
    description: 'Escape HTML entities and JavaScript strings.',
    file: 'escape.html'
  },
  {
    id: 'morse',
    title: 'Morse Code Translator',
    description: 'Convert text to Morse code and play audio.',
    file: 'morse.html'
  },
  {
    id: 'scan',
    title: 'Webcam QR & Barcode Scanner',
    description: 'Scan QR codes and barcodes using your webcam.',
    file: 'scan.html'
  }
];

function copyToClipboard(value) {
  if (!navigator.clipboard) {
    return Promise.reject(new Error('Clipboard is not supported in this browser.'));
  }

  return navigator.clipboard.writeText(value);
}

function getNavLinks(currentPage) {
  const homeLink =
    currentPage === 'home'
      ? '<a class="is-active" href="/">Home</a>'
      : '<a href="/">Home</a>';

  const toolLinks = TOOLS.map((tool) => {
    const active = tool.id === currentPage ? ' class="is-active"' : '';
    return `<a${active} href="/${tool.id}">${tool.title.replace(' Generator', '').replace(' Formatter', '')}</a>`;
  }).join('');

  return `${homeLink}${toolLinks}`;
}

function renderShell({ currentPage, title, subtitle, content }) {
  return `
    <div class="page-shell">
      <header class="hero">
        <h1>${title}</h1>
        <p class="hero-copy">${subtitle}</p>
        <nav class="quick-links" aria-label="Site navigation">
          ${getNavLinks(currentPage)}
        </nav>
      </header>

      <main class="tools-single">
        ${content}
      </main>

      <footer class="footer"></footer>
    </div>
  `;
}

function createToolCard(tool) {
  return `
    <article class="tool-launch-card">
      <h2>${tool.title}</h2>
      <p>${tool.description}</p>
      <a class="btn" href="/${tool.id}">Open Tool</a>
    </article>
  `;
}

function renderHomePage(root) {
  root.innerHTML = renderShell({
    currentPage: 'home',
    title: 'Static Utility Hub',
    subtitle:
      'Use each utility on its own dedicated page for cleaner workflows, easy sharing, and better focus.',
    content: `<section class="tools-grid">${TOOLS.map(createToolCard).join('')}</section>`
  });
}

function createToolSection(tool, content) {
  return `
    <section class="tool-card" id="${tool.id}-tool">
      <header class="tool-header">
        <h2>${tool.title}</h2>
        <p>${tool.description}</p>
      </header>
      ${content}
    </section>
  `;
}

function renderJsonPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Paste JSON and format, minify, validate, and copy the output in one place.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <textarea id="json-input" class="text-area" rows="10" placeholder='{"project":"utility-hub","tools":10}'></textarea>
          <div class="button-row">
            <button id="json-format" class="btn">Format</button>
            <button id="json-minify" class="btn ghost">Minify</button>
            <button id="json-validate" class="btn ghost">Validate</button>
            <button id="json-copy" class="btn ghost">Copy Output</button>
          </div>
          <p id="json-status" class="status"></p>
          <pre id="json-output" class="result-block" aria-live="polite"></pre>
        </div>
      `
    )
  });

  const jsonInput = root.querySelector('#json-input');
  const jsonOutput = root.querySelector('#json-output');
  const jsonStatus = root.querySelector('#json-status');

  function updateJsonResult(callback, successText) {
    try {
      const result = callback(jsonInput.value);
      jsonOutput.textContent = result;
      jsonStatus.textContent = successText;
      jsonStatus.className = 'status success';
    } catch (error) {
      jsonStatus.textContent = error instanceof Error ? error.message : 'Invalid JSON.';
      jsonStatus.className = 'status error';
    }
  }

  root.querySelector('#json-format').addEventListener('click', () => {
    updateJsonResult((value) => formatJson(value, 2), 'JSON formatted successfully.');
  });

  root.querySelector('#json-minify').addEventListener('click', () => {
    updateJsonResult(minifyJson, 'JSON minified successfully.');
  });

  root.querySelector('#json-validate').addEventListener('click', () => {
    const result = validateJson(jsonInput.value);
    if (result.valid) {
      jsonStatus.textContent = 'JSON is valid.';
      jsonStatus.className = 'status success';
    } else {
      jsonStatus.textContent = result.error;
      jsonStatus.className = 'status error';
    }
  });

  root.querySelector('#json-copy').addEventListener('click', async () => {
    try {
      await copyToClipboard(jsonOutput.textContent);
      jsonStatus.textContent = 'Output copied.';
      jsonStatus.className = 'status success';
    } catch (error) {
      jsonStatus.textContent = error instanceof Error ? error.message : 'Copy failed.';
      jsonStatus.className = 'status error';
    }
  });
}

function renderPasswordPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Generate secure passwords and check strength instantly.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div class="inline-inputs">
            <label>
              Length
              <input id="pw-length" type="range" min="4" max="64" value="16" />
            </label>
            <output id="pw-length-value">16</output>
          </div>
          <div class="checkbox-grid">
            <label><input id="pw-lower" type="checkbox" checked />Lowercase</label>
            <label><input id="pw-upper" type="checkbox" checked />Uppercase</label>
            <label><input id="pw-numbers" type="checkbox" checked />Numbers</label>
            <label><input id="pw-symbols" type="checkbox" checked />Symbols</label>
            <label><input id="pw-ambiguous" type="checkbox" />Exclude Ambiguous</label>
          </div>
          <div class="button-row">
            <button id="pw-generate" class="btn">Generate</button>
            <button id="pw-copy" class="btn ghost">Copy</button>
          </div>
          <input id="pw-output" class="result-input" readonly aria-label="Generated password" />
          <div class="meter-wrap">
            <progress id="pw-strength" max="100" value="0"></progress>
            <span id="pw-strength-label">Strength: N/A</span>
          </div>
        </div>
      `
    )
  });

  const pwLength = root.querySelector('#pw-length');
  const pwLengthValue = root.querySelector('#pw-length-value');
  const pwOutput = root.querySelector('#pw-output');
  const pwMeter = root.querySelector('#pw-strength');
  const pwMeterLabel = root.querySelector('#pw-strength-label');

  pwLength.addEventListener('input', () => {
    pwLengthValue.textContent = pwLength.value;
  });

  function buildPassword() {
    try {
      const password = generatePassword({
        length: Number(pwLength.value),
        useLowercase: root.querySelector('#pw-lower').checked,
        useUppercase: root.querySelector('#pw-upper').checked,
        useNumbers: root.querySelector('#pw-numbers').checked,
        useSymbols: root.querySelector('#pw-symbols').checked,
        excludeAmbiguous: root.querySelector('#pw-ambiguous').checked
      });

      pwOutput.value = password;
      const strength = getPasswordStrength(password);
      pwMeter.value = strength.value;
      pwMeterLabel.textContent = `Strength: ${strength.label}`;
      pwMeterLabel.className = strength.label === 'Strong' ? 'status success' : 'status';
    } catch (error) {
      pwOutput.value = '';
      pwMeter.value = 0;
      pwMeterLabel.textContent =
        error instanceof Error ? error.message : 'Unable to generate password.';
      pwMeterLabel.className = 'status error';
    }
  }

  root.querySelector('#pw-generate').addEventListener('click', buildPassword);
  root.querySelector('#pw-copy').addEventListener('click', async () => {
    if (!pwOutput.value) return;
    try {
      await copyToClipboard(pwOutput.value);
      pwMeterLabel.textContent = 'Password copied.';
      pwMeterLabel.className = 'status success';
    } catch (error) {
      pwMeterLabel.textContent = error instanceof Error ? error.message : 'Copy failed.';
      pwMeterLabel.className = 'status error';
    }
  });

  buildPassword();
}

function renderMarkdownPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Write markdown on the left and get a safe live preview on the right.',
    content: createToolSection(
      tool,
      `
        <div class="two-col">
          <textarea id="md-input" class="text-area" rows="14" placeholder="# Notes\n\n- Build once\n- Deploy free"></textarea>
          <article id="md-output" class="preview" aria-live="polite"></article>
        </div>
      `
    )
  });

  const markdownInput = root.querySelector('#md-input');
  const markdownOutput = root.querySelector('#md-output');

  function renderMarkdown() {
    const html = marked.parse(markdownInput.value);
    markdownOutput.innerHTML = DOMPurify.sanitize(html);
  }

  markdownInput.addEventListener('input', renderMarkdown);
  markdownInput.value = '# Utility Hub\n\nWrite markdown on the left and preview on the right.';
  renderMarkdown();
}

function renderQrPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Create QR codes for links, text, or any short content.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <input id="qr-input" class="text-input" placeholder="https://example.com" />
          <div class="inline-inputs">
            <label>
              Size
              <select id="qr-size">
                <option value="180">180px</option>
                <option value="240" selected>240px</option>
                <option value="320">320px</option>
              </select>
            </label>
            <button id="qr-generate" class="btn">Generate QR</button>
          </div>
          <div class="qr-wrap">
            <img id="qr-output" alt="Generated QR code" />
          </div>
        </div>
      `
    )
  });

  const qrInput = root.querySelector('#qr-input');
  const qrSize = root.querySelector('#qr-size');
  const qrOutput = root.querySelector('#qr-output');

  async function renderQr() {
    const text = qrInput.value.trim();
    if (!text) return;

    const dataUrl = await QRCode.toDataURL(text, {
      margin: 1,
      width: Number(qrSize.value),
      color: {
        dark: '#111827',
        light: '#ffffff'
      }
    });

    qrOutput.src = dataUrl;
  }

  root.querySelector('#qr-generate').addEventListener('click', async () => {
    try {
      await renderQr();
    } catch {
      qrOutput.removeAttribute('src');
    }
  });

  qrInput.value = 'https://pages.dev/';
  renderQr();
}

function renderConverterPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Convert values across length, weight, temperature, area, and speed.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div class="three-col">
            <label>
              Category
              <select id="unit-category">
                <option value="length">Length</option>
                <option value="weight">Weight</option>
                <option value="temperature">Temperature</option>
                <option value="area">Area</option>
                <option value="speed">Speed</option>
              </select>
            </label>
            <label>
              From
              <select id="unit-from"></select>
            </label>
            <label>
              To
              <select id="unit-to"></select>
            </label>
          </div>
          <div class="inline-inputs">
            <input id="unit-value" class="text-input" type="number" step="any" placeholder="Enter value" />
            <button id="unit-convert" class="btn">Convert</button>
          </div>
          <p id="unit-output" class="status" aria-live="polite"></p>
        </div>
      `
    )
  });

  const categorySelect = root.querySelector('#unit-category');
  const fromSelect = root.querySelector('#unit-from');
  const toSelect = root.querySelector('#unit-to');
  const unitOutput = root.querySelector('#unit-output');

  function populateUnits() {
    const units = getUnitsByCategory(categorySelect.value);
    fromSelect.innerHTML = units.map((unit) => `<option value="${unit}">${unit}</option>`).join('');
    toSelect.innerHTML = units.map((unit) => `<option value="${unit}">${unit}</option>`).join('');
    if (units.length > 1) {
      toSelect.value = units[1];
    }
  }

  populateUnits();
  categorySelect.addEventListener('change', populateUnits);

  root.querySelector('#unit-convert').addEventListener('click', () => {
    const value = root.querySelector('#unit-value').value;
    try {
      const converted = convertUnit(categorySelect.value, fromSelect.value, toSelect.value, value);
      unitOutput.textContent = `${value} ${fromSelect.value} = ${converted.toFixed(6)} ${toSelect.value}`;
      unitOutput.className = 'status success';
    } catch (error) {
      unitOutput.textContent = error instanceof Error ? error.message : 'Conversion failed.';
      unitOutput.className = 'status error';
    }
  });
}

function renderRegexPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Test regex patterns against sample text and inspect each match.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div class="three-col">
            <label>
              Pattern
              <input id="regex-pattern" class="text-input" value="\\b\\w{4}\\b" />
            </label>
            <label>
              Flags
              <input id="regex-flags" class="text-input" value="g" />
            </label>
            <button id="regex-run" class="btn align-end">Run</button>
          </div>
          <textarea id="regex-input" class="text-area" rows="10" placeholder="Type text to test regex..."></textarea>
          <p id="regex-status" class="status"></p>
          <div id="regex-highlight" class="result-block"></div>
          <ul id="regex-matches" class="match-list"></ul>
        </div>
      `
    )
  });

  const regexPattern = root.querySelector('#regex-pattern');
  const regexFlags = root.querySelector('#regex-flags');
  const regexInput = root.querySelector('#regex-input');
  const regexStatus = root.querySelector('#regex-status');
  const regexMatches = root.querySelector('#regex-matches');
  const regexHighlight = root.querySelector('#regex-highlight');

  function executeRegex() {
    const result = testRegex(regexPattern.value, regexFlags.value, regexInput.value);
    regexMatches.innerHTML = '';

    if (!result.valid) {
      regexStatus.textContent = result.error;
      regexStatus.className = 'status error';
      regexHighlight.innerHTML = '';
      return;
    }

    regexHighlight.innerHTML = highlightMatches(
      regexInput.value,
      regexPattern.value,
      regexFlags.value
    );
    if (!result.matches.length) {
      regexStatus.textContent = 'No matches found.';
      regexStatus.className = 'status';
      return;
    }

    regexStatus.textContent = `${result.matches.length} match(es) found.`;
    regexStatus.className = 'status success';

    regexMatches.innerHTML = result.matches
      .map((match) => `<li><code>${match.match}</code> at index ${match.index}</li>`)
      .join('');
  }

  root.querySelector('#regex-run').addEventListener('click', executeRegex);
  executeRegex();
}

function renderPalettePage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Generate reusable palettes and click any swatch to copy its hex code.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div class="three-col">
            <label>
              Base Color
              <input id="palette-base" type="color" value="#f97316" />
            </label>
            <label>
              Mode
              <select id="palette-mode">
                <option value="analogous">Analogous</option>
                <option value="complementary">Complementary</option>
                <option value="triadic">Triadic</option>
                <option value="random">Randomized</option>
              </select>
            </label>
            <button id="palette-generate" class="btn align-end">Generate</button>
          </div>
          <div id="palette-output" class="palette-row"></div>
        </div>
      `
    )
  });

  const paletteBase = root.querySelector('#palette-base');
  const paletteMode = root.querySelector('#palette-mode');
  const paletteOutput = root.querySelector('#palette-output');

  function renderPalette() {
    const colors = generatePalette(paletteBase.value, paletteMode.value);
    paletteOutput.innerHTML = colors
      .map(
        (color) =>
          `<button class="swatch" style="background:${color}" title="${color}" data-color="${color}"><span>${color}</span></button>`
      )
      .join('');

    paletteOutput.querySelectorAll('.swatch').forEach((swatch) => {
      swatch.addEventListener('click', async () => {
        try {
          await copyToClipboard(swatch.dataset.color);
        } catch {
          // Silent fallback to avoid UI noise on unsupported clipboard browsers.
        }
      });
    });
  }

  root.querySelector('#palette-generate').addEventListener('click', renderPalette);
  renderPalette();
}

function renderDiffPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Compare two blocks of text and highlight line-by-line changes.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div class="two-col">
            <textarea id="diff-before" class="text-area" rows="11" placeholder="Original text"></textarea>
            <textarea id="diff-after" class="text-area" rows="11" placeholder="Updated text"></textarea>
          </div>
          <button id="diff-run" class="btn">Compare</button>
          <p id="diff-status" class="status"></p>
          <div id="diff-output" class="result-block"></div>
        </div>
      `
    )
  });

  root.querySelector('#diff-run').addEventListener('click', () => {
    const before = root.querySelector('#diff-before').value;
    const after = root.querySelector('#diff-after').value;
    const diff = buildDiff(before, after);

    root.querySelector('#diff-output').innerHTML =
      diff.html || '<div class="diff-unchanged">No differences detected.</div>';
    root.querySelector('#diff-status').textContent =
      `Added lines: ${diff.addedCount || 0}, Removed lines: ${diff.removedCount || 0}`;
    root.querySelector('#diff-status').className = 'status success';
  });
}

function renderBase64Page(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Encode plain text to Base64 or decode Base64 to readable text.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <textarea id="base64-input" class="text-area" rows="9" placeholder="Enter plain text or Base64"></textarea>
          <div class="button-row">
            <button id="base64-encode" class="btn">Encode</button>
            <button id="base64-decode" class="btn ghost">Decode</button>
            <button id="base64-copy" class="btn ghost">Copy Output</button>
          </div>
          <textarea id="base64-output" class="text-area" rows="5" readonly></textarea>
          <p id="base64-status" class="status"></p>
        </div>
      `
    )
  });

  const baseInput = root.querySelector('#base64-input');
  const baseOutput = root.querySelector('#base64-output');
  const baseStatus = root.querySelector('#base64-status');

  root.querySelector('#base64-encode').addEventListener('click', () => {
    try {
      baseOutput.value = encodeBase64(baseInput.value);
      baseStatus.textContent = 'Encoded successfully.';
      baseStatus.className = 'status success';
    } catch (error) {
      baseStatus.textContent = error instanceof Error ? error.message : 'Encoding failed.';
      baseStatus.className = 'status error';
    }
  });

  root.querySelector('#base64-decode').addEventListener('click', () => {
    try {
      baseOutput.value = decodeBase64(baseInput.value);
      baseStatus.textContent = 'Decoded successfully.';
      baseStatus.className = 'status success';
    } catch (error) {
      baseStatus.textContent = error instanceof Error ? error.message : 'Invalid Base64 input.';
      baseStatus.className = 'status error';
    }
  });

  root.querySelector('#base64-copy').addEventListener('click', async () => {
    try {
      await copyToClipboard(baseOutput.value);
      baseStatus.textContent = 'Output copied.';
      baseStatus.className = 'status success';
    } catch (error) {
      baseStatus.textContent = error instanceof Error ? error.message : 'Copy failed.';
      baseStatus.className = 'status error';
    }
  });
}

function renderHashPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Generate SHA hashes in the browser using Web Crypto.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <textarea id="hash-input" class="text-area" rows="8" placeholder="Text to hash"></textarea>
          <div class="inline-inputs">
            <label>
              Algorithm
              <select id="hash-algo"></select>
            </label>
            <button id="hash-generate" class="btn">Generate Hash</button>
            <button id="hash-copy" class="btn ghost">Copy Hash</button>
          </div>
          <textarea id="hash-output" class="text-area" rows="5" readonly></textarea>
          <p id="hash-status" class="status"></p>
        </div>
      `
    )
  });

  const hashAlgo = root.querySelector('#hash-algo');
  const hashInput = root.querySelector('#hash-input');
  const hashOutput = root.querySelector('#hash-output');
  const hashStatus = root.querySelector('#hash-status');

  hashAlgo.innerHTML = SUPPORTED_HASHES.map(
    (algorithm) => `<option value="${algorithm}">${algorithm}</option>`
  ).join('');

  root.querySelector('#hash-generate').addEventListener('click', async () => {
    try {
      const hash = await hashText(hashInput.value, hashAlgo.value);
      hashOutput.value = hash;
      hashStatus.textContent = 'Hash generated.';
      hashStatus.className = 'status success';
    } catch (error) {
      hashStatus.textContent = error instanceof Error ? error.message : 'Unable to generate hash.';
      hashStatus.className = 'status error';
    }
  });

  root.querySelector('#hash-copy').addEventListener('click', async () => {
    try {
      await copyToClipboard(hashOutput.value);
      hashStatus.textContent = 'Hash copied.';
      hashStatus.className = 'status success';
    } catch (error) {
      hashStatus.textContent = error instanceof Error ? error.message : 'Copy failed.';
      hashStatus.className = 'status error';
    }
  });

  hashInput.value = 'Static utility websites scale beautifully.';
}

function renderUserAgentPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Analyze browser user agent string.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <textarea id="ua-input" class="text-area" rows="4" placeholder="Enter user agent string..."></textarea>
          <div class="button-row">
            <button id="ua-parse" class="btn">Parse</button>
            <button id="ua-current" class="btn ghost">Use My User Agent</button>
          </div>
          <div id="ua-output" class="result-block" style="display:none; padding: 1rem;">
            <div class="stat-grid" style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              <div><strong>Browser:</strong> <span id="ua-browser">-</span></div>
              <div><strong>Version:</strong> <span id="ua-version">-</span></div>
              <div><strong>OS:</strong> <span id="ua-os">-</span></div>
              <div><strong>Device:</strong> <span id="ua-device">-</span></div>
            </div>
          </div>
        </div>
      `
    )
  });

  const uaInput = root.querySelector('#ua-input');
  const uaOutput = root.querySelector('#ua-output');
  const uaBrowser = root.querySelector('#ua-browser');
  const uaVersion = root.querySelector('#ua-version');
  const uaOs = root.querySelector('#ua-os');
  const uaDevice = root.querySelector('#ua-device');

  function executeParse() {
    const result = parseUserAgent(uaInput.value);
    uaBrowser.textContent = result.browser;
    uaVersion.textContent = result.version;
    uaOs.textContent = result.os;
    uaDevice.textContent = result.device;
    uaOutput.style.display = 'block';
  }

  root.querySelector('#ua-parse').addEventListener('click', executeParse);
  root.querySelector('#ua-current').addEventListener('click', () => {
    uaInput.value = navigator.userAgent;
    executeParse();
  });

  uaInput.value = navigator.userAgent;
  executeParse();
}

function renderFlexboxPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Interactive CSS Flexbox and Grid builder.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div class="two-col">
            <div class="controls stack">
              <h3>Flexbox Controls</h3>
              <label>
                Flex Direction
                <select id="fb-direction">
                  <option value="row">row</option>
                  <option value="row-reverse">row-reverse</option>
                  <option value="column">column</option>
                  <option value="column-reverse">column-reverse</option>
                </select>
              </label>
              <label>
                Justify Content
                <select id="fb-justify">
                  <option value="flex-start">flex-start</option>
                  <option value="flex-end">flex-end</option>
                  <option value="center">center</option>
                  <option value="space-between">space-between</option>
                  <option value="space-around">space-around</option>
                  <option value="space-evenly">space-evenly</option>
                </select>
              </label>
              <label>
                Align Items
                <select id="fb-align">
                  <option value="stretch">stretch</option>
                  <option value="flex-start">flex-start</option>
                  <option value="flex-end">flex-end</option>
                  <option value="center">center</option>
                  <option value="baseline">baseline</option>
                </select>
              </label>
              <button id="fb-copy" class="btn">Copy CSS</button>
            </div>
            <div class="preview-container" style="border: 1px solid var(--border-color, #ccc); padding: 1rem; min-height: 200px; display: flex; background: var(--bg-secondary, #f9fafb);" id="fb-preview">
              <div style="background: #f97316; color: white; padding: 1rem; border-radius: 4px; margin: 0.5rem;">Item 1</div>
              <div style="background: #3b82f6; color: white; padding: 1rem; border-radius: 4px; margin: 0.5rem;">Item 2</div>
              <div style="background: #10b981; color: white; padding: 1rem; border-radius: 4px; margin: 0.5rem;">Item 3</div>
            </div>
          </div>
          <pre id="fb-css" class="result-block"></pre>
        </div>
      `
    )
  });

  const fbPreview = root.querySelector('#fb-preview');
  const fbDirection = root.querySelector('#fb-direction');
  const fbJustify = root.querySelector('#fb-justify');
  const fbAlign = root.querySelector('#fb-align');
  const fbCss = root.querySelector('#fb-css');

  function updateFlexbox() {
    fbPreview.style.flexDirection = fbDirection.value;
    fbPreview.style.justifyContent = fbJustify.value;
    fbPreview.style.alignItems = fbAlign.value;

    const css = `.container {\n  display: flex;\n  flex-direction: ${fbDirection.value};\n  justify-content: ${fbJustify.value};\n  align-items: ${fbAlign.value};\n}`;
    fbCss.textContent = css;
  }

  fbDirection.addEventListener('change', updateFlexbox);
  fbJustify.addEventListener('change', updateFlexbox);
  fbAlign.addEventListener('change', updateFlexbox);

  root.querySelector('#fb-copy').addEventListener('click', async () => {
    try {
      await copyToClipboard(fbCss.textContent);
    } catch {
      // Handle error
    }
  });

  updateFlexbox();
}

function renderShadowPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Generate CSS box-shadow and glassmorphism effects.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div class="two-col">
            <div class="controls stack">
              <h3>Box Shadow</h3>
              <label>Horizontal Offset <input id="bs-x" type="range" min="-50" max="50" value="0" /></label>
              <label>Vertical Offset <input id="bs-y" type="range" min="-50" max="50" value="10" /></label>
              <label>Blur Radius <input id="bs-blur" type="range" min="0" max="100" value="20" /></label>
              <label>Spread Radius <input id="bs-spread" type="range" min="-20" max="20" value="0" /></label>
              <label>Shadow Color <input id="bs-color" type="color" value="#000000" /></label>
              <label>Shadow Opacity <input id="bs-opacity" type="range" min="0" max="100" value="25" /></label>
              
              <h3>Glassmorphism</h3>
              <label>Blur (Backdrop) <input id="gm-blur" type="range" min="0" max="20" value="10" /></label>
              <label>Background Opacity <input id="gm-bg-opacity" type="range" min="0" max="100" value="20" /></label>
              
              <button id="shadow-copy" class="btn">Copy CSS</button>
            </div>
            <div class="preview-area" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 3rem; border-radius: 8px; display: flex; justify-content: center; align-items: center;">
              <div id="shadow-preview" style="width: 150px; height: 150px; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 12px;"></div>
            </div>
          </div>
          <pre id="shadow-css" class="result-block"></pre>
        </div>
      `
    )
  });

  const preview = root.querySelector('#shadow-preview');
  const bsX = root.querySelector('#bs-x');
  const bsY = root.querySelector('#bs-y');
  const bsBlur = root.querySelector('#bs-blur');
  const bsSpread = root.querySelector('#bs-spread');
  const bsColor = root.querySelector('#bs-color');
  const bsOpacity = root.querySelector('#bs-opacity');
  const gmBlur = root.querySelector('#gm-blur');
  const gmBgOpacity = root.querySelector('#gm-bg-opacity');
  const cssOutput = root.querySelector('#shadow-css');

  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  function updateEffect() {
    const shadowColor = hexToRgba(bsColor.value, bsOpacity.value / 100);
    const boxShadow = `${bsX.value}px ${bsY.value}px ${bsBlur.value}px ${bsSpread.value}px ${shadowColor}`;
    
    const backdropBlur = `blur(${gmBlur.value}px)`;
    const bgOpacity = gmBgOpacity.value / 100;
    const background = `rgba(255, 255, 255, ${bgOpacity})`;

    preview.style.boxShadow = boxShadow;
    preview.style.backdropFilter = backdropBlur;
    preview.style.webkitBackdropFilter = backdropBlur; // For Safari
    preview.style.background = background;

    const css = `.glass-box {\n  background: ${background};\n  backdrop-filter: ${backdropBlur};\n  -webkit-backdrop-filter: ${backdropBlur};\n  box-shadow: ${boxShadow};\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  border-radius: 12px;\n}`;
    cssOutput.textContent = css;
  }

  const controls = [bsX, bsY, bsBlur, bsSpread, bsColor, bsOpacity, gmBlur, gmBgOpacity];
  controls.forEach(control => control.addEventListener('input', updateEffect));

  root.querySelector('#shadow-copy').addEventListener('click', async () => {
    try {
      await copyToClipboard(cssOutput.textContent);
    } catch {
      // Handle error
    }
  });

  updateEffect();
}

function renderTablePage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Generate clean HTML and CSS table code.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div class="inline-inputs">
            <label>Rows <input id="table-rows" type="number" min="1" max="50" value="3" /></label>
            <label>Cols <input id="table-cols" type="number" min="1" max="20" value="3" /></label>
            <button id="table-generate" class="btn">Generate Table</button>
          </div>
          <div class="button-row">
            <button id="table-copy-html" class="btn ghost">Copy HTML</button>
            <button id="table-copy-css" class="btn ghost">Copy CSS</button>
          </div>
          <div id="table-preview" class="result-block" style="overflow-x: auto; padding: 1rem;"></div>
          <pre id="table-code" class="result-block"></pre>
        </div>
      `
    )
  });

  const rowsInput = root.querySelector('#table-rows');
  const colsInput = root.querySelector('#table-cols');
  const preview = root.querySelector('#table-preview');
  const codeOutput = root.querySelector('#table-code');

  function generateTable() {
    const rows = parseInt(rowsInput.value) || 3;
    const cols = parseInt(colsInput.value) || 3;

    let html = '<table class="custom-table">\n';
    html += '  <thead>\n    <tr>\n';
    for (let j = 0; j < cols; j++) {
      html += `      <th>Header ${j + 1}</th>\n`;
    }
    html += '    </tr>\n  </thead>\n  <tbody>\n';
    for (let i = 0; i < rows; i++) {
      html += '    <tr>\n';
      for (let j = 0; j < cols; j++) {
        html += `      <td>Data ${i + 1}-${j + 1}</td>\n`;
      }
      html += '    </tr>\n';
    }
    html += '  </tbody>\n</table>';

    preview.innerHTML = html;
    codeOutput.textContent = html;
  }

  root.querySelector('#table-generate').addEventListener('click', generateTable);

  root.querySelector('#table-copy-html').addEventListener('click', async () => {
    try {
      await copyToClipboard(codeOutput.textContent);
    } catch {}
  });

  const cssCode = `.custom-table {\n  width: 100%;\n  border-collapse: collapse;\n  margin: 1rem 0;\n}\n.custom-table th, .custom-table td {\n  border: 1px solid #ddd;\n  padding: 8px;\n  text-align: left;\n}\n.custom-table th {\n  background-color: #f4f4f5;\n  font-weight: bold;\n}`;

  root.querySelector('#table-copy-css').addEventListener('click', async () => {
    try {
      await copyToClipboard(cssCode);
    } catch {}
  });

  generateTable();
}

function renderRsaPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Generate RSA public and private key pairs.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div class="inline-inputs">
            <label>
              Key Size
              <select id="rsa-size">
                <option value="1024">1024 bit</option>
                <option value="2048" selected>2048 bit</option>
                <option value="4096">4096 bit</option>
              </select>
            </label>
            <button id="rsa-generate" class="btn">Generate Keys</button>
          </div>
          <p id="rsa-status" class="status"></p>
          <div class="two-col">
            <div class="stack">
              <h3>Public Key</h3>
              <textarea id="rsa-public" class="text-area" rows="10" readonly placeholder="Public key will appear here..."></textarea>
              <button id="rsa-copy-public" class="btn ghost">Copy Public Key</button>
            </div>
            <div class="stack">
              <h3>Private Key</h3>
              <textarea id="rsa-private" class="text-area" rows="10" readonly placeholder="Private key will appear here..."></textarea>
              <button id="rsa-copy-private" class="btn ghost">Copy Private Key</button>
            </div>
          </div>
        </div>
      `
    )
  });

  const rsaSize = root.querySelector('#rsa-size');
  const rsaStatus = root.querySelector('#rsa-status');
  const rsaPublic = root.querySelector('#rsa-public');
  const rsaPrivate = root.querySelector('#rsa-private');

  function arrayBufferToString(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return binary;
  }

  function formatAsPEM(str) {
    const lines = [];
    for (let i = 0; i < str.length; i += 64) {
      lines.push(str.slice(i, i + 64));
    }
    return lines.join('\n');
  }

  function spkiToPEM(keydata) {
    const keydataS = arrayBufferToString(keydata);
    const keydataB64 = window.btoa(keydataS);
    return `-----BEGIN PUBLIC KEY-----\n${formatAsPEM(keydataB64)}\n-----END PUBLIC KEY-----`;
  }

  function pkcs8ToPEM(keydata) {
    const keydataS = arrayBufferToString(keydata);
    const keydataB64 = window.btoa(keydataS);
    return `-----BEGIN PRIVATE KEY-----\n${formatAsPEM(keydataB64)}\n-----END PRIVATE KEY-----`;
  }

  async function generateKeys() {
    rsaStatus.textContent = 'Generating keys... (this may take a few seconds)';
    rsaStatus.className = 'status';
    rsaPublic.value = '';
    rsaPrivate.value = '';

    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: parseInt(rsaSize.value),
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );

      const exportedPublic = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      const exportedPrivate = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      rsaPublic.value = spkiToPEM(exportedPublic);
      rsaPrivate.value = pkcs8ToPEM(exportedPrivate);

      rsaStatus.textContent = 'Keys generated successfully.';
      rsaStatus.className = 'status success';
    } catch (error) {
      rsaStatus.textContent = 'Generation failed: ' + error.message;
      rsaStatus.className = 'status error';
    }
  }

  root.querySelector('#rsa-generate').addEventListener('click', generateKeys);

  root.querySelector('#rsa-copy-public').addEventListener('click', async () => {
    try {
      await copyToClipboard(rsaPublic.value);
    } catch {}
  });

  root.querySelector('#rsa-copy-private').addEventListener('click', async () => {
    try {
      await copyToClipboard(rsaPrivate.value);
    } catch {}
  });
}

function renderEntropyPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Analyze password strength and entropy.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div class="inline-inputs">
            <input id="entropy-input" class="text-input" type="password" placeholder="Enter password to analyze..." />
            <button id="entropy-toggle" class="btn ghost">Show/Hide</button>
          </div>
          
          <div id="entropy-output" class="result-block" style="display:none; padding: 1rem;">
            <div class="stat-grid" style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              <div><strong>Length:</strong> <span id="ent-length">-</span></div>
              <div><strong>Pool Size:</strong> <span id="ent-pool">-</span></div>
              <div><strong>Entropy:</strong> <span id="ent-bits">-</span> bits</div>
              <div><strong>Strength:</strong> <span id="ent-strength">-</span></div>
            </div>
            <div style="margin-top: 1rem;">
              <strong>Estimated Crack Time:</strong> <span id="ent-crack">-</span>
            </div>
          </div>
        </div>
      `
    )
  });

  const input = root.querySelector('#entropy-input');
  const toggle = root.querySelector('#entropy-toggle');
  const output = root.querySelector('#entropy-output');
  const entLength = root.querySelector('#ent-length');
  const entPool = root.querySelector('#ent-pool');
  const entBits = root.querySelector('#ent-bits');
  const entStrength = root.querySelector('#ent-strength');
  const entCrack = root.querySelector('#ent-crack');

  function analyze() {
    const password = input.value;
    if (!password) {
      output.style.display = 'none';
      return;
    }

    const entropy = calculateEntropy(password);
    const strength = getPasswordStrength(password);

    entLength.textContent = password.length;
    entPool.textContent = entropy.poolSize;
    entBits.textContent = entropy.bits;
    entStrength.textContent = strength.label;
    
    // Estimate crack time
    // 10^10 guesses per second
    const guessesPerSec = 10000000000;
    const totalGuesses = Math.pow(2, entropy.bits);
    const secondsToCrack = totalGuesses / guessesPerSec;

    entCrack.textContent = formatTime(secondsToCrack);
    output.style.display = 'block';
  }

  function formatTime(seconds) {
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return 'Centuries';
  }

  input.addEventListener('input', analyze);
  
  toggle.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
  });
}

function renderEscapePage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Escape HTML entities and JavaScript strings.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <textarea id="escape-input" class="text-area" rows="8" placeholder="Enter text to escape..."></textarea>
          <div class="button-row">
            <button id="escape-html" class="btn">Escape HTML</button>
            <button id="unescape-html" class="btn ghost">Unescape HTML</button>
            <button id="escape-js" class="btn">Escape JS</button>
            <button id="escape-copy" class="btn ghost">Copy Output</button>
          </div>
          <textarea id="escape-output" class="text-area" rows="8" readonly placeholder="Output will appear here..."></textarea>
          <p id="escape-status" class="status"></p>
        </div>
      `
    )
  });

  const input = root.querySelector('#escape-input');
  const output = root.querySelector('#escape-output');
  const status = root.querySelector('#escape-status');

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  function unescapeHtml(text) {
    const map = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'"
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) { return map[m]; });
  }

  function escapeJs(text) {
    return JSON.stringify(text).slice(1, -1);
  }

  root.querySelector('#escape-html').addEventListener('click', () => {
    output.value = escapeHtml(input.value);
    status.textContent = 'HTML escaped.';
    status.className = 'status success';
  });

  root.querySelector('#unescape-html').addEventListener('click', () => {
    output.value = unescapeHtml(input.value);
    status.textContent = 'HTML unescaped.';
    status.className = 'status success';
  });

  root.querySelector('#escape-js').addEventListener('click', () => {
    output.value = escapeJs(input.value);
    status.textContent = 'JS escaped.';
    status.className = 'status success';
  });

  root.querySelector('#escape-copy').addEventListener('click', async () => {
    try {
      await copyToClipboard(output.value);
      status.textContent = 'Copied to clipboard.';
      status.className = 'status success';
    } catch {}
  });
}

function renderMorsePage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Convert text to Morse code and play audio.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <textarea id="morse-input" class="text-area" rows="6" placeholder="Enter text or Morse code..."></textarea>
          <div class="button-row">
            <button id="morse-encode" class="btn">Text to Morse</button>
            <button id="morse-decode" class="btn ghost">Morse to Text</button>
            <button id="morse-play" class="btn ghost">Play Sound</button>
            <button id="morse-copy" class="btn ghost">Copy Output</button>
          </div>
          <textarea id="morse-output" class="text-area" rows="6" readonly placeholder="Output will appear here..."></textarea>
          <p id="morse-status" class="status"></p>
        </div>
      `
    )
  });

  const input = root.querySelector('#morse-input');
  const output = root.querySelector('#morse-output');
  const status = root.querySelector('#morse-status');

  const MORSE_MAP = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    ' ': ' '
  };

  const REVERSE_MAP = {};
  for (const key in MORSE_MAP) {
    REVERSE_MAP[MORSE_MAP[key]] = key;
  }

  function encode(text) {
    return text.toUpperCase().split('').map(c => MORSE_MAP[c] || c).join(' ');
  }

  function decode(morse) {
    return morse.split(' ').map(c => REVERSE_MAP[c] || c).join('');
  }

  root.querySelector('#morse-encode').addEventListener('click', () => {
    output.value = encode(input.value);
    status.textContent = 'Encoded to Morse.';
    status.className = 'status success';
  });

  root.querySelector('#morse-decode').addEventListener('click', () => {
    output.value = decode(input.value);
    status.textContent = 'Decoded from Morse.';
    status.className = 'status success';
  });

  root.querySelector('#morse-copy').addEventListener('click', async () => {
    try {
      await copyToClipboard(output.value);
      status.textContent = 'Copied to clipboard.';
      status.className = 'status success';
    } catch {}
  });

  function playMorse(morse) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const dotDuration = 0.1; 
    const dashDuration = dotDuration * 3;
    const frequency = 600; 

    let time = audioCtx.currentTime;

    morse.split('').forEach(char => {
      if (char === '.' || char === '-') {
        const duration = char === '.' ? dotDuration : dashDuration;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.frequency.value = frequency;
        osc.type = 'sine';
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.setValueAtTime(0, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
        
        time += duration + dotDuration; 
      } else if (char === ' ') {
        time += dotDuration * 4; 
      }
    });
  }

  root.querySelector('#morse-play').addEventListener('click', () => {
    playMorse(output.value);
    status.textContent = 'Playing sound...';
    status.className = 'status success';
  });
}

function renderScanPage(root, tool) {
  root.innerHTML = renderShell({
    currentPage: tool.id,
    title: tool.title,
    subtitle: 'Scan QR codes and barcodes using your webcam.',
    content: createToolSection(
      tool,
      `
        <div class="stack">
          <div id="scan-warning" class="status error" style="display:none;">
            BarcodeDetector API is not supported in this browser. Please use Chrome or Edge, or try the file upload below.
          </div>
          
          <div class="video-container" style="position:relative; width: 100%; max-width: 500px; margin: 0 auto;">
            <video id="scan-video" style="width: 100%; border-radius: 8px; display:none;"></video>
          </div>
          
          <div class="button-row">
            <button id="scan-start" class="btn">Start Camera</button>
            <button id="scan-stop" class="btn ghost">Stop Camera</button>
          </div>
          
          <div class="stack">
            <h3>Or Upload an Image</h3>
            <input id="scan-file" type="file" accept="image/*" />
          </div>
          
          <textarea id="scan-output" class="text-area" rows="4" readonly placeholder="Scanned result will appear here..."></textarea>
          <p id="scan-status" class="status"></p>
        </div>
      `
    )
  });

  const video = root.querySelector('#scan-video');
  const output = root.querySelector('#scan-output');
  const status = root.querySelector('#scan-status');
  const warning = root.querySelector('#scan-warning');
  const fileInput = root.querySelector('#scan-file');

  let stream = null;
  let intervalId = null;

  const hasSupport = 'BarcodeDetector' in window;
  if (!hasSupport) {
    warning.style.display = 'block';
  }

  async function startCamera() {
    if (!hasSupport) return;
    
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream;
      video.style.display = 'block';
      video.play();
      status.textContent = 'Camera started. Point it at a QR code.';
      status.className = 'status success';
      
      const detector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
      intervalId = setInterval(async () => {
        try {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0) {
            output.value = barcodes[0].rawValue;
            status.textContent = 'Scan successful!';
            status.className = 'status success';
            stopCamera();
          }
        } catch (e) {
          // Ignore errors during continuous scanning
        }
      }, 500);
    } catch (error) {
      status.textContent = 'Camera error: ' + error.message;
      status.className = 'status error';
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.style.display = 'none';
      stream = null;
    }
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    status.textContent = 'Camera stopped.';
    status.className = 'status';
  }

  async function handleFile(file) {
    if (!hasSupport) return;
    
    const detector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      try {
        const barcodes = await detector.detect(img);
        if (barcodes.length > 0) {
          output.value = barcodes[0].rawValue;
          status.textContent = 'File scan successful!';
          status.className = 'status success';
        } else {
          status.textContent = 'No barcode detected in file.';
          status.className = 'status error';
        }
      } catch (error) {
        status.textContent = 'Error scanning file: ' + error.message;
        status.className = 'status error';
      }
    };
  }

  root.querySelector('#scan-start').addEventListener('click', startCamera);
  root.querySelector('#scan-stop').addEventListener('click', stopCamera);
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });
}

const PAGE_RENDERERS = {
  json: renderJsonPage,
  password: renderPasswordPage,
  markdown: renderMarkdownPage,
  qr: renderQrPage,
  converter: renderConverterPage,
  regex: renderRegexPage,
  palette: renderPalettePage,
  diff: renderDiffPage,
  base64: renderBase64Page,
  hash: renderHashPage,
  ua: renderUserAgentPage,
  flexbox: renderFlexboxPage,
  shadow: renderShadowPage,
  table: renderTablePage,
  rsa: renderRsaPage,
  entropy: renderEntropyPage,
  escape: renderEscapePage,
  morse: renderMorsePage,
  scan: renderScanPage
};

export function initSite(root, page) {
  if (page === 'home') {
    renderHomePage(root);
    return;
  }

  const tool = TOOLS.find((item) => item.id === page);
  const renderer = PAGE_RENDERERS[page];

  if (!tool || !renderer) {
    renderHomePage(root);
    return;
  }

  renderer(root, tool);
}
