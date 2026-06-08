import messages from '../constants/messages';
import { NotFoundError } from '../errors/NotFoundError';
import { ValidationError } from '../errors/ValidationError';
import logger from '../utils/logger';

export function notFoundHandler(req, res) {
  res.status(404).json({ ok: false, error: 'Not Found' });
}

export function globalErrorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: err.message,
      details: err.issues,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({ ok: false, error: err.message });
  }

  logger.error(err);
  res.status(500).json({ ok: false, error: messages.ERROR_INTERNAL });
}
