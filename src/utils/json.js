export function parseJson(input) {
  return JSON.parse(input);
}

export function formatJson(input, indent = 2) {
  const parsed = parseJson(input);
  return JSON.stringify(parsed, null, indent);
}

export function minifyJson(input) {
  const parsed = parseJson(input);
  return JSON.stringify(parsed);
}

export function validateJson(input) {
  try {
    parseJson(input);
    return { valid: true, error: '' };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Invalid JSON input.' };
  }
}
