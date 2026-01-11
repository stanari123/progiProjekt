window.DISCUSSION_PAGE = {
    id: null,
    buildingId: null,
    status: "open",
    canModerate: false,
    canViewContent: true,
    poll: null,
    participants: [],
    addableMembers: [],
    ownerId: null,
    ownerName: "",
    isPrivate: false,
    createdAt: null,
    title: "",
    body: "",
};

function getDiscussionIdFromUrl() {
    const qsId = new URLSearchParams(location.search).get("id");
    if (qsId) return qsId;
    const card = document.getElementById("discussionCard");
    const dataId = card?.dataset?.discussionId;
    if (dataId) return dataId;
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1];
}

async function apiFetchDiscussion(id, token) {
    const res = await fetch(`${window.API_BASE}/discussions/${id}`, {
        headers: { Authorization: "Bearer " + token },
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error || "Ne mogu dohvatiti diskusiju");
    return d;
}

function renderDiscussionUI() {
    const s = window.DISCUSSION_PAGE;
    const titleEl = document.getElementById("title");
    const bodyEl = document.getElementById("body");
    const metaEl = document.getElementById("meta");
    const msgForm = document.getElementById("msgForm");
    const closeBtn = document.getElementById("closeBtn");
    const openBtn = document.getElementById("openBtn");
    const buildingSel = document.getElementById("buildingSel");

    titleEl && (titleEl.textContent = s.title || "Rasprava");

    if (metaEl) {
        const typeLabel = s.isPrivate
            ? '<span class="badge badge-private">Privatna rasprava</span>'
            : '<span class="badge badge-public">Javna rasprava</span>';
        const created = s.createdAt ? new Date(s.createdAt).toLocaleString() : "";

        metaEl.innerHTML = `
      <span class="badge">${(s.status || "open").toUpperCase()}</span>
      ${typeLabel}
      <span class="muted">Inicijator: ${window.escapeHtml(
          s.ownerName || "(nepoznat)"
      )}</span>
      ${created ? `<span class="muted">${created}</span>` : ""}
    `;

        if (s.isPrivate && !document.getElementById("participantsHook")) {
            const hook = document.createElement("div");
            hook.id = "participantsHook";
            hook.style.marginTop = "6px";
            metaEl.appendChild(hook);
        }
    }

    if (bodyEl) {
        bodyEl.textContent =
            s.canViewContent && s.status !== "deleted"
                ? s.body || "…"
                : "Ovo je privatna rasprava. Nemate pristup sadržaju.";
    }

    if (s.canModerate) {
        const isOpen = s.status === "open";
        closeBtn && (closeBtn.style.display = isOpen ? "" : "none");
        openBtn && (openBtn.style.display = isOpen ? "none" : "");
    } else {
        closeBtn && (closeBtn.style.display = "none");
        openBtn && (openBtn.style.display = "none");
    }

    const isClosed = s.status === "closed";
    if (!s.canViewContent || isClosed) {
        msgForm && (msgForm.style.display = "none");
    } else {
        msgForm && (msgForm.style.display = "");
    }

    if (buildingSel) {
        buildingSel.disabled = true;
        if (s.buildingId) buildingSel.value = s.buildingId;
    }

    window.discussionParticipantsRender && window.discussionParticipantsRender();
    window.discussionPollRender && window.discussionPollRender();
    window.discussionMessagesLoad && window.discussionMessagesLoad();
    window.discussionVotesLoad && window.discussionVotesLoad();
}

async function loadDiscussion() {
    const { token } = window.getAuth();
    const id = getDiscussionIdFromUrl();
    if (!id || id === "undefined") {
        console.error("Missing discussion id in URL");
        return;
    }

    const data = await apiFetchDiscussion(id, token);

    Object.assign(window.DISCUSSION_PAGE, {
        id: data.id,
        buildingId: data.buildingId,
        status: data.status || "open",
        canModerate: !!data.canModerate,
        canViewContent: data.canViewContent !== false,
        poll: data.poll || null,
        participants: Array.isArray(data.participants) ? data.participants : [],
        addableMembers: Array.isArray(data.addableMembers) ? data.addableMembers : [],
        ownerId: data.ownerId || null,
        ownerName: data.ownerName || "",
        isPrivate: !!data.isPrivate,
        createdAt: data.createdAt || null,
        title: data.title || "",
        body: data.body || "",
    });

    if (window.sidebar?.loadMembers && data.buildingId) {
        await window.sidebar.loadMembers(data.buildingId);
    }

    renderDiscussionUI();
}

async function closeDiscussion() {
    const { token } = window.getAuth();
    const id = window.DISCUSSION_PAGE.id;
    const res = await fetch(`${window.API_BASE}/discussions/${id}/close`, {
        method: "PATCH",
        headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
        await loadDiscussion();
    }
}

async function openDiscussion() {
    const { token } = window.getAuth();
    const id = window.DISCUSSION_PAGE.id;
    const res = await fetch(`${window.API_BASE}/discussions/${id}/open`, {
        method: "PATCH",
        headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
        await loadDiscussion();
    }
}

(function bindCore() {
    const closeBtn = document.getElementById("closeBtn");
    const openBtn = document.getElementById("openBtn");

    closeBtn?.addEventListener("click", closeDiscussion);
    openBtn?.addEventListener("click", openDiscussion);
})();

window.discussionReady = (async function initDiscussionCore() {
    if (window.sidebar?.loadBuildings) {
        await window.sidebar.loadBuildings();
    }
    await loadDiscussion(); // ovo fetch-a raspravu
    const buildingSel = document.getElementById("buildingSel");
    if (buildingSel) buildingSel.disabled = true;
})();
