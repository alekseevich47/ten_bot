import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { fetchRatings, createPlayer } from '../api.js';

export default function RatingSection({ isModerator, token }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', birthYear: '', handed: '', games: '', wins: '', losses: '', points: '' });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const data = await fetchRatings();
      setPlayers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const savePlayer = async () => {
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('birthYear', form.birthYear);
      payload.append('handed', form.handed);
      payload.append('games', form.games);
      payload.append('wins', form.wins);
      payload.append('losses', form.losses);
      payload.append('points', form.points);
      if (avatarFile) payload.append('avatar', avatarFile);
      await createPlayer(payload, token);
      setModalOpen(false);
      setForm({ name: '', birthYear: '', handed: '', games: '', wins: '', losses: '', points: '' });
      setAvatarFile(null);
      loadPlayers();
    } catch (error) {
      console.error(error);
      alert('Не удалось добавить игрока');
    }
  };

  return (
    <section className="section-page">
      <div className="section-header">
        <div>Рейтинг игроков</div>
        {isModerator && (
          <button className="header-button" onClick={() => setModalOpen(true)}>
            +
          </button>
        )}
      </div>

      {loading ? (
        <div className="placeholder">Загрузка...</div>
      ) : (
        <div className="rating-table">
          {players.map((player) => (
            <div key={player.id} className="rating-card">
              <div className="player-avatar">
                {player.avatar && player.avatar.length > 0 ? (
                  <img src={player.avatar[0]} alt={player.name} />
                ) : (
                  <div className="avatar-placeholder">?</div>
                )}
              </div>
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div>{player.birthYear}, {player.handed}</div>
                <div>Игры: {player.games || 0}</div>
                <div>Победы: {player.wins || 0} / Поражения: {player.losses || 0}</div>
                <div>Очки: {player.points || 0}</div>
              </div>
            </div>
          ))}
          {players.length === 0 && <div className="placeholder">Игроки ещё не добавлены.</div>}
        </div>
      )}

      {modalOpen && (
        <Modal title="Добавить игрока" onClose={() => setModalOpen(false)}>
          <label>
            Фамилия и имя
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            Год рождения
            <input type="number" value={form.birthYear} onChange={(event) => setForm({ ...form, birthYear: event.target.value })} />
          </label>
          <label>
            Ведущая рука
            <input value={form.handed} onChange={(event) => setForm({ ...form, handed: event.target.value })} placeholder="Правая / Левая" />
          </label>
          <label>
            Количество игр
            <input type="number" value={form.games} onChange={(event) => setForm({ ...form, games: event.target.value })} />
          </label>
          <label>
            Победы
            <input type="number" value={form.wins} onChange={(event) => setForm({ ...form, wins: event.target.value })} />
          </label>
          <label>
            Поражения
            <input type="number" value={form.losses} onChange={(event) => setForm({ ...form, losses: event.target.value })} />
          </label>
          <label>
            Очки
            <input type="number" value={form.points} onChange={(event) => setForm({ ...form, points: event.target.value })} />
          </label>
          <label>
            Аватарка
            <input type="file" accept="image/*" onChange={(event) => setAvatarFile(event.target.files[0])} />
          </label>
          <button className="primary-button" onClick={savePlayer}>
            Сохранить игрока
          </button>
        </Modal>
      )}
    </section>
  );
}
