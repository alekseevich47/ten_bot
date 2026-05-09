import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import { fetchBookings, createBooking, registerForBooking } from '../api.js';

function buildCalendarItems(bookings) {
  const today = new Date();
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const stringDate = date.toISOString().slice(0, 10);
    const dayBookings = bookings.filter((item) => item.date === stringDate);
    return {
      date: stringDate,
      label: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      available: dayBookings.some((item) => (item.registrations?.length || 0) < item.slots),
      bookings: dayBookings,
    };
  });
}

export default function BookingsSection({ isModerator, token }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [newTraining, setNewTraining] = useState({ date: '', startTime: '', endTime: '', slots: 8 });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calendar = useMemo(() => buildCalendarItems(bookings), [bookings]);

  const openDay = (day) => {
    setSelectedDay(day);
    setSelectedBooking(day.bookings[0] || null);
    setModalOpen(true);
  };

  const submitBooking = async () => {
    try {
      await createBooking(newTraining, token);
      setNewTraining({ date: '', startTime: '', endTime: '', slots: 8 });
      loadBookings();
      setSelectedDay(null);
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Ошибка создания тренировки');
    }
  };

  const submitRegistration = async (bookingId) => {
    if (!playerName.trim()) {
      alert('Введите имя для записи');
      return;
    }

    try {
      await registerForBooking(bookingId, { name: playerName });
      setPlayerName('');
      loadBookings();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Не удалось записаться на тренировку');
    }
  };

  return (
    <section className="section-page">
      <div className="section-header">
        <div>Запись на тренировку</div>
        {isModerator && (
          <button className="header-button" onClick={() => setSelectedDay({ new: true }) || setModalOpen(true)}>
            +
          </button>
        )}
      </div>

      {loading ? (
        <div className="placeholder">Загрузка...</div>
      ) : (
        <div className="calendar-grid">
          {calendar.map((day) => (
            <button
              key={day.date}
              className={`calendar-day ${day.available ? 'available' : ''}`}
              onClick={() => openDay(day)}
            >
              <div>{day.label}</div>
              <div>{day.available ? 'Есть место' : 'Пусто'}</div>
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title="Информация о записи" onClose={() => setModalOpen(false)}>
          {selectedDay?.new ? (
            <>
              <label>
                Дата
                <input
                  type="date"
                  value={newTraining.date}
                  onChange={(event) => setNewTraining({ ...newTraining, date: event.target.value })}
                />
              </label>
              <label>
                Время с
                <input
                  type="time"
                  value={newTraining.startTime}
                  onChange={(event) => setNewTraining({ ...newTraining, startTime: event.target.value })}
                />
                до
                <input
                  type="time"
                  value={newTraining.endTime}
                  onChange={(event) => setNewTraining({ ...newTraining, endTime: event.target.value })}
                />
              </label>
              <label>
                Количество мест
                <input
                  type="number"
                  min="1"
                  value={newTraining.slots}
                  onChange={(event) => setNewTraining({ ...newTraining, slots: Number(event.target.value) })}
                />
              </label>
              <button className="primary-button" onClick={submitBooking}>
                Создать тренировку
              </button>
            </>
          ) : selectedDay ? (
            <>
              <div className="mini-title">Дата: {selectedDay.date}</div>
              {selectedDay.bookings.length === 0 && <div>На эту дату пока нет расписания.</div>}
              {selectedDay.bookings.map((item) => (
                <div key={item.id} className="booking-card">
                  <div>
                    {item.startTime} — {item.endTime}
                  </div>
                  <div>
                    Свободно: {Number(item.slots) - (item.registrations?.length || 0)} / {item.slots}
                  </div>
                  <button className="secondary-button" onClick={() => setSelectedBooking(item)}>
                    Показать записи
                  </button>
                </div>
              ))}
              {selectedBooking && (
                <div className="booking-detail">
                  <div className="mini-title">Запись на {selectedBooking.startTime} — {selectedBooking.endTime}</div>
                  <label>
                    Ваше имя
                    <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
                  </label>
                  <button className="primary-button" onClick={() => submitRegistration(selectedBooking.id)}>
                    Записаться
                  </button>
                </div>
              )}
            </>
          ) : null}
        </Modal>
      )}
    </section>
  );
}
