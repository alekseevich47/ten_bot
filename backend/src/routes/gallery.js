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
    const items = await pb.collection('gallery').getFullList({ sort: '-created' });
    return res.json(items);
  } catch (error) {
    console.error('Failed to load gallery:', error);
    return res.status(500).json({ error: 'Failed to load gallery' });
  }
});

router.post('/', requireModerator, upload.single('photo'), async (req, res) => {
  const { caption } = req.body;
  const formData = new FormData();

  formData.append('caption', caption || '');

  try {
    if (req.file) {
      formData.append('photo', fs.createReadStream(req.file.path), req.file.originalname);
    }

    const record = await pb.collection('gallery').create(formData);
    return res.json(record);
  } catch (error) {
    console.error('Failed to upload gallery photo:', error);
    return res.status(500).json({ error: 'Failed to upload photo' });
  } finally {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

export default router;
