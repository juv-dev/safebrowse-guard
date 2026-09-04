const CREDIT_CARD_CANDIDATE_PATTERN = /\b\d(?:[ -]?\d){12,18}\b/g;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/;
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
const IBAN_PATTERN = /\b[A-Za-z]{2}\d{2}[A-Za-z0-9]{1,30}\b/;
const SECRET_MARKERS = ["SECRET", "PASSWORD", "TOKEN", "API_KEY", "PRIVATE"];

function isLuhnValid(digits: string): boolean {
  const sum = Array.from(digits)
    .reverse()
    .reduce((total, char, index) => {
      let digit = Number(char);
      if (index % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      return total + digit;
    }, 0);
  return sum % 10 === 0;
}

export function looksLikeCreditCard(value: string): boolean {
  const candidates = value.match(CREDIT_CARD_CANDIDATE_PATTERN);
  if (!candidates) {
    return false;
  }
  return candidates.some((candidate) => {
    const digits = candidate.replace(/[ -]/g, "");
    return digits.length >= 13 && digits.length <= 19 && isLuhnValid(digits);
  });
}

export function looksLikeJwt(value: string): boolean {
  return JWT_PATTERN.test(value);
}

export function looksLikeSecretMarker(value: string): boolean {
  const upper = value.toUpperCase();
  return SECRET_MARKERS.some((marker) => upper.includes(marker));
}

export function looksLikeEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function looksLikeIban(value: string): boolean {
  return IBAN_PATTERN.test(value);
}

function isForbiddenString(value: string): boolean {
  return (
    looksLikeCreditCard(value) ||
    looksLikeJwt(value) ||
    looksLikeSecretMarker(value) ||
    looksLikeEmail(value) ||
    looksLikeIban(value)
  );
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function containsForbiddenData(value: unknown): boolean {
  if (typeof value === "string") {
    return isForbiddenString(value);
  }
  if (isUnknownArray(value)) {
    return value.some((item) => containsForbiddenData(item));
  }
  if (isPlainObject(value)) {
    return Object.values(value).some((item) => containsForbiddenData(item));
  }
  return false;
}

export function assertNoForbiddenData(value: unknown, context?: string): void {
  if (!containsForbiddenData(value)) {
    return;
  }
  const suffix = context ? ` in ${context}` : "";
  throw new Error(`Forbidden data detected${suffix}`);
}
