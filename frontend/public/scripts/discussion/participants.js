window.discussionParticipantsRender = function discussionParticipantsRender() {
  const s = window.DISCUSSION_PAGE;
  if (!s) return;
  if (!s.buildingId) return;

  const hook = document.getElementById("participantsHook");
  if (!hook) return;

  const current = s.participants || [];
  const listHtml = current.length
    ? current.map((p) => `<li>${window.escapeHtml(p.name || p.userId)}</li>`).join("")
    : "<li>(još nema dodanih sudionika)</li>";

  hook.innerHTML = `
    <strong>Sudionici:</strong>
    <ul style="margin:4px 0 0 18px;">${listHtml}</ul>
  `;

  if (s.status !== "open") {
    return;
  }

  const addable = Array.isArray(s.addableMembers) ? s.addableMembers : [];
  if (!addable.length) return;

  const addBox = document.createElement("div");
  addBox.style.marginTop = "6px";

  const options = addable
    .map(
      (m) =>
        `<option value="${m.userId}">${window.escapeHtml(m.name)}${
          m.roleInBuilding ? " (" + m.roleInBuilding + ")" : ""
        }</option>`
    )
    .join("");

  addBox.innerHTML = `
    <label class="muted" style="display:block; margin-bottom:4px;">Dodaj sudionika:</label>
    <div style="display:flex; gap:6px;">
      <select id="addParticipantSel" style="flex:1; padding:4px 6px;">
        ${options}
      </select>
      <button id="addParticipantBtn" class="btn" type="button">Dodaj</button>
    </div>
    <div id="addParticipantMsg" class="muted" style="margin-top:4px;"></div>
  `;

  hook.appendChild(addBox);

  const sel = document.getElementById("addParticipantSel");
  const btn = document.getElementById("addParticipantBtn");
  const msg = document.getElementById("addParticipantMsg");

  btn?.addEventListener("click", async () => {
    const newUserId = sel.value;
    if (!newUserId) return;

    const { token } = window.getAuth();

    const newList = [...current.map((p) => p.userId), newUserId];

    const res = await fetch(
      `${window.API_BASE}/discussions/${s.id}/participants`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ participants: newList }),
      }
    );
    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      msg && (msg.textContent = out.error || "Greška pri spremanju sudionika.");
      return;
    }

    const res2 = await fetch(`${window.API_BASE}/discussions/${s.id}`, {
      headers: { Authorization: "Bearer " + token },
    });
    const d2 = await res2.json().catch(() => ({}));
    if (res2.ok) {
      window.DISCUSSION_PAGE.participants = d2.participants || [];
      window.DISCUSSION_PAGE.addableMembers = d2.addableMembers || [];
      window.discussionParticipantsRender();
    }
  });
};
