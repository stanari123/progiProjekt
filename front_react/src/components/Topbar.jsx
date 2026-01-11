import "../index.css";


export default function Topbar({ onProfileToggle }) {
  return (
    <header className="topbar">
      <button
        className="topbar-title"
        onClick={() => (window.location.href = "/")}
      >
        🏢 StanBlog
      </button>

      <button
        className="icon-btn"
        title="Profil"
        type="button"
        onClick={onProfileToggle}
      >
        👤
      </button>
    </header>
  );
}
