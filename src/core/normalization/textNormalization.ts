const COMBINING_MARKS = /\p{Mark}+/gu;
const SEPARATORS = /[\s_+\-–—]+/gu;
function removeControlCharacters(input: string): string {
  return [...input].filter((char) => {
    const code = char.codePointAt(0) ?? 0;
    return code > 31 && code !== 127;
  }).join('');
}
const HOSTNAME_ALLOWED = /^[a-z0-9.-]+$/u;

function decodeRepeatedUrlEncoding(input: string): string {
  let current = input;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) {
        return decoded;
      }
      current = decoded;
    } catch {
      return current;
    }
  }

  return current;
}

export function normalizeText(input: string): string {
  return removeControlCharacters(
    decodeRepeatedUrlEncoding(input)
      .normalize('NFKC')
      .toLowerCase()
      .normalize('NFD')
      .replace(COMBINING_MARKS, '')
      .normalize('NFKC'),
  )
    .replace(SEPARATORS, ' ')
    .trim();
}

export function normalizeHostname(input: string): string {
  const normalized = removeControlCharacters(
    decodeRepeatedUrlEncoding(input)
      .normalize('NFKC')
      .toLowerCase()
      .normalize('NFD')
      .replace(COMBINING_MARKS, '')
      .normalize('NFKC'),
  )
    .trim()
    .replace(/\.+/gu, '.')
    .replace(/^\.+|\.+$/gu, '');

  if (normalized.length === 0 || normalized.length > 253 || !HOSTNAME_ALLOWED.test(normalized)) {
    return '';
  }

  const labels = normalized.split('.');
  if (labels.some((label) => label.length === 0 || label.length > 63 || label.startsWith('-') || label.endsWith('-'))) {
    return '';
  }

  return normalized;
}
