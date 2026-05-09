import express from 'express';
import multer from 'multer';
import fs from 'fs';
import FormData from 'form-data';
import pb from '../pocketbase.js';
import { requireModerator } from '../middleware/moderator.js';

const upload = multer({ dest: 'tmp_uploads/' });
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await pb.collection('rating').getFullList({ sort: '-points' });
    return res.json(items);
  } catch (error) {
    console.error('Failed to load rating list:', error);
    return res.status(500).json({ error: 'Failed to load rating list' });
  }
});

router.post('/', requireModerator, upload.single('avatar'), async (req, res) => {
  const { name, birthYear, handed, games, wins, losses, points } = req.body;
  const formData = new FormData();

  formData.append('name', name || '');
  formData.append('birthYear', birthYear || '0');
  formData.append('handed', handed || 'Не указано');
  formData.append('games', games || '0');
  formData.append('wins', wins || '0');
  formData.append('losses', losses || '0');
  formData.append('points', points || '0');

  try {
    if (req.file) {
      formData.append('avatar', fs.createReadStream(req.file.path), req.file.originalname);
    }

    const record = await pb.collection('rating').create(formData);
    return res.json(record);
  } catch (error) {
    console.error('Failed to create player:', error);
    return res.status(500).json({ error: 'Failed to create player' });
  } finally {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

router.put('/:id', requireModerator, upload.single('avatar'), async (req, res) => {
  const { name, birthYear, handed, games, wins, losses, points } = req.body;
  const formData = new FormData();

  if (name) formData.append('name', name);
  if (birthYear) formData.append('birthYear', birthYear);
  if (handed) formData.append('handed', handed);
  if (games) formData.append('games', games);
  if (wins) formData.append('wins', wins);
  if (losses) formData.append('losses', losses);
  if (points) formData.append('points', points);

  try {
    if (req.file) {
      formData.append('avatar', fs.createReadStream(req.file.path), req.file.originalname);
    }
    const record = await pb.collection('rating').update(req.params.id, formData);
    return res.json(record);
  } catch (error) {
    console.error('Failed to update player:', error);
    return res.status(500).json({ error: 'Failed to update player' });
  } finally {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

export default router;
