import { useState } from "react";
import "../admin/admin.css";
import { useEffect } from "react";
import { getAdminBuildings, createAdminUser } from "../services/admin";
import { getAuth } from "../utils/auth";


export default function Admin() {
  const [showNewUser, setShowNewUser] = useState(false);
  const { user } = getAuth();

  // FRONTEND PROTECTION
  if (!user || user.role !== "admin") {
    window.location.href = "/";
    return null;
  }


  return (
    <main>
      <div className="admin-cards">
        <div
          className="admin-card"
          onClick={() => (window.location.href = "/")}
        >
          <img src="/images/buildings-placeholder.jpg" alt="Zgrade" />
          <h2>Zgrade</h2>
        </div>

        <div
          className="admin-card"
          onClick={() => setShowNewUser(true)}
        >
          <img src="/images/placeholder2.jpg" alt="Novi korisnik" />
          <h2>Novi korisnik</h2>
        </div>

        <div className="admin-card">
          <img src="/images/placeholder3.jpg" alt="StanPlan" />
          <h2>StanPlan</h2>
        </div>
      </div>

      {showNewUser && (
        <NewUserModal onClose={() => setShowNewUser(false)} />
      )}
    </main>
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
