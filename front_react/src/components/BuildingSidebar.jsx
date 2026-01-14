import { useEffect, useState } from "react";
import "../index.css";
import { getAuth } from "../utils/auth";
import { escapeHtml } from "../utils/escapeHtml";
import { loadBuildings, loadMembers } from "../services/buildings";
import { createBuilding } from "../services/admin";

export default function BuildingSidebar({
  onBuildingChange,
  disableSelector = false,
  selectedBuildingId = null,
}) {
  const [buildings, setBuildings] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [members, setMembers] = useState({
    admins: [],
    reps: [],
    owners: [],
  });

  const { user } = getAuth();
  const isAdmin = (user?.role || "").toLowerCase() === "admin";

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newCity, setNewCity] = useState("");
  const [addErr, setAddErr] = useState("");
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setAddErr("");
    setNewName("");
    setNewStreet("");
    setNewNumber("");
    setNewCity("");
    setShowAdd(true);
  }

  function closeAdd() {
    setShowAdd(false);
  }

  async function saveBuilding() {
    setAddErr("");

    const name = newName.trim();
    const street = newStreet.trim();
    const number = newNumber.trim();
    const city = newCity.trim();

    if (!name || !street || !number || !city) {
      setAddErr("Molim popuni sva polja.");
      return;
    }

    const address = `${street} ${number}, ${city}`;

    try {
      setSaving(true);
      const created = await createBuilding({ name, address });

      const data = await loadBuildings();
      setBuildings(Array.isArray(data) ? data : []);

      if (created?.id) {
        setSelectedId(created.id);
        localStorage.setItem("lastBuildingId", created.id);
        if (onBuildingChange) onBuildingChange(created.id);
      }

      setShowAdd(false);
    } catch (e) {
      setAddErr(e?.message || "Greška pri dodavanju zgrade.");
    } finally {
      setSaving(false);
    }
  }

  // Load buildings on mount
  useEffect(() => {
    async function init() {
      const { token } = getAuth();
      if (!token) {
        setBuildings([]);
        setSelectedId("");
        if (onBuildingChange) onBuildingChange(null);
        return;
      }

      try {
        const data = await loadBuildings();

        if (!Array.isArray(data) || data.length === 0) {
          setBuildings([]);
          setSelectedId("");
          if (onBuildingChange) onBuildingChange(null);
          return;
        }

        setBuildings(data);

        if (selectedBuildingId && data.some((b) => String(b.id) === String(selectedBuildingId))) {
          setSelectedId(String(selectedBuildingId));
          return;
        }

        const saved = localStorage.getItem("lastBuildingId");
        const initial =
          saved && data.some((b) => String(b.id) === String(saved))
            ? String(saved)
            : String(data[0].id);

        setSelectedId(initial);
        localStorage.setItem("lastBuildingId", initial);

        if (onBuildingChange) onBuildingChange(initial);
      } catch (err) {
        console.error("Error loading buildings:", err);
        setBuildings([]);
        setSelectedId("");
        if (onBuildingChange) onBuildingChange(null);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (!selectedBuildingId) return;
    const v = String(selectedBuildingId);
    if (v && v !== String(selectedId)) {
      setSelectedId(v);
    }
  }, [selectedBuildingId, selectedId]);

  // Load members when building changes
  useEffect(() => {
    async function load() {
      const { token } = getAuth();
      if (!token || !selectedId) {
        setMembers({ admins: [], reps: [], owners: [] });
        return;
      }

      try {
        const data = await loadMembers(selectedId);

        if (!Array.isArray(data)) {
          setMembers({ admins: [], reps: [], owners: [] });
          return;
        }

        const admins = [];
        const reps = [];
        const owners = [];

        for (const m of data) {
          const name =
            [m.firstName, m.lastName].filter(Boolean).join(" ") ||
            m.email ||
            m.userId;

          const safe = escapeHtml(name);
          const role = (m.roleInBuilding || "").toLowerCase();

          if (role === "admin") admins.push(safe);
          else if (role === "predstavnik") reps.push(safe);
          else owners.push(safe);
        }

        setMembers({ admins, reps, owners });
      } catch (err) {
        console.error("Error loading members:", err);
        setMembers({ admins: [], reps: [], owners: [] });
      }
    }

    if (selectedId) load();
  }, [selectedId]);

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <label htmlFor="buildingSel">Zgrada:</label>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            id="buildingSel"
            value={selectedId}
            disabled={disableSelector}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedId(id);
              localStorage.setItem("lastBuildingId", id);
              if (onBuildingChange) onBuildingChange(id || null);
            }}
          >
            {buildings.length === 0 ? (
              <option value="">Nema zgrada</option>
            ) : (
              buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {escapeHtml(b.name)}
                </option>
              ))
            )}
          </select>

          {isAdmin && (
            <button type="button" className="btn" onClick={openAdd}>
              + Nova zgrada
            </button>
          )}
        </div>

        {showAdd && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "16px",
            }}
          >
            <div className="card" style={{ maxWidth: "520px", width: "100%" }}>
              <h3>Nova zgrada</h3>

              <div style={{ display: "grid", gap: "8px", marginTop: "10px" }}>
                <input
                  placeholder="Naziv zgrade"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <input
                  placeholder="Ulica"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                />
                <input
                  placeholder="Broj"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                />
                <input
                  placeholder="Grad"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                />

                {addErr && (
                  <div className="muted" style={{ color: "crimson" }}>
                    {addErr}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn" onClick={closeAdd} disabled={saving}>
                    Odustani
                  </button>
                  <button type="button" className="btn" onClick={saveBuilding} disabled={saving}>
                    {saving ? "Spremanje..." : "Spremi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-members">
        <div style={{ margin: "8px 0" }}>
          <h3>Članovi zgrade</h3>

          <div className="card" style={{ marginTop: "8px" }}>
            <div className="muted" style={{ fontWeight: 600, marginBottom: 4 }}>
              Admin
            </div>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              {members.admins.length ? members.admins.map((n, i) => <li key={i}>{n}</li>) : <li>—</li>}
            </ul>
          </div>

          <div className="card" style={{ marginTop: "8px" }}>
            <div className="muted" style={{ fontWeight: 600, marginBottom: 4 }}>
              Predstavnici
            </div>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              {members.reps.length ? members.reps.map((n, i) => <li key={i}>{n}</li>) : <li>—</li>}
            </ul>
          </div>

          <div className="card" style={{ marginTop: "8px" }}>
            <div className="muted" style={{ fontWeight: 600, marginBottom: 4 }}>
              Suvlasnici
            </div>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              {members.owners.length ? members.owners.map((n, i) => <li key={i}>{n}</li>) : <li>—</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
