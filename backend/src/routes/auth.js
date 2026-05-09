import express from 'express';
import { getModeratorToken } from '../pocketbase.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { token } = req.body;
  if (token && token === getModeratorToken()) {
    return res.json({ success: true, token });
  }

  return res.status(401).json({ error: 'Invalid moderator token' });
});

router.post('/logout', (req, res) => {
  return res.json({ success: true });
});

export default router;
