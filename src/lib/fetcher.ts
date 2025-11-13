import { fetch } from 'undici';
import { config } from './config';
import { UpstreamFetchError } from './errors';
import { FetchResult } from './types';
import { logger } from './logger';

export async function fetchHtml(url: string): Promise<FetchResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.FETCH_TIMEOUT_MS);

  try {
    logger.debug(`Fetching URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': config.USER_AGENT,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new UpstreamFetchError(
        'Failed to fetch URL.',
        `HTTP ${response.status}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.toLowerCase().startsWith('text/html')) {
      throw new UpstreamFetchError(
        'Failed to fetch URL.',
        `Content-Type ${contentType || 'unknown'} is not supported`
      );
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const length = parseInt(contentLength, 10);
      if (!isNaN(length) && length > config.MAX_CONTENT_LENGTH_BYTES) {
        const lengthMB = (length / 1_000_000).toFixed(1);
        const limitMB = (config.MAX_CONTENT_LENGTH_BYTES / 1_000_000).toFixed(1);
        throw new UpstreamFetchError(
          'Failed to fetch URL.',
          `Content-Length ${lengthMB}MB exceeds limit ${limitMB}MB`
        );
      }
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new UpstreamFetchError('Failed to fetch URL.', 'Response body is empty');
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.length;
      if (totalBytes > config.MAX_CONTENT_LENGTH_BYTES) {
        const totalMB = (totalBytes / 1_000_000).toFixed(1);
        const limitMB = (config.MAX_CONTENT_LENGTH_BYTES / 1_000_000).toFixed(1);
        throw new UpstreamFetchError(
          'Failed to fetch URL.',
          `Response size ${totalMB}MB exceeds limit ${limitMB}MB`
        );
      }

      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);
    const html = buffer.toString('utf-8');

    const fetch_duration_ms = Date.now() - startTime;
    const fetched_at = new Date().toISOString();

    logger.debug(`Fetched ${totalBytes} bytes in ${fetch_duration_ms}ms`);

    return {
      html,
      fetched_at,
      fetch_duration_ms,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new UpstreamFetchError(
        'Failed to fetch URL.',
        `Timeout after ${config.FETCH_TIMEOUT_MS}ms`
      );
    }

    if (error instanceof UpstreamFetchError) {
      throw error;
    }

    throw new UpstreamFetchError('Failed to fetch URL.', error.message);
  }
}
