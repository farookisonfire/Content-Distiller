import { Request, Response, NextFunction } from 'express';
import { validateUrl } from '../lib/validators';
import { fetchHtml } from '../lib/fetcher';
import { extractArticle } from '../lib/extractor';
import { convertContent } from '../lib/converter';
import { extractSourceDomain } from '../lib/metadata';
import { ExtractRequestBody, ExtractResponseBody } from '../lib/types';
import { logger } from '../lib/logger';

export async function extractHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const startTime = Date.now();

  try {
    const body = req.body as ExtractRequestBody;
    const { url } = body;

    logger.info(`Incoming request for URL: ${url}`);

    validateUrl(url);

    const fetchResult = await fetchHtml(url);

    const extractionStartTime = Date.now();
    const articleData = extractArticle(fetchResult.html, url);
    const convertedContent = convertContent(articleData.raw_html);
    const extraction_duration_ms = Date.now() - extractionStartTime;

    const response: ExtractResponseBody = {
      url,
      title: articleData.title,
      author: articleData.author,
      published_at: articleData.published_at,
      content_markdown: convertedContent.content_markdown,
      content_text: convertedContent.content_text,
      raw_html: articleData.raw_html,
      meta: {
        word_count: convertedContent.word_count,
        language: articleData.language,
        source_domain: extractSourceDomain(url),
        fetched_at: fetchResult.fetched_at,
        fetch_duration_ms: fetchResult.fetch_duration_ms,
        extraction_duration_ms,
      },
    };

    const totalDuration = Date.now() - startTime;
    logger.info(
      `Success: ${url} | word_count=${response.meta.word_count} | ` +
      `fetch=${response.meta.fetch_duration_ms}ms | extraction=${extraction_duration_ms}ms | total=${totalDuration}ms`
    );

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
