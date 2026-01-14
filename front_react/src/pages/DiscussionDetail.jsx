import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import ProfilePanel from "../components/ProfilePanel";
import BuildingSidebar from "../components/BuildingSidebar";
import BuildingMapPanel from "../components/BuildingMapPanel";
import "../index.css";
import { getAuth } from "../utils/auth";
import { escapeHtml } from "../utils/escapeHtml";

export default function DiscussionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [buildingId, setBuildingId] = useState(null);

  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();

  // Load discussion
  useEffect(() => {
    async function load() {
      if (!id || !auth.token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/discussions/${id}`, {
          headers: { Authorization: "Bearer " + auth.token },
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) {
          setDiscussion(null);
        } else {
          setDiscussion(d);
          setBuildingId(d.building_id ?? null);
        }
      } catch (err) {
        console.error(err);
        setDiscussion(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, auth.token]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  if (!auth.token) {
    return (
      <>
        <Topbar onProfileToggle={() => setProfileOpen(true)} />
        <ProfilePanel isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

        <main className="layout">
          <div className="left-col">
            <BuildingSidebar
              onBuildingChange={setBuildingId}
              disableSelector={true}
              selectedBuildingId={buildingId}
            />
          </div>

          <div className="center-col">
            <div className="card">
              <p>Prijavite se za prikaz rasprave.</p>
              <button className="btn" onClick={() => navigate("/login")}>
                Login
              </button>
            </div>
          </div>

          <div className="right-col">
            <BuildingMapPanel buildingId={buildingId} />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar onProfileToggle={() => setProfileOpen(true)} />
      <ProfilePanel isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      <main className="layout">
        <div className="left-col">
          <BuildingSidebar
            onBuildingChange={setBuildingId}
            disableSelector={true}
            selectedBuildingId={buildingId}
          />
        </div>

        <div className="center-col">
          {loading && (
            <section className="card">
              <p>Učitavam raspravu…</p>
            </section>
          )}

          {!loading && !discussion && (
            <section className="card">
              <p>Ne mogu dohvatiti raspravu.</p>
              <button className="btn" onClick={handleBack}>
                ⟵ Natrag
              </button>
            </section>
          )}

          {!loading && discussion && (
            <>
              <DiscussionHeader
                discussion={discussion}
                onChange={(d) => {
                  setDiscussion(d);
                  setBuildingId(d?.building_id ?? null);
                }}
                onBack={handleBack}
              />
              <div className="disc-two-col">
                <DiscussionMessages discussion={discussion} />
                <DiscussionPollAndVotes
                  discussion={discussion}
                  onChange={(d) => {
                    setDiscussion(d);
                    setBuildingId(d?.building_id ?? null);
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="right-col">
          <BuildingMapPanel buildingId={buildingId} />
        </div>
      </main>
    </>
  );
}

/* HEADER + META + PARTICIPANTS */

function DiscussionHeader({ discussion, onChange, onBack }) {
  const auth = getAuth();

  const canModerate = !!discussion.canModerate;
  const canViewContent = discussion.canViewContent !== false;
  const isPrivate = !!discussion.isPrivate;

  async function changeStatus(action) {
    const url = `/api/discussions/${discussion.id}/${action}`;
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: "Bearer " + auth.token },
      });

      if (res.ok) {
        const d = await fetch(`/api/discussions/${discussion.id}`, {
          headers: { Authorization: "Bearer " + auth.token },
        }).then((r) => r.json());
        onChange(d);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const created = discussion.createdAt
    ? new Date(discussion.createdAt).toLocaleString()
    : "";

  return (
    <section className="card" id="discussionCard">
      <div className="card-header">
        <h1 id="title">{discussion.title || "Rasprava"}</h1>

        <div className="header-actions">
          <button className="btn" type="button" onClick={onBack}>
            ⟵ Natrag
          </button>

          {canModerate && (
            <>
              <button
                id="closeBtn"
                className="btn"
                type="button"
                style={{ display: discussion.status === "open" ? "" : "none" }}
                onClick={() => changeStatus("close")}
              >
                Zatvori raspravu
              </button>

              <button
                id="openBtn"
                className="btn"
                type="button"
                style={{ display: discussion.status === "open" ? "none" : "" }}
                onClick={() => changeStatus("open")}
              >
                Otvori raspravu
              </button>
            </>
          )}
        </div>
      </div>


      <div className="meta muted" id="meta" style={{ marginTop: 4 }}>
        <span className="badge">{(discussion.status || "open").toUpperCase()}</span>{" "}
        {isPrivate ? (
          <span className="badge badge-private">Privatna rasprava</span>
        ) : (
          <span className="badge badge-public">Javna rasprava</span>
        )}{" "}
        <span className="muted">
          Inicijator: {escapeHtml(discussion.ownerName || "(nepoznat)")}
        </span>{" "}
        {created && <span className="muted">{created}</span>}
      </div>

      {isPrivate && (
        <DiscussionParticipants discussion={discussion} onChange={onChange} />
      )}

      <p id="body" style={{ marginTop: 10 }}>
        {canViewContent && discussion.status !== "deleted"
          ? discussion.body || ""
          : "Ovo je privatna rasprava. Nemate pristup sadržaju."}
      </p>

      <hr
        style={{
          margin: "14px 0",
          border: "none",
          borderTop: "1px solid #e5e7eb",
        }}
      />
    </section>
  );
}

function DiscussionParticipants({ discussion, onChange }) {
  const auth = getAuth();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState("");

  const participants = discussion.participants || [];
  const addable = discussion.addableMembers || [];

  async function addParticipant() {
    if (!selected) return;
    setSaving(true);
    setMsg("");

    try {
      const newList = [...participants.map((p) => p.userId), selected];

      const res = await fetch(`/api/discussions/${discussion.id}/participants`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ participants: newList }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(out.error || "Greška pri spremanju sudionika.");
        return;
      }

      const res2 = await fetch(`/api/discussions/${discussion.id}`, {
        headers: { Authorization: "Bearer " + auth.token },
      });

      const d2 = await res2.json().catch(() => ({}));
      if (res2.ok) {
        onChange(d2);
        setSelected("");
      }
    } catch (err) {
      console.error(err);
      setMsg("Greška u komunikaciji.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 6 }}>
      <strong>Sudionici:</strong>
      <ul style={{ margin: "4px 0 0 18px" }}>
        {participants.length ? (
          participants.map((p) => (
            <li key={p.userId || p.name}>{escapeHtml(p.name || p.userId)}</li>
          ))
        ) : (
          <li>(još nema dodanih sudionika)</li>
        )}
      </ul>

      {discussion.status === "open" && addable.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <label className="muted" style={{ display: "block", marginBottom: 4 }}>
            Dodaj sudionika:
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            <select
              style={{ flex: 1, padding: "4px 6px" }}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Odaberite…</option>
              {addable.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {escapeHtml(m.name)}
                  {m.roleInBuilding ? ` (${m.roleInBuilding})` : ""}
                </option>
              ))}
            </select>

            <button
              className="btn"
              type="button"
              onClick={addParticipant}
              disabled={saving || !selected}
            >
              Dodaj
            </button>
          </div>

          <div className="muted" style={{ marginTop: 4 }}>
            {msg}
          </div>
        </div>
      )}
    </div>
  );
}

/* MESSAGES */

function DiscussionMessages({ discussion }) {
  const auth = getAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptyMsg, setEmptyMsg] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  const canViewContent = discussion.canViewContent !== false;
  const isClosed = discussion.status === "closed";

  useEffect(() => {
    async function load() {
      if (!canViewContent) {
        setMessages([]);
        setEmptyMsg("Nema poruka ili nemate pristup.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setEmptyMsg("");

      try {
        const res = await fetch(`/api/discussions/${discussion.id}/messages`, {
          headers: { Authorization: "Bearer " + auth.token },
        });

        const data = await res.json().catch(() => []);

        if (!res.ok) {
          setMessages([]);
          setEmptyMsg(data.error || "Nema poruka ili nemate pristup.");
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          setMessages([]);
          setEmptyMsg("Nema poruka.");
          return;
        }

        setMessages(data);
        setEmptyMsg("");
      } catch (err) {
        console.error(err);
        setMessages([]);
        setEmptyMsg("Greška u komunikaciji.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [discussion.id, discussion.canViewContent, discussion.status, auth.token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isClosed) {
      setStatus("Rasprava je zatvorena.");
      return;
    }

    const text = body.trim();
    if (!text) return;

    setStatus("Slanje…");

    try {
      const res = await fetch(`/api/discussions/${discussion.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ body: text }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(out.error || "Greška.");
        return;
      }

      setBody("");
      setStatus("");

      const res2 = await fetch(`/api/discussions/${discussion.id}/messages`, {
        headers: { Authorization: "Bearer " + auth.token },
      });

      const data2 = await res2.json().catch(() => []);
      if (res2.ok && Array.isArray(data2)) {
        setMessages(data2);
        setEmptyMsg(data2.length ? "" : "Nema poruka.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Greška u komunikaciji.");
    }
  }

  return (
    <section className="card">
      <h3>Poruke</h3>

      <div className="messages" id="messages">
        {loading && <div className="muted">Učitavam…</div>}

        {!loading && messages.length === 0 && (
          <div id="msgEmpty" className="muted">
            {emptyMsg}
          </div>
        )}

        {!loading &&
          messages.length > 0 &&
          messages.map((m) => {
            const author = m.authorName || m.authorEmail || m.authorId || "—";
            return (
              <div className="msg-row" key={m.id || m.createdAt}>
                <div className="msg-head">
                  <strong>{escapeHtml(author)}</strong>
                  <span className="muted">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                <div>{escapeHtml(m.body || "")}</div>
              </div>
            );
          })}
      </div>

      {canViewContent && !isClosed && (
        <form id="msgForm" style={{ marginTop: 12 }} onSubmit={handleSubmit}>
          <textarea
            id="msgBody"
            placeholder="Napišite poruku..."
            style={{ width: "100%", minHeight: 60 }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <div id="msgStatus" className="muted">
              {status}
            </div>
            <button type="submit" className="btn primary">
              Pošalji
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function DiscussionPollAndVotes({ discussion, onChange }) {
    const auth = getAuth();

    const [question, setQuestion] = useState("");
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const pollActive = discussion.poll && discussion.poll.active !== false;
    const closed = discussion.status === "closed";
    const canModerate = !!discussion.canModerate;
    const canViewContent = discussion.canViewContent !== false;

    // Load votes summary
    useEffect(() => {
        async function load() {
            if (!discussion.id || !discussion.poll) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`/api/polls/${discussion.poll.id}/vote-summary`, {
                    headers: { Authorization: "Bearer " + auth.token },
                });
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setSummary({ error: data.error });
                } else {
                    setSummary(data);
                }
            } catch (err) {
                console.error(err);
                setSummary({ error: "Greška u komunikaciji." });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [discussion.id, discussion.poll]);

    async function createPoll() {
        const q = question.trim();
        if (!q) return;
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/poll`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({ question: q }),
            });
            const out = await res.json().catch(() => ({}));
            if (res.ok) {
                setQuestion("");
                const d = await fetch(`/api/discussions/${discussion.id}`, {
                    headers: { Authorization: "Bearer " + auth.token },
                }).then((r) => r.json());
                onChange(d);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function deletePoll() {
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/poll`, {
                method: "DELETE",
                headers: { Authorization: "Bearer " + auth.token },
            });
            if (res.ok) {
                const d = await fetch(`/api/discussions/${discussion.id}`, {
                    headers: { Authorization: "Bearer " + auth.token },
                }).then((r) => r.json());
                onChange(d);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function castVote(value) {
        const user = auth.user;
        if (user && user.role === "admin") return;
        if (!discussion.poll || !discussion.poll.id) {
            console.error("No active poll");
            return;
        }
        try {
            const res = await fetch(`/api/polls/${discussion.poll.id}/vote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({ value }),
            });

            if (!res.ok) {
                console.error("Vote failed");
                return;
            }

            // reload summary
            const res2 = await fetch(`/api/polls/${discussion.poll.id}/vote-summary`, {
                headers: { Authorization: "Bearer " + auth.token },
            });
            const data = await res2.json().catch(() => ({}));
            if (res2.ok) setSummary(data);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <section className="card" id="voteCard">
            <h3>Glasanje</h3>

            {/* Poll create / question */}
            {canViewContent ? (
                <>
                    {/* Create box */}
                    {!pollActive && !closed && canModerate && (
                        <div id="pollCreateBox" style={{ marginTop: 8 }}>
                            <label htmlFor="pollInput" className="muted">
                                Pitanje:
                            </label>
                            <input
                                id="pollInput"
                                type="text"
                                style={{
                                    width: "100%",
                                    padding: 6,
                                    marginTop: 4,
                                }}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                            <button
                                id="pollCreateBtn"
                                className="btn primary"
                                type="button"
                                style={{ marginTop: 6 }}
                                onClick={createPoll}
                            >
                                Pokreni anketu
                            </button>
                        </div>
                    )}

                    {/* Question box */}
                    {pollActive && (
                        <div
                            id="pollQuestionBox"
                            className="muted"
                            style={{ marginTop: 8 }}
                        >
                            {discussion.poll?.question || ""}
                        </div>
                    )}

                    {/* Delete button */}
                    {pollActive && !closed && canModerate && (
                        <button
                            id="pollDeleteBtn"
                            className="btn"
                            type="button"
                            style={{ marginTop: 6 }}
                            onClick={deletePoll}
                        >
                            Obriši anketu
                        </button>
                    )}
                </>
            ) : null}

            {/* Votes summary */}
            <div id="voteInfo" className="muted" style={{ marginTop: 10 }}>
                {loading
                    ? "Učitavam…"
                    : !pollActive
                    ? "Nema aktivne ankete."
                    : summary?.error
                    ? summary.error
                    : "Sažetak glasanja:"}
            </div>

            {pollActive && !summary?.error && (
                <>
                    <div style={{ margin: "8px 0" }}>
                        <span id="yesCount" className="badge">
                            DA: {summary?.yes || 0}
                        </span>{" "}
                        <span id="noCount" className="badge">
                            NE: {summary?.no || 0}
                        </span>{" "}
                        <span id="totalVotes" className="badge">
                            Glasovi: {summary?.total || 0}
                        </span>
                    </div>

                    <div id="threshold" className="muted" style={{ marginBottom: 8 }}>
                        {summary?.thresholdReached
                            ? "✅ Prag dosegnut."
                            : `ℹ️ Prag nije dosegnut. (Suvlasnika: ${
                                  summary?.totalOwners || 0
                              })`}
                    </div>

                    {!closed && (
                        <div style={{ display: "flex", gap: 8 }}>
                            {auth.user?.role !== "admin" && (
                                <>
                                    <button
                                        id="voteYes"
                                        className={
                                            "btn" +
                                            (summary?.currentUserVote === "yes"
                                                ? " active"
                                                : "")
                                        }
                                        type="button"
                                        onClick={() => castVote("yes")}
                                    >
                                        Glasaj DA
                                    </button>
                                    <button
                                        id="voteNo"
                                        className={
                                            "btn" +
                                            (summary?.currentUserVote === "no"
                                                ? " active"
                                                : "")
                                        }
                                        type="button"
                                        onClick={() => castVote("no")}
                                    >
                                        Glasaj NE
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}