import { InvalidRequestError } from './errors';

export function validateUrl(url: string): void {
  if (!url) {
    throw new InvalidRequestError("Field 'url' is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new InvalidRequestError("Field 'url' must be a valid http/https URL.");
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new InvalidRequestError("Field 'url' must be a valid http/https URL.");
  }
}
