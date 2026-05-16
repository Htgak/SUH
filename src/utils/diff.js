import { diffLines } from 'diff';

function escapeHtml(input) {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildDiff(previousText, nextText) {
  const changes = diffLines(previousText, nextText);

  const html = changes
    .map((part) => {
      const className = part.added
        ? 'diff-added'
        : part.removed
          ? 'diff-removed'
          : 'diff-unchanged';
      const prefix = part.added ? '+' : part.removed ? '-' : ' ';
      return part.value
        .split('\n')
        .filter((line, index, array) => !(index === array.length - 1 && line === ''))
        .map((line) => `<div class="${className}">${prefix} ${escapeHtml(line)}</div>`)
        .join('');
    })
    .join('');

  const addedCount = changes
    .filter((change) => change.added)
    .reduce((count, change) => count + change.count, 0);
  const removedCount = changes
    .filter((change) => change.removed)
    .reduce((count, change) => count + change.count, 0);

  return {
    html,
    addedCount,
    removedCount
  };
}
