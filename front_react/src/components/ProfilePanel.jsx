import { useEffect, useState } from "react";
import "../index.css";
import { getAuth } from "../utils/auth";


export default function ProfilePanel({ isOpen, onClose }) {
  const [auth, setAuth] = useState({ user: null, token: null });

  // Load auth info from global helper
  useEffect(() => {
    if (getAuth) {
      setAuth(getAuth());
    }
  }, [isOpen]);

  function handleLogout() {
    if (window.logout) {
      window.logout();
    }
    setAuth({ user: null, token: null });
    onClose();
  }

  return (
    <aside
      id="profilePanel"
      className={`slide ${isOpen ? "open" : ""}`}
      aria-hidden={!isOpen}
    >
      <h3>Profil</h3>

      <button
        className="close-btn"
        aria-label="Zatvori"
        type="button"
        onClick={onClose}
      >
        ×
      </button>

      <div id="profileContent" className="muted">
        {auth.user
          ? `${auth.user.name || auth.user.email}`
          : "Niste prijavljeni."}
      </div>

      <div className="actions">
        {auth.token ? (
          <button className="btn" type="button" onClick={handleLogout}>
            Odjava
          </button>
        ) : (
          <a href="/login" className="btn" id="loginLink">
            Prijava
          </a>
        )}
      </div>
    </aside>
  );
}
