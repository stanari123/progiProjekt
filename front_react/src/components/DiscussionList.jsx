import { useEffect, useState } from "react";
import "../index.css";
import { getAuth } from "../utils/auth";
import { escapeHtml } from "../utils/escapeHtml";
import { API_BASE } from "../config";



export default function DiscussionList({ buildingId }) {
  const [discussions, setDiscussions] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newPrivate, setNewPrivate] = useState(false);
  const [newMsg, setNewMsg] = useState("");

  const auth = getAuth();

  // Load discussions when building changes
  useEffect(() => {
    if (!buildingId) {
      setFeedback("Odaberite zgradu.");
      setDiscussions([]);
      return;
    }

    if (!auth.token) {
      setFeedback("Prijavite se za prikaz rasprava.");
      setDiscussions([]);
      return;
    }

    loadDiscussions(buildingId);
  }, [buildingId]);

  async function loadDiscussions(bid) {
    setLoading(true);
    setFeedback("");
    setDiscussions([]);

    try {
      const res = await fetch(
        `${API_BASE}/discussions?buildingId=${encodeURIComponent(bid)}`,
        { headers: { Authorization: "Bearer " + auth.token } }
      );

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        setFeedback(data.error || "Greška pri dohvaćanju rasprava.");
        return;
      }

      if (!Array.isArray(data) || data.length === 0) {
        setFeedback("Nema rasprava.");
        return;
      }

      setDiscussions(data);
    } catch (err) {
      console.error(err);
      setFeedback("Greška u komunikaciji.");
    } finally {
      setLoading(false);
    }
  }

  // Group discussions
  function groupDiscussions() {
    const publicOnes = [];
    const privateYes = [];
    const privateNo = [];

    for (const d of discussions) {
      if (!d) continue;

      if (d.visibility === "javno") publicOnes.push(d);
      else if (d.canViewContent === false) privateNo.push(d);
      else privateYes.push(d);
    }

    return { publicOnes, privateYes, privateNo };
  }

  async function handleCreate(e) {
    e.preventDefault();
    setNewMsg("");

    if (!newTitle.trim()) {
      setNewMsg("Unesite naslov rasprave.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          body: newBody.trim(),
          isPrivate: newPrivate,
          buildingId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setNewMsg(data.error || "Greška pri stvaranju rasprave.");
        return;
      }

      // Reset form
      setNewTitle("");
      setNewBody("");
      setNewPrivate(false);
      setShowForm(false);

      // Reload discussions
      await loadDiscussions(buildingId);
    } catch (err) {
      console.error(err);
      setNewMsg("Greška u komunikaciji.");
    }
  }

  const { publicOnes, privateYes, privateNo } = groupDiscussions();

  return (
    <section className="card">
      <div className="card-header">
        <h2>Rasprave</h2>

        {auth.token && (
          <button
            className="btn primary"
            onClick={() => setShowForm(true)}
            style={{ display: showForm ? "none" : "" }}
          >
            ➕ Nova rasprava
          </button>
        )}
      </div>

      {/* New Discussion Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            margin: "12px 0",
            border: "1px solid #e5e7eb",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          <label>
            Naslov:
            <br />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ width: "100%", padding: "6px" }}
              required
            />
          </label>

          <br />
          <br />

          <label>
            Opis:
            <br />
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              style={{ width: "100%", minHeight: "60px" }}
            />
          </label>

          <br />
          <br />

          <label>
            <input
              type="checkbox"
              checked={newPrivate}
              onChange={(e) => setNewPrivate(e.target.checked)}
            />{" "}
            Privatna rasprava
          </label>

          <br />
          <br />

          <div className="flex" style={{ gap: "8px" }}>
            <button type="submit" className="btn primary">
              Spremi
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setShowForm(false);
                setNewMsg("");
              }}
            >
              Odustani
            </button>
          </div>

          <div className="muted" style={{ marginTop: "6px" }}>
            {newMsg}
          </div>
        </form>
      )}

      {/* Discussion List */}
      <div id="discList">
        {loading && <div className="muted">Učitavam…</div>}

        {!loading && feedback && (
          <div className="muted" id="discFeedback">
            {feedback}
          </div>
        )}

        {!loading && !feedback && (
          <>
            {publicOnes.length > 0 && (
              <>
                <h3 style={{ marginTop: "18px" }}>🔹 Javne rasprave</h3>
                {publicOnes.map((d) => (
                  <DiscussionCard key={d.id} data={d} />
                ))}
              </>
            )}

            {privateYes.length > 0 && (
              <>
                <h3 style={{ marginTop: "18px" }}>
                  🔒 Privatne (dostupne vama)
                </h3>
                {privateYes.map((d) => (
                  <DiscussionCard key={d.id} data={d} />
                ))}
              </>
            )}

            {privateNo.length > 0 && (
              <>
                <h3 style={{ marginTop: "18px" }}>
                  🚫 Privatne (nedostupne)
                </h3>
                {privateNo.map((d) => (
                  <DiscussionCard key={d.id} data={d} muted />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function DiscussionCard({ data, muted }) {
  const isPrivate = data.visibility === "privatno";
  const canView = data.canViewContent;

  const handleClick = () => {
    if (isPrivate && canView === false) return;
    window.location.href = `/discussions/${data.id}`;
  };

  return (
    <article
      className={`card discussion-card ${muted ? "disc-muted" : ""}`}
      onClick={handleClick}
      style={{
        cursor: isPrivate && canView === false ? "not-allowed" : "pointer",
      }}
    >
      <h4>{escapeHtml(data.title || "Bez naslova")}</h4>

      {(data.visibility === "javno" || data.canViewContent) &&
        data.poll_description && (
          <p>{escapeHtml(data.poll_description)}</p>
        )}

      <div className="muted">
        {escapeHtml(data.ownerName || data.ownerEmail || "#" + data.id)}
        {data.created_at
          ? " · " + new Date(data.created_at).toLocaleString()
          : ""}
        {data.status ? " · " + data.status.toUpperCase() : ""}
        {isPrivate ? " · 🔒 Privatna" : ""}
      </div>
    </article>
  );
}
