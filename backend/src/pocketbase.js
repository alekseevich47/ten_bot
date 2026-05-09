import PocketBase from 'pocketbase';
import dotenv from 'dotenv';

dotenv.config();

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

export async function initPocketBase() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD must be set in backend/.env');
  }

  await pb.admins.authWithPassword(adminEmail, adminPassword);
  console.log('Connected to PocketBase as admin');
  return pb;
}

export function getModeratorToken() {
  return process.env.APP_MODERATOR_TOKEN;
}

export default pb;
