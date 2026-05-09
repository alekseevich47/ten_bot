const icons = {
  feed: '📰',
  bookings: '🗓️',
  shop: '🛒',
  rating: '🏅',
  competitions: '🏆',
  gallery: '🖼️',
};

export default function BottomNav({ sections, active, onChange }) {
  return (
    <nav className="bottom-nav">
      {sections.map((section) => (
        <button
          key={section.id}
          className={`nav-item ${active === section.id ? 'active' : ''}`}
          onClick={() => onChange(section.id)}
        >
          <div className="nav-icon">{icons[section.id] || '•'}</div>
        </button>
      ))}
    </nav>
  );
}
