import { useState } from 'react';
import { loginModerator } from '../api.js';

export default function ModeratorLogin({ onLogin }) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    try {
      await loginModerator(token);
      onLogin(token);
      setError('');
      setOpen(false);
    } catch (err) {
      setError('Неверный токен модератора');
    }
  };

  return (
    <>
      <button className="header-button secondary" onClick={() => setOpen(true)}>
        Войти модератором
      </button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Вход модератора</div>
              <button className="close-button" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <label>
                Токен модератора
                <input
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Введите токен"
                />
              </label>
              {error && <div className="error-text">{error}</div>}
            </div>
            <div className="modal-footer">
              <button className="primary-button" onClick={submit}>
                Войти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
