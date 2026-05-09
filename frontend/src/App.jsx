import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav.jsx';
import FeedSection from './components/FeedSection.jsx';
import BookingsSection from './components/BookingsSection.jsx';
import ShopSection from './components/ShopSection.jsx';
import RatingSection from './components/RatingSection.jsx';
import CompetitionsSection from './components/CompetitionsSection.jsx';
import GallerySection from './components/GallerySection.jsx';
import ModeratorLogin from './components/ModeratorLogin.jsx';

const sections = [
  { id: 'feed', label: 'Лента' },
  { id: 'bookings', label: 'Тренировки' },
  { id: 'shop', label: 'Магазин' },
  { id: 'rating', label: 'Рейтинг' },
  { id: 'competitions', label: 'Соревнования' },
  { id: 'gallery', label: 'Галерея' },
];

function App() {
  const [activeSection, setActiveSection] = useState('feed');
  const [isModerator, setIsModerator] = useState(false);
  const [moderatorToken, setModeratorToken] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('ten_bot_moderator_token');
    if (token) {
      setModeratorToken(token);
      setIsModerator(true);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('ten_bot_moderator_token', token);
    setModeratorToken(token);
    setIsModerator(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('ten_bot_moderator_token');
    setModeratorToken('');
    setIsModerator(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'bookings':
        return <BookingsSection isModerator={isModerator} token={moderatorToken} />;
      case 'shop':
        return <ShopSection isModerator={isModerator} token={moderatorToken} />;
      case 'rating':
        return <RatingSection isModerator={isModerator} token={moderatorToken} />;
      case 'competitions':
        return <CompetitionsSection isModerator={isModerator} token={moderatorToken} />;
      case 'gallery':
        return <GallerySection isModerator={isModerator} token={moderatorToken} />;
      default:
        return <FeedSection isModerator={isModerator} token={moderatorToken} />;
    }
  };

  const activeLabel = sections.find((section) => section.id === activeSection)?.label || 'Лента';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="section-title">{activeLabel}</div>
          <div className="section-subtitle">Мини-приложение секции настольного тенниса</div>
        </div>
        <div className="header-actions">
          {isModerator ? (
            <button className="header-button secondary" onClick={handleLogout}>
              Выйти
            </button>
          ) : (
            <ModeratorLogin onLogin={handleLogin} />
          )}
        </div>
      </header>

      <main className="page-content">{renderSection()}</main>

      <BottomNav sections={sections} active={activeSection} onChange={setActiveSection} />
    </div>
  );
}

export default App;
