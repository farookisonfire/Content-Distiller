import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { ExtractionError } from './errors';
import { ArticleData } from './types';
import { logger } from './logger';

function extractMetaContent(doc: Document, selectors: string[]): string | null {
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const content = element.getAttribute('content') || element.getAttribute('datetime');
      if (content) return content;
    }
  }
  return null;
}

function normalizeDate(dateString: string | null): string | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

export function extractArticle(html: string, url: string): ArticleData {
  logger.debug('Parsing HTML with JSDOM');

  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  logger.debug('Extracting article with Readability');

  const reader = new Readability(doc);
  const article = reader.parse();

  if (!article || !article.content) {
    throw new ExtractionError('Failed to extract main article content.');
  }

  const title = article.title || doc.title || null;

  let author = article.byline || null;
  if (!author) {
    author = extractMetaContent(doc, [
      'meta[name="author"]',
      'meta[property="article:author"]',
      'meta[property="author"]',
    ]);
  }

  const publishedRaw = extractMetaContent(doc, [
    'meta[property="article:published_time"]',
    'meta[name="article:published_time"]',
    'meta[itemprop="datePublished"]',
    'time[datetime]',
  ]);
  const published_at = normalizeDate(publishedRaw);

  const language = article.lang || doc.documentElement.lang || null;

  logger.debug(`Extracted article: title="${title}", author="${author}", language="${language}"`);

  return {
    title,
    author,
    published_at,
    raw_html: article.content,
    language,
  };
}
