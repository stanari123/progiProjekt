import { useEffect, useState } from "react";
import "../index.css";
import { getAuth } from "../utils/auth";
import { escapeHtml } from "../utils/escapeHtml";
import { loadBuildings, loadMembers } from "../services/buildings";

export default function BuildingSidebar({ onBuildingChange }) {
  const [buildings, setBuildings] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [members, setMembers] = useState({
    admins: [],
    reps: [],
    owners: [],
  });

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

        // Restore last selected building
        const saved = localStorage.getItem("lastBuildingId");
        const initial =
          saved && data.some((b) => b.id === saved)
            ? saved
            : data[0].id;

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
    <div style={{ margin: "10px 0" }}>
      <label htmlFor="buildingSel">Zgrada:</label>

      <select
        id="buildingSel"
        value={selectedId}
        onChange={(e) => {
          const id = e.target.value;
          setSelectedId(id);
          localStorage.setItem("lastBuildingId", id);
          if (onBuildingChange) onBuildingChange(id);
        }}
      >
        {buildings.length === 0 && (
          <option value="">Nema zgrada</option>
        )}

        {buildings.map((b) => (
          <option key={b.id} value={b.id}>
            {escapeHtml(b.name)}
          </option>
        ))}
      </select>

      <div style={{ margin: "16px 0" }}>
        <h3>Članovi zgrade</h3>

        <div className="card" style={{ marginTop: "8px" }}>
          <div className="muted" style={{ fontWeight: 600, marginBottom: 4 }}>
            Admin
          </div>
          <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
            {members.admins.length
              ? members.admins.map((n, i) => <li key={i}>{n}</li>)
              : <li>—</li>}
          </ul>
        </div>

        <div className="card" style={{ marginTop: "8px" }}>
          <div className="muted" style={{ fontWeight: 600, marginBottom: 4 }}>
            Predstavnici
          </div>
          <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
            {members.reps.length
              ? members.reps.map((n, i) => <li key={i}>{n}</li>)
              : <li>—</li>}
          </ul>
        </div>

        <div className="card" style={{ marginTop: "8px" }}>
          <div className="muted" style={{ fontWeight: 600, marginBottom: 4 }}>
            Suvlasnici
          </div>
          <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
            {members.owners.length
              ? members.owners.map((n, i) => <li key={i}>{n}</li>)
              : <li>—</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
