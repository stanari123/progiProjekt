import "../index.css";
import { useNavigate } from "react-router-dom";
import { getAuth } from "../utils/auth";

export default function Topbar({ onProfileToggle }) {
  const navigate = useNavigate();
  const { user } = getAuth();

  function handleHomeClick() {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/";
    }
  }

  return (
    <header className="topbar">
      <button
        className="topbar-title"
        onClick={handleHomeClick}
        type="button"
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
