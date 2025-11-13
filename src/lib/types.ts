export interface ExtractRequestBody {
  url: string;
}

export interface ExtractResponseBody {
  url: string;
  title: string | null;
  author: string | null;
  published_at: string | null;
  content_markdown: string;
  content_text: string;
  raw_html: string;
  meta: {
    word_count: number;
    language: string | null;
    source_domain: string;
    fetched_at: string;
    fetch_duration_ms: number;
    extraction_duration_ms: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
}

export interface FetchResult {
  html: string;
  fetched_at: string;
  fetch_duration_ms: number;
}

export interface ArticleData {
  title: string | null;
  author: string | null;
  published_at: string | null;
  raw_html: string;
  language: string | null;
}

export interface ConvertedContent {
  content_markdown: string;
  content_text: string;
  word_count: number;
}
