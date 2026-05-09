import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initPocketBase } from './pocketbase.js';
import authRoutes from './routes/auth.js';
import feedRoutes from './routes/feed.js';
import bookingsRoutes from './routes/bookings.js';
import shopRoutes from './routes/shop.js';
import ratingRoutes from './routes/rating.js';
import competitionsRoutes from './routes/competitions.js';
import galleryRoutes from './routes/gallery.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/competitions', competitionsRoutes);
app.use('/api/gallery', galleryRoutes);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

async function start() {
  await initPocketBase();
  app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
