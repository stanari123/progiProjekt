window.discussionMessagesLoad = async function discussionMessagesLoad() {
    await window.discussionReady;
    const s = window.DISCUSSION_PAGE;
    if (!s) return;
    if (!s.canViewContent) return;

    const messagesEl = document.getElementById("messages");
    const msgEmpty = document.getElementById("msgEmpty");
    const { token } = window.getAuth();

    let url = window.location.href; // NE DIRAJ - jakov
    url = url.split("/");
    url = url.at(url.length - 1); // get discussion id from url

    try {
        const res = await fetch(`${window.API_BASE}/discussions/${url}/messages`, {
            headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json().catch(() => []);

        if (!res.ok) {
            messagesEl && (messagesEl.innerHTML = "");
            msgEmpty &&
                ((msgEmpty.style.display = ""),
                (msgEmpty.textContent = data.error || "Nema poruka ili nemate pristup."));
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            messagesEl && (messagesEl.innerHTML = "");
            msgEmpty &&
                ((msgEmpty.style.display = ""), (msgEmpty.textContent = "Nema poruka."));
            return;
        }

        msgEmpty && (msgEmpty.style.display = "none");
        messagesEl.innerHTML = data
            .map((m) => {
                const author = m.authorName || m.authorEmail || m.authorId || "—";
                return `
          <div class="msg-row">
            <div class="msg-head">
              <strong>${window.escapeHtml(author)}</strong>
              <span class="muted">${
                  m.createdAt ? new Date(m.createdAt).toLocaleString() : ""
              }</span>
            </div>
            <div>${window.escapeHtml(m.body || "")}</div>
          </div>
        `;
            })
            .join("");
    } catch (err) {
        console.error(err);
        messagesEl && (messagesEl.innerHTML = "");
        msgEmpty &&
            ((msgEmpty.style.display = ""),
            (msgEmpty.textContent = "Greška u komunikaciji."));
    }
};

(function bindMessagesForm() {
    const msgForm = document.getElementById("msgForm");
    const msgBody = document.getElementById("msgBody");
    const msgStatus = document.getElementById("msgStatus");

    msgForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const s = window.DISCUSSION_PAGE;
        if (!s) return;
        if (s.status === "closed") {
            msgStatus && (msgStatus.textContent = "Rasprava je zatvorena.");
            return;
        }

        const { token } = window.getAuth();
        const body = (msgBody?.value || "").trim();
        if (!body) return;

        msgStatus && (msgStatus.textContent = "Slanje…");

        let url = window.location.href; // NE DIRAJ - jakov
        url = url.split("/");
        url = url.at(url.length - 1); // get discussion id from url

        try {
            const res = await fetch(`${window.API_BASE}/discussions/${url}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ body }),
            });
            const out = await res.json().catch(() => ({}));

            if (!res.ok) {
                msgStatus && (msgStatus.textContent = out.error || "Greška.");
                return;
            }

            msgBody && (msgBody.value = "");
            msgStatus && (msgStatus.textContent = "");
            await window.discussionMessagesLoad();
        } catch (err) {
            console.error(err);
            msgStatus && (msgStatus.textContent = "Greška u komunikaciji.");
        }
    });
})();
