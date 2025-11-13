# Content Distiller

HTTP service that extracts main article content from web pages and returns structured JSON with Markdown and plain text formats.

## Features

- Fetches HTML from any URL
- Extracts main article content using Mozilla's Readability algorithm
- Returns content in multiple formats (Markdown, plain text, raw HTML)
- Includes metadata (word count, author, published date, language)
- Configurable timeouts and content size limits
- Comprehensive error handling

## Requirements

- Node.js 18+

## Installation

```bash
npm install
```

## Configuration

The service reads configuration from environment variables:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | number | 3000 | Port to listen on |
| `FETCH_TIMEOUT_MS` | number | 10000 | HTTP request timeout in milliseconds |
| `MAX_CONTENT_LENGTH_BYTES` | number | 5000000 | Maximum response size (5MB) |
| `USER_AGENT` | string | ArticleExtractorBot/1.0 (+contact@example.com) | User-Agent header for requests |
| `LOG_LEVEL` | string | info | Logging level: error, info, or debug |

Create a `.env` file (see `.env.example`) or set environment variables directly.

## Usage

### Development

```bash
npm run dev
```

Or with auto-reload:

```bash
npm run dev:watch
```

### Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run typecheck
```

## API Endpoints

### GET /health

Health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "uptimeSeconds": 123.45
}
```

### POST /extract

Extract article content from a URL.

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response (200):**
```json
{
  "url": "https://example.com/article",
  "title": "Article Title",
  "author": "Author Name",
  "published_at": "2024-01-01T00:00:00.000Z",
  "content_markdown": "# Article Title\n\nArticle content...",
  "content_text": "Article Title Article content...",
  "raw_html": "<h1>Article Title</h1><p>Article content...</p>",
  "meta": {
    "word_count": 500,
    "language": "en",
    "source_domain": "example.com",
    "fetched_at": "2024-01-01T12:00:00.000Z",
    "fetch_duration_ms": 250,
    "extraction_duration_ms": 50
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid URL
  ```json
  {
    "error": "InvalidRequest",
    "message": "Field 'url' must be a valid http/https URL."
  }
  ```

- **502 Bad Gateway** - Fetch error (timeout, non-HTML, oversized)
  ```json
  {
    "error": "FetchError",
    "message": "Failed to fetch URL.",
    "details": "Timeout after 10000ms"
  }
  ```

- **500 Internal Server Error** - Extraction error
  ```json
  {
    "error": "ExtractionError",
    "message": "Failed to extract main article content."
  }
  ```

## Example Usage

```bash
# Health check
curl http://localhost:3000/health

# Extract article
curl -X POST http://localhost:3000/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

## Architecture

The codebase is organized into modular components:

- `src/server.ts` - Express server setup and error middleware
- `src/routes/` - HTTP route handlers
- `src/lib/config.ts` - Environment configuration
- `src/lib/logger.ts` - Logging with configurable levels
- `src/lib/errors.ts` - Custom error classes and HTTP mapping
- `src/lib/validators.ts` - Request validation
- `src/lib/fetcher.ts` - HTML fetching with timeout and size limits
- `src/lib/extractor.ts` - Article extraction using Readability
- `src/lib/converter.ts` - HTML to Markdown/text conversion
- `src/lib/metadata.ts` - Metadata extraction utilities
- `src/lib/types.ts` - TypeScript type definitions

## License

ISC
