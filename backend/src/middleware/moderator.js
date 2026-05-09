import { getModeratorToken } from '../pocketbase.js';

export function requireModerator(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.body.token || req.query.token;

  if (token && token === getModeratorToken()) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized. Moderator token is missing or invalid.' });
}
