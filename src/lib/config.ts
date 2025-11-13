export interface Config {
  PORT: number;
  FETCH_TIMEOUT_MS: number;
  MAX_CONTENT_LENGTH_BYTES: number;
  USER_AGENT: string;
  LOG_LEVEL: number;
}

const LOG_LEVELS: Record<string, number> = {
  error: 0,
  info: 1,
  debug: 2,
};

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseLogLevel(value: string | undefined, defaultValue: string): number {
  const level = value?.toLowerCase() || defaultValue;
  return LOG_LEVELS[level] ?? LOG_LEVELS[defaultValue];
}

export const config: Config = {
  PORT: parseNumber(process.env.PORT, 3000),
  FETCH_TIMEOUT_MS: parseNumber(process.env.FETCH_TIMEOUT_MS, 10000),
  MAX_CONTENT_LENGTH_BYTES: parseNumber(process.env.MAX_CONTENT_LENGTH_BYTES, 5_000_000),
  USER_AGENT: process.env.USER_AGENT || 'ArticleExtractorBot/1.0 (+contact@example.com)',
  LOG_LEVEL: parseLogLevel(process.env.LOG_LEVEL, 'info'),
};
