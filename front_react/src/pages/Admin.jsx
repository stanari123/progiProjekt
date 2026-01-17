import { useState } from "react";
import "../admin/admin.css";
import { useEffect } from "react";
import { getAdminBuildings, createAdminUser } from "../services/admin";
import { getAuth } from "../utils/auth";
import Topbar from "../components/Topbar";
import ProfilePanel from "../components/ProfilePanel";


export default function Admin() {
  const [showNewUser, setShowNewUser] = useState(false);
  const [showStanPlan, setShowStanPlan] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = getAuth();

  // FRONTEND PROTECTION
  if (!user || user.role !== "admin") {
    window.location.href = "/";
    return null;
  }


  return (
    <>
      <Topbar onProfileToggle={() => setProfileOpen(true)} />
      <ProfilePanel isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      <main className="admin-page">
        <div className="admin-cards">
          <div className="admin-card" onClick={() => (window.location.href = "/")}>
            <img src="/images/building.png" alt="Zgrade" />
            <h2>Zgrade</h2>
          </div>

          <div className="admin-card" onClick={() => setShowNewUser(true)}>
            <img src="/images/user.png" alt="Novi korisnik" />
            <h2>Novi korisnik</h2>
          </div>

          <div className="admin-card" onClick={() => setShowStanPlan(true)}>
            <img src="/images/plan.png" alt="StanPlan" />
            <h2>StanPlan</h2>
          </div>
        </div>

        {showNewUser && <NewUserModal onClose={() => setShowNewUser(false)} />}
        {showStanPlan && <StanPlanModal onClose={() => setShowStanPlan(false)} />}
      </main>
    </>
  );

}

function NewUserModal({ onClose }) {
  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novi korisnik</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <NewUserForm onClose={onClose} />
      </div>
    </div>
  );
}

function NewUserForm({ onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("predstavnik");
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [feedback, setFeedback] = useState("");

  // Load buildings when modal opens
  useEffect(() => {
    async function load() {
      const data = await getAdminBuildings();
      setBuildings(Array.isArray(data) ? data : []);
    }
    load();
  }, []);

  function toggleBuilding(id) {
    setSelectedBuildings((prev) =>
      prev.includes(id)
        ? prev.filter((b) => b !== id)
        : [...prev, id]
    );
  }

  async function handleSave() {
    if (!email || !password) {
      setFeedback("E-pošta i lozinka su obavezni.");
      return;
    }

    const res = await createAdminUser({
      firstName,
      lastName,
      email,
      password,
      role,
      buildingIds: selectedBuildings
    });

    if (res?.message && res.error) {
      setFeedback(res.message);
      return;
    }

    onClose();
  }

  return (
    <>
      <div className="modal-body">
        <label className="form-row">
          <span>Ime</span>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </label>

        <label className="form-row">
          <span>Prezime</span>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </label>

        <label className="form-row">
          <span>E-pošta</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className="form-row">
          <span>Lozinka</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <label className="form-row">
          <span>Uloga</span>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="predstavnik">Predstavnik</option>
            <option value="suvlasnik">Suvlasnik</option>
          </select>
        </label>

        <label className="form-row">
          <span>Zgrade</span>
          <div className="buildings-list">
            {buildings.length === 0 && <p className="text-muted">Nema zgrada.</p>}
            {buildings.map((b) => (
              <label key={b.id} className="building-item">
                <input
                  type="checkbox"
                  checked={selectedBuildings.includes(b.id)}
                  onChange={() => toggleBuilding(b.id)}
                />
                <span>{b.name}{b.address ? " – " + b.address : ""}</span>
              </label>
            ))}
          </div>
        </label>

        <p className="modal-feedback">{feedback}</p>
      </div>

      <div className="modal-footer">
        <button className="btn-primary" onClick={handleSave}>Spremi</button>
      </div>
    </>
  );

}

function StanPlanModal({ onClose }) {
  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>StanPlan poveznica</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <StanPlanForm onClose={onClose} />
      </div>
    </div>
  );
}

function StanPlanForm({ onClose }) {
  const STORAGE_KEY = "stanplan_link";

  const [savedLink, setSavedLink] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [link, setLink] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const trimmed = link.trim();
  const trimmedSaved = savedLink.trim();

  const isSaveDisabled = saving || trimmed.length === 0 || trimmed === trimmedSaved;

  function isValidUrl(value) {
    try {
      const v = value.startsWith("http://") || value.startsWith("https://")
        ? value
        : `https://${value}`;
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSave() {
    setFeedback("");

    if (trimmed.length === 0) {
      setFeedback("Unesi poveznicu.");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setFeedback("Poveznica nije valjana (URL).");
      return;
    }

    setSaving(true);
    try {
      // spremanje lokalno (kasnije zamijeni API pozivom)
      localStorage.setItem(STORAGE_KEY, trimmed);
      setSavedLink(trimmed);
      setFeedback("Spremljeno.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="modal-body">
        <label className="form-row">
          <span>Poveznica</span>
          <input
            type="text"
            placeholder="npr. https://..."
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setFeedback("");
            }}
          />
        </label>

        <p className="modal-feedback">{feedback}</p>
      </div>

      <div className="modal-footer">
        <button className="btn-secondary" onClick={onClose} type="button">
          Odustani
        </button>

        <button className="btn-primary" onClick={handleSave} disabled={isSaveDisabled} type="button">
          {saving ? "Spremanje..." : "Spremi"}
        </button>
      </div>
    </>
  );
}
