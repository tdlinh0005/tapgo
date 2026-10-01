export const RETRY_PREFIX = 'Thử lại nhé!';

export const DEFAULT_RETRY_HINT = `${RETRY_PREFIX} Con làm chậm thôi.`;

const SPOKEN_KEY_NAMES: Partial<Record<string, string>> = {
  ' ': 'phím cách',
  '\n': 'phím Enter',
};

export const spokenKeyName = (key: string) => SPOKEN_KEY_NAMES[key] ?? `phím ${key}`;

export const keyRetryHint = (key: string) => `${RETRY_PREFIX} Tìm ${spokenKeyName(key)} trên bàn phím nhé.`;
