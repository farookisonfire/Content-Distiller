import { Request, Response } from 'express';

export function healthHandler(req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    uptimeSeconds: process.uptime(),
  });
}
