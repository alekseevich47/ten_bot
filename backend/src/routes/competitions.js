import express from 'express';
import pb from '../pocketbase.js';
import { requireModerator } from '../middleware/moderator.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await pb.collection('competitions').getFullList({ sort: 'title' });
    return res.json(items);
  } catch (error) {
    console.error('Failed to load competitions:', error);
    return res.status(500).json({ error: 'Failed to load competitions' });
  }
});

router.post('/', requireModerator, async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Competition title is required' });
  }

  try {
    const record = await pb.collection('competitions').create({ title, games: JSON.stringify([]) });
    return res.json(record);
  } catch (error) {
    console.error('Failed to create competition:', error);
    return res.status(500).json({ error: 'Failed to create competition' });
  }
});

router.get('/:id/games', async (req, res) => {
  try {
    const competition = await pb.collection('competitions').getOne(req.params.id);
    const games = Array.isArray(competition.games) ? competition.games : [];
    return res.json({ competition, games });
  } catch (error) {
    console.error('Failed to load competition games:', error);
    return res.status(500).json({ error: 'Failed to load games' });
  }
});

router.post('/:id/games', requireModerator, async (req, res) => {
  const { player1, player2, date, time, location } = req.body;
  if (!player1 || !player2 || !date || !time) {
    return res.status(400).json({ error: 'Missing game data' });
  }

  try {
    const competition = await pb.collection('competitions').getOne(req.params.id);
    const games = Array.isArray(competition.games) ? competition.games : [];
    const game = {
      gameId: Date.now().toString(),
      player1,
      player2,
      date,
      time,
      location: location || '',
      score: '',
      finished: false,
      canceled: false,
      createdAt: new Date().toISOString(),
    };

    games.push(game);
    const updated = await pb.collection('competitions').update(req.params.id, { games: JSON.stringify(games) });
    return res.json(updated);
  } catch (error) {
    console.error('Failed to create game:', error);
    return res.status(500).json({ error: 'Failed to create game' });
  }
});

router.put('/:id/games/:gameId', requireModerator, async (req, res) => {
  const { id, gameId } = req.params;
  const { score, canceled } = req.body;

  try {
    const competition = await pb.collection('competitions').getOne(id);
    const games = Array.isArray(competition.games) ? competition.games : [];
    const updatedGames = games.map((game) => {
      if (game.gameId === gameId) {
        return {
          ...game,
          score: score || game.score,
          finished: !canceled && Boolean(score),
          canceled: canceled === 'true' || canceled === true,
        };
      }
      return game;
    });

    const updated = await pb.collection('competitions').update(id, { games: JSON.stringify(updatedGames) });
    return res.json(updated);
  } catch (error) {
    console.error('Failed to update game result:', error);
    return res.status(500).json({ error: 'Failed to update game' });
  }
});

export default router;
