import express, { Request, Response, NextFunction } from 'express';
import { config } from './lib/config';
import { logger } from './lib/logger';
import { errorToHttpResponse } from './lib/errors';
import { healthHandler } from './routes/health';
import { extractHandler } from './routes/extract';

const app = express();

app.use(express.json({ limit: '10kb' }));

app.get('/health', healthHandler);
app.post('/extract', extractHandler);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error processing ${req.method} ${req.path}: ${err.message}`, {
    stack: err.stack,
    url: req.body?.url,
  });

  const { status, body } = errorToHttpResponse(err);
  res.status(status).json(body);
});

app.listen(config.PORT, () => {
  logger.info(`Server listening on port ${config.PORT}`);
  logger.info(`Configuration: FETCH_TIMEOUT_MS=${config.FETCH_TIMEOUT_MS}, MAX_CONTENT_LENGTH_BYTES=${config.MAX_CONTENT_LENGTH_BYTES}`);
});
