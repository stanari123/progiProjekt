import { useEffect, useState } from "react";
import "../index.css";
import { getAuth } from "../utils/auth";
import { escapeHtml } from "../utils/escapeHtml";
import { loadMembers } from "../services/buildings";

export default function DiscussionList({ buildingId }) {
    const [discussions, setDiscussions] = useState([]);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [newPrivate, setNewPrivate] = useState(false);
    const [newMsg, setNewMsg] = useState("");
    const [members, setMembers] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);

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
    }, [buildingId, auth.token]);

    // Refetch discussions when page becomes visible (user navigates back)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && buildingId && auth.token) {
                loadDiscussions(buildingId);
            }
        };

        const handleFocus = () => {
            if (buildingId && auth.token) {
                loadDiscussions(buildingId);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
        };
    }, [buildingId, auth.token]);

    async function loadDiscussions(bid) {
        setLoading(true);
        setFeedback("");
        setDiscussions([]);

        try {
            const res = await fetch(
                `/api/discussions?buildingId=${encodeURIComponent(bid)}`,
                { headers: { Authorization: "Bearer " + auth.token } },
            );

            const data = await res.json().catch(() => []);

            if (!res.ok) {
                setFeedback(data?.error || "Greška pri dohvaćanju rasprava.");
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

    useEffect(() => {
        async function run() {
            try {
                if (!newPrivate || !buildingId || !auth.token) {
                    setMembers([]);
                    setSelectedParticipants([]);
                    return;
                }

                const list = await loadMembers(buildingId);
                const myFirst = (auth.user?.firstName || "").trim();
                const myLast = (auth.user?.lastName || "").trim();
                const myFull = [myFirst, myLast]
                    .filter(Boolean)
                    .join(" ")
                    .trim()
                    .toLowerCase();

                const filtered = Array.isArray(list)
                    ? list
                        .map((m) => ({
                            id: m.id,
                            name: [m.firstName, m.lastName].filter(Boolean).join(" ").trim(),
                            roleInBuilding: (m.roleInBuilding || "").toLowerCase(),
                        }))
                        .filter((m) => (myFull ? m.name.toLowerCase() !== myFull : true))
                        .filter((m) => m.roleInBuilding !== "admin")
                    : [];

                setMembers(filtered);
                setSelectedParticipants((prev) =>
                    prev.filter((n) => filtered.some((m) => m.name === n)),
                );
            } catch (e) {
                console.error("Greška pri dohvaćanju članova zgrade:", e);
                setMembers([]);
                setSelectedParticipants([]);
            }
        }

        run();
    }, [newPrivate, buildingId, auth.token]);

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
            const res = await fetch(`/api/discussions`, {
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
                    ...(newPrivate && selectedParticipants.length
                        ? { participants: selectedParticipants }
                        : {}),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setNewMsg(data?.error || "Greška pri stvaranju rasprave.");
                return;
            }

            // Reset form
            setNewTitle("");
            setNewBody("");
            setNewPrivate(false);
            setMembers([]);
            setSelectedParticipants([]);
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
                <h2>Oglasna ploča</h2>
                <div className="header-actions">
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
            </div>

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

                    {newPrivate && (
                        <div style={{ marginTop: "12px" }}>
                            <div style={{ marginBottom: 6, fontWeight: 600 }}>
                                Dodaj članove u privatnu raspravu
                                {selectedParticipants.length > 0 && (
                                    <span style={{ marginLeft: 8, color: "#6366f1" }}>
                                        ({selectedParticipants.length})
                                    </span>
                                )}
                            </div>

                            <div className="muted" style={{ marginBottom: 12 }}>
                                Inicijator rasprave je automatski uključen i nije
                                prikazan.
                            </div>

                            {members.length === 0 ? (
                                <div className="muted">
                                    Nema dostupnih članova za dodati.
                                </div>
                            ) : (
                                <div
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "6px",
                                        maxHeight: "240px",
                                        overflowY: "auto",
                                        padding: "8px",
                                    }}
                                >
                                    {members.map((m) => {
                                        const isSelected = selectedParticipants.includes(
                                            m.name,
                                        );
                                        return (
                                            <label
                                                key={m.name}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    padding: "8px",
                                                    backgroundColor: isSelected
                                                        ? "#eef2ff"
                                                        : "transparent",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    marginBottom: "4px",
                                                    transition: "background-color 0.2s",
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        isSelected
                                                            ? "#e0e7ff"
                                                            : "#f9fafb")
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        isSelected
                                                            ? "#eef2ff"
                                                            : "transparent")
                                                }
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedParticipants([
                                                                ...selectedParticipants,
                                                                m.name,
                                                            ]);
                                                        } else {
                                                            setSelectedParticipants(
                                                                selectedParticipants.filter(
                                                                    (n) => n !== m.name,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                    style={{
                                                        marginRight: "8px",
                                                        cursor: "pointer",
                                                    }}
                                                />

                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 500 }}>
                                                        {m.name}
                                                    </div>
                                                    {m.roleInBuilding && (
                                                        <div
                                                            className="muted"
                                                            style={{ fontSize: "0.85em" }}
                                                        >
                                                            {m.roleInBuilding}
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

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
                                <h3 style={{ marginTop: "18px" }}>🌐 Javne rasprave</h3>
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

    const isLocked = isPrivate && !canView;

    const statusLabel = data.status ? String(data.status).toUpperCase() : "";

    const handleClick = () => {
        if (isLocked) return;
        window.location.href = `/discussions/${data.id}`;
    };

    return (
        <article
            className={`card discussion-card ${muted ? "disc-muted" : ""}`}
            onClick={handleClick}
            aria-disabled={isLocked}
            style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
        >
            <h4>{escapeHtml(data.title || "Bez naslova")}</h4>

            {(data.visibility === "javno" || canView) && data.poll_description && (
                <p>{escapeHtml(data.poll_description)}</p>
            )}

            {isLocked && (
                <p className="muted" style={{ marginTop: 6 }}>
                    🔒 Privatna rasprava — nemate pristup sadržaju.
                </p>
            )}

            <div className="muted">
                {escapeHtml(data.ownerName || data.ownerEmail || "#" + data.id)}
                {data.created_at
                    ? " · " + new Date(data.created_at).toLocaleString()
                    : ""}
                {statusLabel ? " · " + statusLabel : ""}
                {isPrivate ? " · 🔒 Privatna" : " · 🌐 Javna"}
                {isLocked ? " · 🚫 Nedostupna" : ""}
            </div>
        </article>
    );
}
