import express from 'express';
import pb from '../pocketbase.js';
import { requireModerator } from '../middleware/moderator.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await pb.collection('bookings').getFullList({ sort: 'date' });
    return res.json(items);
  } catch (error) {
    console.error('Failed to load bookings:', error);
    return res.status(500).json({ error: 'Failed to load bookings' });
  }
});

router.post('/', requireModerator, async (req, res) => {
  const { date, startTime, endTime, slots } = req.body;

  if (!date || !startTime || !endTime || !slots) {
    return res.status(400).json({ error: 'Missing training slot data' });
  }

  try {
    const record = await pb.collection('bookings').create({
      date,
      startTime,
      endTime,
      slots: Number(slots),
      registrations: JSON.stringify([]),
    });
    return res.json(record);
  } catch (error) {
    console.error('Failed to create booking:', error);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.post('/:id/register', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required for booking' });
  }

  try {
    const record = await pb.collection('bookings').getOne(id);
    const registrations = Array.isArray(record.registrations) ? record.registrations : [];
    if (registrations.length >= Number(record.slots)) {
      return res.status(400).json({ error: 'No available slots left' });
    }
    registrations.push({ id: Date.now().toString(), name, createdAt: new Date().toISOString() });
    const updated = await pb.collection('bookings').update(id, { registrations: JSON.stringify(registrations) });
    return res.json(updated);
  } catch (error) {
    console.error('Failed to register for training:', error);
    return res.status(500).json({ error: 'Failed to register' });
  }
});

export default router;
