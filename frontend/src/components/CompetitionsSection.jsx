import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import {
  fetchCompetitions,
  createCompetition,
  fetchCompetitionGames,
  createCompetitionGame,
  updateCompetitionGame,
} from '../api.js';

export default function CompetitionsSection({ isModerator, token }) {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compModal, setCompModal] = useState(false);
  const [gameModal, setGameModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [newCompetition, setNewCompetition] = useState('');
  const [newGame, setNewGame] = useState({ player1: '', player2: '', date: '', time: '', location: '' });
  const [resultData, setResultData] = useState({ gameId: '', score: '', canceled: false });

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    setLoading(true);
    try {
      const data = await fetchCompetitions();
      setCompetitions(data);
      if (data.length > 0 && !selectedCompetition) {
        setSelectedCompetition(data[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCompetition) {
      loadGames(selectedCompetition);
    }
  }, [selectedCompetition]);

  const loadGames = async (competitionId) => {
    setLoading(true);
    try {
      const data = await fetchCompetitionGames(competitionId);
      setGames(data.games || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addCompetition = async () => {
    try {
      await createCompetition({ title: newCompetition }, token);
      setNewCompetition('');
      setCompModal(false);
      loadCompetitions();
    } catch (error) {
      console.error(error);
    }
  };

  const addGame = async () => {
    try {
      await createCompetitionGame(selectedCompetition, newGame, token);
      setNewGame({ player1: '', player2: '', date: '', time: '', location: '' });
      setGameModal(false);
      loadGames(selectedCompetition);
    } catch (error) {
      console.error(error);
    }
  };

  const saveResult = async () => {
    try {
      await updateCompetitionGame(selectedCompetition, resultData.gameId, {
        score: resultData.score,
        canceled: resultData.canceled,
      }, token);
      setResultModal(false);
      loadGames(selectedCompetition);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="section-page">
      <div className="section-header">
        <div>Соревнования</div>
        {isModerator && (
          <button className="header-button" onClick={() => setCompModal(true)}>
            +
          </button>
        )}
      </div>

      {loading ? (
        <div className="placeholder">Загрузка...</div>
      ) : (
        <div className="competition-content">
          <div className="competition-select">
            <select value={selectedCompetition || ''} onChange={(event) => setSelectedCompetition(event.target.value)}>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.title}
                </option>
              ))}
            </select>
            {selectedCompetition && isModerator && (
              <button className="primary-button" onClick={() => setGameModal(true)}>
                Создать игру
              </button>
            )}
          </div>

          {games.length === 0 ? (
            <div className="placeholder">Нет игр для этого соревнования.</div>
          ) : (
            <div className="game-list">
              {games.map((game) => (
                <div key={game.gameId} className="game-card">
                  <div className="game-row">
                    <span>{game.player1}</span>
                    <span className="game-vs">—</span>
                    <span>{game.player2}</span>
                  </div>
                  <div className="game-meta">
                    <div>{game.date} {game.time}</div>
                    <div>{game.location}</div>
                  </div>
                  {game.finished && !game.canceled ? (
                    <div className="game-score success">Счет: {game.score}</div>
                  ) : game.canceled ? (
                    <div className="game-score canceled">Игра не состоялась</div>
                  ) : null}
                  {isModerator && (
                    <button className="secondary-button" onClick={() => { setResultData({ gameId: game.gameId, score: game.score || '', canceled: false }); setResultModal(true); }}>
                      ✏️ Редактировать
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {compModal && (
        <Modal title="Добавить соревнование" onClose={() => setCompModal(false)}>
          <label>
            Название соревнования
            <input value={newCompetition} onChange={(event) => setNewCompetition(event.target.value)} />
          </label>
          <button className="primary-button" onClick={addCompetition}>
            Создать
          </button>
        </Modal>
      )}

      {gameModal && (
        <Modal title="Создать игру" onClose={() => setGameModal(false)}>
          <label>
            Игрок №1
            <input value={newGame.player1} onChange={(event) => setNewGame({ ...newGame, player1: event.target.value })} />
          </label>
          <label>
            Игрок №2
            <input value={newGame.player2} onChange={(event) => setNewGame({ ...newGame, player2: event.target.value })} />
          </label>
          <label>
            Дата
            <input type="date" value={newGame.date} onChange={(event) => setNewGame({ ...newGame, date: event.target.value })} />
          </label>
          <label>
            Время
            <input type="time" value={newGame.time} onChange={(event) => setNewGame({ ...newGame, time: event.target.value })} />
          </label>
          <label>
            Место
            <input value={newGame.location} onChange={(event) => setNewGame({ ...newGame, location: event.target.value })} />
          </label>
          <button className="primary-button" onClick={addGame}>
            Создать
          </button>
        </Modal>
      )}

      {resultModal && (
        <Modal title="Редактировать результат" onClose={() => setResultModal(false)}>
          <label>
            Счет
            <input value={resultData.score} onChange={(event) => setResultData({ ...resultData, score: event.target.value })} placeholder="2:1 (11:5,5:11,11:2)" />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={resultData.canceled}
              onChange={(event) => setResultData({ ...resultData, canceled: event.target.checked })}
            />
            Игра не состоялась
          </label>
          <button className="primary-button" onClick={saveResult}>
            Сохранить результат
          </button>
        </Modal>
      )}
    </section>
  );
}
