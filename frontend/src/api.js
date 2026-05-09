const API_BASE = '/api';

function getAuthHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Запрос не выполнен');
  }
  return res.json();
}

export async function loginModerator(token) {
  return fetchJson(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

export async function fetchFeed() {
  return fetchJson(`${API_BASE}/feed`);
}

export async function createFeedPost(formData, token) {
  return fetchJson(`${API_BASE}/feed`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: formData,
  });
}

export async function addFeedComment(id, comment) {
  return fetchJson(`${API_BASE}/feed/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });
}

export async function addFeedReaction(id, type) {
  return fetchJson(`${API_BASE}/feed/${id}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
}

export async function fetchBookings() {
  return fetchJson(`${API_BASE}/bookings`);
}

export async function createBooking(data, token) {
  return fetchJson(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { ...getAuthHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function registerForBooking(id, data) {
  return fetchJson(`${API_BASE}/bookings/${id}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function fetchShop() {
  return fetchJson(`${API_BASE}/shop`);
}

export async function fetchProduct(id) {
  return fetchJson(`${API_BASE}/shop/${id}`);
}

export async function createShopItem(formData, token) {
  return fetchJson(`${API_BASE}/shop`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: formData,
  });
}

export async function updateShopItem(id, formData, token) {
  return fetchJson(`${API_BASE}/shop/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(token),
    body: formData,
  });
}

export async function deleteShopItem(id, token) {
  return fetchJson(`${API_BASE}/shop/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(token),
  });
}

export async function fetchRatings() {
  return fetchJson(`${API_BASE}/rating`);
}

export async function createPlayer(formData, token) {
  return fetchJson(`${API_BASE}/rating`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: formData,
  });
}

export async function updatePlayer(id, formData, token) {
  return fetchJson(`${API_BASE}/rating/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(token),
    body: formData,
  });
}

export async function fetchCompetitions() {
  return fetchJson(`${API_BASE}/competitions`);
}

export async function createCompetition(data, token) {
  return fetchJson(`${API_BASE}/competitions`, {
    method: 'POST',
    headers: { ...getAuthHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function fetchCompetitionGames(id) {
  return fetchJson(`${API_BASE}/competitions/${id}/games`);
}

export async function createCompetitionGame(id, data, token) {
  return fetchJson(`${API_BASE}/competitions/${id}/games`, {
    method: 'POST',
    headers: { ...getAuthHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateCompetitionGame(id, gameId, data, token) {
  return fetchJson(`${API_BASE}/competitions/${id}/games/${gameId}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function fetchGallery() {
  return fetchJson(`${API_BASE}/gallery`);
}

export async function uploadGalleryPhoto(formData, token) {
  return fetchJson(`${API_BASE}/gallery`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: formData,
  });
}
