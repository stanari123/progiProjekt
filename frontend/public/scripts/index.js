const discList = document.getElementById("discList");
const discFeedback = document.getElementById("discFeedback");

const newDiscBtn = document.getElementById("newDiscBtn");
const newDiscForm = document.getElementById("newDiscForm");
const cancelDiscBtn = document.getElementById("cancelDiscBtn");
const newDiscTitle = document.getElementById("newDiscTitle");
const newDiscBody = document.getElementById("newDiscBody");
const newDiscPrivate = document.getElementById("newDiscPrivate");
const newDiscMsg = document.getElementById("newDiscMsg");

async function loadDiscussionsFor(buildingId) {
    if (!discList || !discFeedback) return;

    discFeedback.textContent = "";
    discList.innerHTML = "";

    const { token } = window.getAuth();
    if (!token) {
        discFeedback.textContent = "Prijavite se za prikaz rasprava.";
        return;
    }

    if (!buildingId) {
        discFeedback.textContent = "Odaberite zgradu.";
        return;
    }

    try {
        const res = await fetch(
            `${window.API_BASE}/discussions?buildingId=${encodeURIComponent(buildingId)}`,
            {
                headers: { Authorization: "Bearer " + token },
            }
        );
        const data = await res.json().catch(() => []);

        if (!res.ok) {
            discFeedback.textContent = data?.error || "Greška pri dohvaćanju rasprava.";
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            discFeedback.textContent = "Nema rasprava.";
            return;
        }

        const publicOnes = [];
        const privateYes = [];
        const privateNo = [];

        for (const d of data) {
            if (!d) continue;
            if (d.visibility === "javno") publicOnes.push(d);
            else if (d.canViewContent === false) privateNo.push(d);
            else privateYes.push(d);
        }

        function renderGroup(title, list, muted = false) {
            if (!list.length) return "";
            return `
        <h3 style="margin-top:18px;">${title}</h3>
        ${list
            .map(
                (d) => `
          <article
            class="card discussion-card ${muted ? "disc-muted" : ""}"
            data-id="${d.id}"
            data-private="${d.visibility === "privatno"}"
            data-canview="${d.canViewContent}"
          >
            <h4>${window.escapeHtml(d.title || "Bez naslova")}</h4>
            ${
                (d.visibility === "javno" || d.canViewContent) && d.poll_description
                    ? `<p>${window.escapeHtml(d.poll_description)}</p>`
                    : ``
            }
            <div class="muted">
              ${window.escapeHtml(d.ownerName || d.ownerEmail || "#" + d.id)}
              ${d.created_at ? " · " + new Date(d.created_at).toLocaleString() : ""}
              ${d.status ? " · " + d.status.toUpperCase() : ""}
              ${d.visibility === "privatno" ? " · 🔒 Privatna" : ""}
            </div>
          </article>
        `
            )
            .join("")}
      `;
        }

        discList.innerHTML =
            renderGroup("🔹 Javne rasprave", publicOnes) +
            renderGroup("🔒 Privatne (dostupne vama)", privateYes) +
            renderGroup("🚫 Privatne (nedostupne)", privateNo, true);

        discList.querySelectorAll(".discussion-card").forEach((card) => {
            const id = card.getAttribute("data-id");
            const isPriv = card.getAttribute("data-private") === "true";
            const canView = card.getAttribute("data-canview");

            if (isPriv && canView === "false") {
                card.style.cursor = "not-allowed";
                return;
            }
            card.addEventListener("click", () => {
                window.location.href = `/discussions/${id}`;
            });
        });
    } catch (err) {
        console.error(err);
        discFeedback.textContent = "Greška u komunikaciji.";
    }
}

function updateNewButtonVisibility() {
    const { token } = window.getAuth();
    if (!newDiscBtn) return;
    newDiscBtn.style.display = token ? "" : "none";
}

newDiscBtn?.addEventListener("click", () => {
    if (!newDiscForm) return;
    newDiscForm.style.display = "block";
    newDiscBtn.style.display = "none";
});

cancelDiscBtn?.addEventListener("click", () => {
    if (!newDiscForm) return;
    newDiscForm.reset();
    newDiscForm.style.display = "none";
    updateNewButtonVisibility();
});

newDiscForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { token } = window.getAuth();
    if (!token) return;

    const buildingSel = document.getElementById("buildingSel");
    const buildingId = buildingSel?.value;
    const title = newDiscTitle?.value.trim();
    const body = newDiscBody?.value.trim();
    const isPrivate = !!newDiscPrivate?.checked;

    if (!title) {
        if (newDiscMsg) newDiscMsg.textContent = "Unesite naslov rasprave.";
        return;
    }

    try {
        const res = await fetch(`${window.API_BASE}/discussions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ title, body, isPrivate, buildingId }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            if (newDiscMsg)
                newDiscMsg.textContent = data.error || "Greška pri stvaranju rasprave.";
            return;
        }

        newDiscForm.reset();
        newDiscForm.style.display = "none";
        updateNewButtonVisibility();

        await loadDiscussionsFor(buildingId);
    } catch (err) {
        console.error(err);
        if (newDiscMsg) newDiscMsg.textContent = "Greška u komunikaciji.";
    }
});

// INIT
(async function initIndex() {
    await window.sidebar.loadBuildings({
        afterLoad: (bid) => {
            if (bid) {
                loadDiscussionsFor(bid);
            } else {
                loadDiscussionsFor(null);
            }
        },
    });
    updateNewButtonVisibility();
})();
