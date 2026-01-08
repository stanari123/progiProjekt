window.discussionPollRender = function discussionPollRender() {
    const s = window.DISCUSSION_PAGE;
    if (!s) return;

    const pollCreateBox = document.getElementById("pollCreateBox");
    const pollQuestionBox = document.getElementById("pollQuestionBox");
    const pollDeleteBtn = document.getElementById("pollDeleteBtn");
    const voteInfo = document.getElementById("voteInfo");

    if (!s.canViewContent) {
        pollCreateBox && (pollCreateBox.style.display = "none");
        pollQuestionBox && (pollQuestionBox.style.display = "none");
        pollDeleteBtn && (pollDeleteBtn.style.display = "none");
        return;
    }

    const discussionClosed = s.status === "closed";
    const pollActive = s.poll && s.poll.active !== false;

    if (pollActive) {
        pollQuestionBox && (pollQuestionBox.style.display = "");
        pollQuestionBox && (pollQuestionBox.textContent = s.poll.question || "");
        pollDeleteBtn &&
            (pollDeleteBtn.style.display =
                !discussionClosed && s.canModerate ? "" : "none");
        pollCreateBox && (pollCreateBox.style.display = "none");
        voteInfo && (voteInfo.textContent = "Glasanje je aktivno.");
    } else {
        pollQuestionBox && (pollQuestionBox.style.display = "none");
        pollDeleteBtn && (pollDeleteBtn.style.display = "none");

        if (!discussionClosed && s.canModerate) {
            pollCreateBox && (pollCreateBox.style.display = "");
            voteInfo &&
                (voteInfo.textContent = "Nema aktivne ankete. Postavite pitanje.");
        } else {
            pollCreateBox && (pollCreateBox.style.display = "none");
            voteInfo && (voteInfo.textContent = "Nema aktivne ankete.");
        }
    }
};

(function bindPollActions() {
    const pollCreateBtn = document.getElementById("pollCreateBtn");
    const pollInput = document.getElementById("pollInput");
    const pollDeleteBtn = document.getElementById("pollDeleteBtn");

    pollCreateBtn?.addEventListener("click", async () => {
        const s = window.DISCUSSION_PAGE;
        const { token } = window.getAuth();
        const q = (pollInput?.value || "").trim();
        if (!q) return;

        const res = await fetch(`${window.API_BASE}/discussions/${s.id}/poll`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ question: q }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok) {
            pollInput.value = "";
            s.poll = out.poll || { question: q, active: true };
            window.discussionPollRender();
            window.discussionVotesLoad && window.discussionVotesLoad();
        }
    });

    pollDeleteBtn?.addEventListener("click", async () => {
        const s = window.DISCUSSION_PAGE;
        const { token } = window.getAuth();
        const res = await fetch(`${window.API_BASE}/discussions/${s.id}/poll`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) {
            s.poll = null;
            window.discussionPollRender();
            window.discussionVotesLoad && window.discussionVotesLoad();
        }
    });
})();
