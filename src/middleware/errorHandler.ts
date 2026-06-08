import messages from '../constants/messages';
import logger from '../utils/logger';

export function notFoundHandler(req, res) {
  res.status(404).json({ ok: false, error: 'Not Found' });
}

export function globalErrorHandler(err, req, res, next) {
  logger.error(err);
  res.status(500).json({ ok: false, error: messages.ERROR_INTERNAL });
}
