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
    const items = await pb.collection('feed').getFullList({ sort: '-created' });
    return res.json(items);
  } catch (error) {
    console.error('Failed to load feed:', error);
    return res.status(500).json({ error: 'Failed to load feed' });
  }
});

router.post('/', requireModerator, upload.array('attachments', 6), async (req, res) => {
  const { content, videoUrl } = req.body;
  const formData = new FormData();

  formData.append('content', content || '');
  formData.append('videoUrl', videoUrl || '');
  formData.append('comments', JSON.stringify([]));
  formData.append('reactions', JSON.stringify({ like: 0, love: 0, fire: 0 }));

  try {
    if (req.files) {
      req.files.forEach((file) => {
        formData.append('attachments', fs.createReadStream(file.path), file.originalname);
      });
    }

    const record = await pb.collection('feed').create(formData);
    return res.json(record);
  } catch (error) {
    console.error('Failed to create feed post:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  } finally {
    if (req.files) {
      req.files.forEach((file) => fs.unlink(file.path, () => {}));
    }
  }
});

router.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { author, message } = req.body;

  try {
    const record = await pb.collection('feed').getOne(id);
    const comments = Array.isArray(record.comments) ? record.comments : [];
    comments.push({ id: Date.now().toString(), author: author || 'Гость', message: message || '', createdAt: new Date().toISOString() });
    const updated = await pb.collection('feed').update(id, { comments: JSON.stringify(comments) });
    return res.json(updated);
  } catch (error) {
    console.error('Failed to add comment:', error);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.post('/:id/reactions', async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;

  try {
    const record = await pb.collection('feed').getOne(id);
    const reactions = typeof record.reactions === 'object' && record.reactions ? record.reactions : { like: 0, love: 0, fire: 0 };
    const reactionType = ['like', 'love', 'fire'].includes(type) ? type : 'like';
    reactions[reactionType] = (reactions[reactionType] || 0) + 1;
    const updated = await pb.collection('feed').update(id, { reactions: JSON.stringify(reactions) });
    return res.json(updated);
  } catch (error) {
    console.error('Failed to add reaction:', error);
    return res.status(500).json({ error: 'Failed to add reaction' });
  }
});

export default router;
