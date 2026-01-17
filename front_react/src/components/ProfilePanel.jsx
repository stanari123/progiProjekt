import { useEffect, useState } from "react";
import "../index.css";
import { getAuth, clearAuth } from "../utils/auth";

export default function ProfilePanel({ isOpen, onClose }) {
  const [auth, setAuth] = useState({ user: null, token: null });

  useEffect(() => {
    setAuth(getAuth());
  }, [isOpen]);

  function handleLogout() {
    clearAuth();
    setAuth({ user: null, token: null });
    onClose();
    window.location.href = "/login";
  }

  const u = auth.user;

  const firstName = u?.firstName ?? "";
  const lastName = u?.lastName ?? "";
  const email = u?.email ?? "";
  const role = u?.role ?? "";

  const fullName =
    (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (u?.name ?? "");

  const roleLabel =
    role === "admin" ? "Administrator" :
    role === "predstavnik" ? "Predstavnik" :
    role === "suvlasnik" ? "Suvlasnik" :
    (role || "-");

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
        {u ? (
          <div className="profile-fields">
            <div className="profile-row">
              <span className="label">Ime</span>
              <span className="value">{firstName || "-"}</span>
            </div>

            <div className="profile-row">
              <span className="label">Prezime</span>
              <span className="value">{lastName || "-"}</span>
            </div>

            <div className="profile-row">
              <span className="label">E-mail</span>
              <span className="value">{email || "-"}</span>
            </div>

            <div className="profile-row">
              <span className="label">Uloga</span>
              <span className="value">{roleLabel}</span>
            </div>
          </div>
        ) : (
          "Niste prijavljeni."
        )}
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
