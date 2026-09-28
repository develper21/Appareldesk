import { Request, Response, NextFunction } from 'express';

/** Catches unexpected errors and returns a consistent JSON error shape */
export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || 'Internal server error';
  console.error(`[Error] ${req.method} ${req.url}:`, message);
  res.status(status).json({ statusCode: status, message });
}
