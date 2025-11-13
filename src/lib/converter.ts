import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';
import { ConvertedContent } from './types';
import { logger } from './logger';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export function convertContent(raw_html: string): ConvertedContent {
  logger.debug('Converting HTML to Markdown');

  const content_markdown = turndownService.turndown(raw_html);

  logger.debug('Extracting plain text from HTML');

  const dom = new JSDOM(raw_html);
  const textContent = dom.window.document.body.textContent || '';

  const content_text = textContent
    .replace(/\s+/g, ' ')
    .trim();

  const word_count = content_text.length > 0 
    ? content_text.split(/\s+/).length 
    : 0;

  logger.debug(`Converted content: ${word_count} words`);

  return {
    content_markdown,
    content_text,
    word_count,
  };
}
