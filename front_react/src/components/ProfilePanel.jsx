import { useEffect, useMemo, useState } from "react";
import "../index.css";
import { getAuth, clearAuth } from "../utils/auth";

export default function ProfilePanel({ isOpen, onClose }) {
  const [auth, setAuth] = useState({ user: null, token: null });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    setAuth(getAuth());

    if (!isOpen) {
      setSettingsOpen(false);
      resetPwForm();
    }
  }, [isOpen]);

  function resetPwForm() {
    setCurrentPassword("");
    setNewPassword("");
    setNewPassword2("");
    setSavingPw(false);
    setPwMsg("");
  }

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

  const roleLabel =
    role === "admin" ? "Administrator" :
    role === "predstavnik" ? "Predstavnik":
    role === "suvlasnik" ? "Suvlasnik":
    role || "-";

  const canOpenSettings = !!auth.token;

  const canSubmitPw = useMemo(() => {
    if (!auth.token) return false;
    if (savingPw) return false;

    const c = currentPassword.trim();
    const n = newPassword.trim();
    const n2 = newPassword2.trim();

    if (!c || !n || !n2) return false;
    if (n.length < 6) return false;
    if (n !== n2) return false;
    if (c === n) return false;

    return true;
  }, [auth.token, savingPw, currentPassword, newPassword, newPassword2]);

  async function handleChangePassword() {
    if (!auth.token) return;

    setPwMsg("");

    const c = currentPassword.trim();
    const n = newPassword.trim();
    const n2 = newPassword2.trim();

    if (!c || !n || !n2) {
      setPwMsg("Sva polja su obavezna.");
      return;
    }
    if (n.length < 6) {
      setPwMsg("Nova lozinka mora imati barem 6 znakova.");
      return;
    }
    if (n !== n2) {
      setPwMsg("Nova lozinka i potvrda se ne podudaraju.");
      return;
    }
    if (c === n) {
      setPwMsg("Nova lozinka mora biti različita od trenutne.");
      return;
    }

    setSavingPw(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwMsg(out.error || "Greška pri promjeni lozinke.");
        return;
      }

      setPwMsg("Lozinka je promijenjena.");

      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch (e) {
      setPwMsg("Greška pri promjeni lozinke.");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <>
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

        {canOpenSettings && (
          <div className="profile-settings-card">
            <div className="profile-settings-head">
              <div style={{ fontWeight: 700 }}>Postavke</div>
              <div className="muted" style={{ fontSize: "0.85rem" }}>
                Upravljanje računom
              </div>
            </div>

            <button
              type="button"
              className="btn"
              onClick={() => {
                setSettingsOpen(true);
                setPwMsg("");
              }}
            >
              🔒 Promjena lozinke
            </button>
          </div>
        )}

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

      {settingsOpen && (
        <div
          className="modal-backdrop open"
          onClick={() => {
            setSettingsOpen(false);
            resetPwForm();
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Postavke</h2>
              <button
                className="modal-close"
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  resetPwForm();
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="settings-section">
                <div className="settings-title">Promjena lozinke</div>

                <label className="form-row">
                  <span>Trenutna lozinka</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPwMsg("");
                    }}
                    autoComplete="current-password"
                  />
                </label>

                <label className="form-row">
                  <span>Nova lozinka</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPwMsg("");
                    }}
                    autoComplete="new-password"
                  />
                </label>

                <label className="form-row">
                  <span>Potvrdi novu lozinku</span>
                  <input
                    type="password"
                    value={newPassword2}
                    onChange={(e) => {
                      setNewPassword2(e.target.value);
                      setPwMsg("");
                    }}
                    autoComplete="new-password"
                  />
                </label>

                <div className="modal-feedback">{pwMsg}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  resetPwForm();
                }}
                disabled={savingPw}
              >
                Odustani
              </button>

              <button
                className="btn-primary"
                type="button"
                onClick={handleChangePassword}
                disabled={!canSubmitPw}
              >
                {savingPw ? "Spremanje..." : "Spremi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
