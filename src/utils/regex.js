function sanitizeFlags(flags) {
  return [...new Set(flags.replace(/[^dgimsuvy]/g, '').split(''))].join('');
}

export function testRegex(pattern, flags, text) {
  try {
    const parsedFlags = sanitizeFlags(flags);
    const regex = new RegExp(pattern, parsedFlags);
    const globalFlags = parsedFlags.includes('g') ? parsedFlags : `${parsedFlags}g`;
    const collector = new RegExp(pattern, globalFlags);

    const matches = [...text.matchAll(collector)].map((match) => ({
      match: match[0],
      index: match.index,
      groups: match.slice(1)
    }));

    return {
      valid: true,
      regex,
      matches,
      testResult: regex.test(text),
      flags: parsedFlags
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid regex pattern.',
      matches: [],
      testResult: false,
      flags: ''
    };
  }
}

export function highlightMatches(text, pattern, flags) {
  const result = testRegex(pattern, flags, text);

  if (!result.valid || result.matches.length === 0) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const globalFlags = result.flags.includes('g') ? result.flags : `${result.flags}g`;
  const regex = new RegExp(pattern, globalFlags);

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(regex, (match) => `<mark>${match}</mark>`);
}
