import { useEffect, useMemo, useState } from "react";
import "../index.css";
import { getAuth } from "../utils/auth";
import { escapeHtml } from "../utils/escapeHtml";
import { loadBuildings, loadMembers } from "../services/buildings";
import {
  createBuilding,
  getAllUsers,
  addMembersToBuilding,
  removeMembersFromBuilding,
} from "../services/admin";

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
    all: [],
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

  const [editOpen, setEditOpen] = useState(false);

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
  async function refreshMembers(bid) {
    const { token } = getAuth();
    if (!token || !bid) {
      setMembers({ admins: [], reps: [], owners: [], all: [] });
      return;
    }

    try {
      const data = await loadMembers(bid);
      if (!Array.isArray(data)) {
        setMembers({ admins: [], reps: [], owners: [], all: [] });
        return;
      }

      const admins = [];
      const reps = [];
      const owners = [];
      const all = [];

      for (const m of data) {
        const id = m.userId;
        if (!id) continue;

        const name =
          [m.firstName, m.lastName].filter(Boolean).join(" ").trim() ||
          m.email ||
          String(id);

        const role = (m.roleInBuilding || "").toLowerCase();
        const entry = { id: String(id), name, role };

        all.push(entry);
        if (role === "admin") admins.push(entry);
        else if (role === "predstavnik") reps.push(entry);
        else owners.push(entry);
      }

      setMembers({ admins, reps, owners, all });
    } catch (err) {
      console.error("Error loading members:", err);
      setMembers({ admins: [], reps: [], owners: [], all: [] });
    }
  }

  useEffect(() => {
    if (selectedId) refreshMembers(selectedId);
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
              ➕ Nova zgrada
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
          <div className="members-head">
            <h3 style={{ margin: 0 }}>Članovi zgrade</h3>

            {isAdmin && (
              <button
                type="button"
                className="btn"
                onClick={() => setEditOpen(true)}
                disabled={!selectedId}
              >
                ✏️ Uredi
              </button>
            )}
          </div>

          <div className="card" style={{ marginTop: "8px" }}>
            <div className="muted" style={{ fontWeight: 600, marginBottom: 4 }}>
              Admin
            </div>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              {members.admins.length ? (members.admins.map((m) => <li key={m.id}>{m.name}</li>)) : (<li>—</li>)}
            </ul>
          </div>

          <div className="card" style={{ marginTop: "8px" }}>
            <div className="muted" style={{ fontWeight: 600, marginBottom: 4 }}>
              Predstavnici
            </div>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              {members.reps.length ? (members.reps.map((m) => <li key={m.id}>{m.name}</li>)) : (<li>—</li>)}
            </ul>
          </div>

          <div className="card" style={{ marginTop: "8px" }}>
            <div className="muted" style={{ fontWeight: 600, marginBottom: 4 }}>
              Suvlasnici
            </div>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              {members.owners.length ? (members.owners.map((m) => <li key={m.id}>{m.name}</li>)) : (<li>—</li>)}
            </ul>
          </div>
        </div>
      </div>

      {editOpen && (
        <EditMembersModal
          buildingId={selectedId}
          currentMembersAll={members.all || []}
          removableMembers={(members.all || []).filter(m => m.role !== "admin")}
          onClose={() => setEditOpen(false)}
          onChanged={async () => {
            await refreshMembers(selectedId);
          }}
        />
      )}
    </div>
  );
}

function EditMembersModal({ buildingId, currentMembersAll, removableMembers, onClose, onChanged }) {
  const [tab, setTab] = useState("remove"); // "remove" | "add"
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // REMOVE
  const [removeSet, setRemoveSet] = useState(() => new Set());

  // ADD
  const [allUsers, setAllUsers] = useState([]);
  const [q, setQ] = useState("");
  const [addSet, setAddSet] = useState(() => new Set());

  const memberIdSet = useMemo(() => {
    return new Set((currentMembersAll || []).map((m) => String(m.id)));
  }, [currentMembersAll]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const data = await getAllUsers();
        if (!alive) return;
        setAllUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setAllUsers([]);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = Array.isArray(allUsers) ? allUsers : [];

    return list
      .map((u) => {
        const id = String(u.id || "");
        const name =
          [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
          u.email ||
          id;
        return { id, name, email: u.email || "" };
      })
      .filter((u) => u.id)
      .filter((u) => !memberIdSet.has(u.id))
      .filter((u) => {
        if (!query) return true;
        return (
          u.name.toLowerCase().includes(query) ||
          (u.email || "").toLowerCase().includes(query)
        );
      });
  }, [allUsers, q, memberIdSet]);

  const canConfirm =
    tab === "remove" ? removeSet.size > 0 : addSet.size > 0;

  async function confirm() {
    if (!buildingId) return;
    if (!canConfirm) return;

    setErr("");
    setSaving(true);

    try {
      if (tab === "remove") {
        const ids = Array.from(removeSet);
        await removeMembersFromBuilding(buildingId, ids);
      } else {
        const ids = Array.from(addSet);
        await addMembersToBuilding(buildingId, ids);
      }

      setRemoveSet(new Set());
      setAddSet(new Set());
      setQ("");

      if (onChanged) await onChanged();
      onClose();
    } catch (e) {
      setErr(e?.message || "Greška.");
    } finally {
      setSaving(false);
    }
  }

  function toggleRemove(id) {
    setRemoveSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAdd(id) {
    setAddSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal modal-wide members-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Uredi članove</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="members-tabs">
          <button
            type="button"
            className={`members-tab ${tab === "remove" ? "active" : ""}`}
            onClick={() => setTab("remove")}
          >
            Ukloni članove
          </button>
          <button
            type="button"
            className={`members-tab ${tab === "add" ? "active" : ""}`}
            onClick={() => setTab("add")}
          >
            Dodaj članove
          </button>
        </div>

        <div className="modal-body members-modal-body">
          {tab === "remove" ? (
            <>
              <div className="muted" style={{ marginBottom: 10 }}>
                Odaberite članove koje želite ukloniti iz zgrade.
              </div>

              <div className="members-list">
                {(removableMembers || []).length === 0 ? (
                  <div className="muted">Nema članova.</div>
                ) : (
                  removableMembers.map((m) => {
                    const checked = removeSet.has(String(m.id));
                    return (
                      <label key={m.id} className="member-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRemove(String(m.id))}
                        />
                        <span className="member-name">{m.name}</span>
                        <span className="member-role muted">
                          {m.role || "—"}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <>
              <div className="members-search">
                <input
                  type="text"
                  value={q}
                  placeholder="Pretraži korisnike (ime / email)…"
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div className="members-list">
                {filteredUsers.length === 0 ? (
                  <div className="muted">Nema rezultata.</div>
                ) : (
                  filteredUsers.map((u) => {
                    const checked = addSet.has(u.id);
                    return (
                      <label key={u.id} className="member-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAdd(u.id)}
                        />
                        <span className="member-name">{u.name}</span>
                        <span className="member-role muted">{u.email}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </>
          )}

          {err && (
            <div className="muted" style={{ color: "crimson", marginTop: 10 }}>
              {err}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Odustani
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={confirm}
            disabled={!canConfirm || saving}
          >
            {saving ? "Spremanje..." : "Potvrdi"}
          </button>
        </div>
      </div>
    </div>
  );
}
