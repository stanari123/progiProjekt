window.discussionVotesLoad = async function discussionVotesLoad() {
    await window.discussionReady;

    const s = window.DISCUSSION_PAGE;
    if (!s) return;
    const { token, user } = window.getAuth();

    const voteInfo = document.getElementById("voteInfo");
    const yesCount = document.getElementById("yesCount");
    const noCount = document.getElementById("noCount");
    const totalVotes = document.getElementById("totalVotes");
    const thresholdEl = document.getElementById("threshold");
    const voteYesBtn = document.getElementById("voteYes");
    const voteNoBtn = document.getElementById("voteNo");

    function setBtns(show) {
        if (voteYesBtn) voteYesBtn.style.display = show ? "" : "none";
        if (voteNoBtn) voteNoBtn.style.display = show ? "" : "none";
    }

    // voteInfo && (voteInfo.textContent = "Učitavam…");

    const pollActive = s.poll && s.poll.active !== false;
    const closed = s.status === "closed";

    if (!pollActive) {
        voteInfo && (voteInfo.textContent = "Nema aktivne ankete.");
        setBtns(false);
        yesCount && (yesCount.style.display = "none");
        noCount && (noCount.style.display = "none");
        totalVotes && (totalVotes.style.display = "none");
        thresholdEl && (thresholdEl.style.display = "none");
        return;
    }

    try {
        const res = await fetch(`${window.API_BASE}/polls/${s.poll.id}/vote-summary`, {
            headers: { Authorization: "Bearer " + token },
        });
        const summary = await res.json().catch(() => ({}));

        if (!res.ok) {
            voteInfo &&
                (voteInfo.textContent =
                    summary.error || "Greška pri dohvaćanju glasanja.");
            setBtns(false);
            return;
        }

        yesCount &&
            ((yesCount.style.display = ""),
            (yesCount.textContent = `DA: ${summary.yes || 0}`));
        noCount &&
            ((noCount.style.display = ""),
            (noCount.textContent = `NE: ${summary.no || 0}`));
        totalVotes &&
            ((totalVotes.style.display = ""),
            (totalVotes.textContent = `Glasovi: ${summary.total || 0}`));
        thresholdEl &&
            ((thresholdEl.style.display = ""),
            (thresholdEl.textContent = summary.thresholdReached
                ? "✅ Prag dosegnut."
                : `ℹ️ Prag nije dosegnut. (Suvlasnika: ${summary.totalOwners || 0})`));

        if (closed) {
            voteInfo &&
                (voteInfo.textContent = "Anketa je aktivna, ali rasprava je zatvorena.");
            setBtns(false);
            return;
        }

        const isAdmin = user && user.role === "admin";
        setBtns(!isAdmin);

        voteYesBtn &&
            voteYesBtn.classList.toggle("active", summary.currentUserVote === "yes");
        voteNoBtn &&
            voteNoBtn.classList.toggle("active", summary.currentUserVote === "no");

        // voteInfo && (voteInfo.textContent = "Sažetak glasanja:");
    } catch (err) {
        console.error(err);
        voteInfo && (voteInfo.textContent = "Greška u komunikaciji.");
        setBtns(false);
    }
};

(function bindVoteButtons() {
    const voteYesBtn = document.getElementById("voteYes");
    const voteNoBtn = document.getElementById("voteNo");

    async function cast(value) {
        const s = window.DISCUSSION_PAGE;
        const { token, user } = window.getAuth();
        if (!s || !s.poll) return;
        if (user && user.role === "admin") return;

        const voteInfo = document.getElementById("voteInfo");

        try {
            // if (voteInfo) voteInfo.textContent = "Šaljem glas...";

            const res = await fetch(`${window.API_BASE}/polls/${s.poll.id}/vote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ value }),
            });

            const result = await res.json().catch(() => ({}));

            if (!res.ok) {
                console.error("Vote failed:", result);
                if (voteInfo)
                    voteInfo.textContent = result.error || "Greška pri glasanju.";
                return;
            }

            console.log("Vote cast successfully:", result);
            await window.discussionVotesLoad();
        } catch (err) {
            console.error("Error casting vote:", err);
            if (voteInfo) voteInfo.textContent = "Greška u komunikaciji.";
        }
    }

    voteYesBtn?.addEventListener("click", () => cast("yes"));
    voteNoBtn?.addEventListener("click", () => cast("no"));
})();

let voteRefreshInterval = null;

window.startVoteAutoRefresh = function () {
    if (voteRefreshInterval) {
        clearInterval(voteRefreshInterval);
    }

    voteRefreshInterval = setInterval(async () => {
        const s = window.DISCUSSION_PAGE;
        if (s && s.poll && s.poll.active !== false && s.status !== "closed") {
            await window.discussionVotesLoad();
        }
    }, 5000); // Refresh every 5 seconds
};

window.stopVoteAutoRefresh = function () {
    if (voteRefreshInterval) {
        clearInterval(voteRefreshInterval);
        voteRefreshInterval = null;
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => window.startVoteAutoRefresh(), 1000);
    });
} else {
    setTimeout(() => window.startVoteAutoRefresh(), 1000);
}
