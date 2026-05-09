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
    const items = await pb.collection('shop').getFullList({ sort: 'name' });
    return res.json(items);
  } catch (error) {
    console.error('Failed to load shop items:', error);
    return res.status(500).json({ error: 'Failed to load shop items' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await pb.collection('shop').getOne(req.params.id);
    return res.json(item);
  } catch (error) {
    console.error('Failed to load product:', error);
    return res.status(500).json({ error: 'Failed to load product' });
  }
});

router.post('/', requireModerator, upload.array('images', 8), async (req, res) => {
  const { name, sku, description, sizes, price } = req.body;
  const formData = new FormData();

  formData.append('name', name || '');
  formData.append('sku', sku || '');
  formData.append('description', description || '');
  formData.append('sizes', sizes || '');
  formData.append('price', price || '0');

  try {
    if (req.files) {
      req.files.forEach((file) => {
        formData.append('images', fs.createReadStream(file.path), file.originalname);
      });
    }
    const record = await pb.collection('shop').create(formData);
    return res.json(record);
  } catch (error) {
    console.error('Failed to create shop item:', error);
    return res.status(500).json({ error: 'Failed to create item' });
  } finally {
    if (req.files) {
      req.files.forEach((file) => fs.unlink(file.path, () => {}));
    }
  }
});

router.put('/:id', requireModerator, upload.array('images', 8), async (req, res) => {
  const { name, description, sizes, price } = req.body;
  const formData = new FormData();

  if (name) formData.append('name', name);
  if (description) formData.append('description', description);
  if (sizes) formData.append('sizes', sizes);
  if (price) formData.append('price', price);

  try {
    if (req.files) {
      req.files.forEach((file) => {
        formData.append('images', fs.createReadStream(file.path), file.originalname);
      });
    }
    const record = await pb.collection('shop').update(req.params.id, formData);
    return res.json(record);
  } catch (error) {
    console.error('Failed to update shop item:', error);
    return res.status(500).json({ error: 'Failed to update item' });
  } finally {
    if (req.files) {
      req.files.forEach((file) => fs.unlink(file.path, () => {}));
    }
  }
});

router.delete('/:id', requireModerator, async (req, res) => {
  try {
    await pb.collection('shop').delete(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete shop item:', error);
    return res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
