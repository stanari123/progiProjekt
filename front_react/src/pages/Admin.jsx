import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "../admin/admin.css";
import { getAdminBuildings, createAdminUser, getStanPlanLink, setStanPlanLink } from "../services/admin";
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
    window.location.href = "/login";
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
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novi korisnik</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
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

  // ključna stvar: desni panel prati visinu lijevog stupca
  const leftColRef = useRef(null);
  const [rightMaxHeight, setRightMaxHeight] = useState(220);

  useEffect(() => {
    async function load() {
      const data = await getAdminBuildings();
      setBuildings(Array.isArray(data) ? data : []);
    }
    load();
  }, []);

  useLayoutEffect(() => {
    const el = leftColRef.current;
    if (!el) return;

    const update = () => {
      const h = el.getBoundingClientRect().height;
      setRightMaxHeight(Math.max(160, Math.floor(h)));
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  function toggleBuilding(id) {
    setSelectedBuildings((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
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
      buildingIds: selectedBuildings,
    });

    if (res?.message && res.error) {
      setFeedback(res.message);
      return;
    }

    onClose();
  }

  const buildingsLabel = useMemo(() => {
    return selectedBuildings.length > 0 ? `Zgrade (${selectedBuildings.length})` : "Zgrade";
  }, [selectedBuildings.length]);

  return (
    <>
      <div className="modal-body modal-two-col">
        {/* LEFT */}
        <div className="modal-col left" ref={leftColRef}>
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

          <p className="modal-feedback">{feedback}</p>
        </div>

        {/* RIGHT */}
        <div className="modal-col right">
          <div className="buildings-panel" style={{ height: rightMaxHeight }}>
            <div className="buildings-title">{buildingsLabel}</div>

            <div className="buildings-list buildings-scroll">
              {buildings.length === 0 && <p className="text-muted">Nema zgrada.</p>}
              {buildings.map((b) => (
                <label key={b.id} className="building-item">
                  <input
                    type="checkbox"
                    checked={selectedBuildings.includes(b.id)}
                    onChange={() => toggleBuilding(b.id)}
                  />
                  <span>
                    {b.name}
                    {b.address ? " – " + b.address : ""}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-primary" onClick={handleSave}>
          Spremi
        </button>
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
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <StanPlanForm onClose={onClose} />
      </div>
    </div>
  );
}

function StanPlanForm({ onClose }) {
  const [savedLink, setSavedLink] = useState("");
  const [link, setLink] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const trimmed = link.trim();
  const trimmedSaved = savedLink.trim();
  const isSaveDisabled = saving || loading || trimmed.length === 0 || trimmed === trimmedSaved;

  function isValidUrl(value) {
    try {
      const v = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const data = await getStanPlanLink();
        const existing = (data?.link || "").trim();
        setSavedLink(existing);
        setLink(existing);
      } catch (e) {
        setFeedback("Ne mogu dohvatiti spremljenu poveznicu.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
      const res = await setStanPlanLink(trimmed);
      const newLink = (res?.link || trimmed).trim();
      setSavedLink(newLink);
      setLink(newLink);
      setFeedback("Spremljeno.");
    } catch (e) {
      setFeedback(e?.message || "Greška pri spremanju.");
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
            disabled={loading}
            onChange={(e) => {
              setLink(e.target.value);
              setFeedback("");
            }}
          />
        </label>

        <p className="modal-feedback">
          {loading ? "Učitavanje..." : feedback}
        </p>
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

