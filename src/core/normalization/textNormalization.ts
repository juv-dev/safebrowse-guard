const SEPARATOR_BETWEEN_WORD_CHARS_PATTERN = /(?<=[\p{L}\p{N}])[-_+](?=[\p{L}\p{N}])/gu;
const COMBINING_MARK_PATTERN = /\p{Mn}/gu;
const WHITESPACE_RUN_PATTERN = /\s+/g;

function safeDecodeUriComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(COMBINING_MARK_PATTERN, "");
}

function normalizeSeparators(value: string): string {
  return value.replace(SEPARATOR_BETWEEN_WORD_CHARS_PATTERN, " ");
}

function collapseWhitespace(value: string): string {
  return value.replace(WHITESPACE_RUN_PATTERN, " ").trim();
}

export function normalizeText(input: string): string {
  const decoded = safeDecodeUriComponent(input);
  const canonical = decoded.normalize("NFKC").toLowerCase();
  const withoutDiacritics = stripDiacritics(canonical).toLowerCase();
  const withNormalizedSeparators = normalizeSeparators(withoutDiacritics);
  return collapseWhitespace(withNormalizedSeparators);
}

export function normalizeHostname(input: string): string {
  let hostname = input.trim().toLowerCase();
  if (hostname.endsWith(".")) {
    hostname = hostname.slice(0, -1);
  }
  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4);
  }
  return hostname;
}
