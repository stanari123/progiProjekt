window.API_BASE = "/api";

window.setAuth = function setAuth(token, user) {
  if (!token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } else {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user || null));
  }
};

window.getAuth = function getAuth() {
  try {
    return {
      token: localStorage.getItem("token") || "",
      user: JSON.parse(localStorage.getItem("user") || "null"),
    };
  } catch {
    return { token: "", user: null };
  }
};

window.escapeHtml = function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (s) => (
    {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[s]
  ));
};

window.discussionsUtil = {
  memberDisplay(m = {}) {
    const name = [m.firstName, m.lastName].filter(Boolean).join(" ");
    return name || m.email || m.userId || "(nepoznat)";
  },
};

(function setupProfilePanel() {
  const profilePanel = document.getElementById("profilePanel");
  const profileContent = document.getElementById("profileContent");
  const profileClose = document.getElementById("profileClose");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginLink = document.getElementById("loginLink");
  const profileBtn = document.getElementById("profileBtn");

  function renderProfilePanel() {
    const { user } = window.getAuth();
    if (!profileContent) return;

    if (user) {
      profileContent.innerHTML = `
        <div class="row"><strong>Ime:</strong> ${window.escapeHtml(user.firstName || "")} ${window.escapeHtml(user.lastName || "")}</div>
        <div class="row"><strong>E-pošta:</strong> ${window.escapeHtml(user.email || "")}</div>
        <div class="row"><strong>Uloga:</strong> <span class="badge">${window.escapeHtml(user.role || "vlasnik")}</span></div>
      `;
      logoutBtn && (logoutBtn.style.display = "");
      loginLink && (loginLink.style.display = "none");
    } else {
      profileContent && (profileContent.textContent = "Niste prijavljeni.");
      logoutBtn && (logoutBtn.style.display = "none");
      loginLink && (loginLink.style.display = "");
    }
  }
  window.renderProfilePanel = renderProfilePanel;

  profileBtn?.addEventListener("click", () => {
    renderProfilePanel();
    if (!profilePanel) return;
    profilePanel.classList.add("open");
    profilePanel.setAttribute("aria-hidden", "false");
  });

  profileClose?.addEventListener("click", () => {
    if (!profilePanel) return;
    profilePanel.classList.remove("open");
    profilePanel.setAttribute("aria-hidden", "true");
  });

  logoutBtn?.addEventListener("click", () => {
    window.setAuth("", null);
    renderProfilePanel();
    window.location.href = "/login";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && profilePanel?.classList.contains("open")) {
      profilePanel.classList.remove("open");
      profilePanel.setAttribute("aria-hidden", "true");
    }
  });

  renderProfilePanel();
})();

window.sidebar = (function makeSidebar() {
  const buildingSel = document.getElementById("buildingSel");
  const adminsEl = document.getElementById("memberAdmins");
  const repsEl = document.getElementById("memberReps");
  const ownersEl = document.getElementById("memberOwners");

  const cacheMembers = {};

  function renderEmptyMembers() {
    adminsEl && (adminsEl.innerHTML = "<li>—</li>");
    repsEl && (repsEl.innerHTML = "<li>—</li>");
    ownersEl && (ownersEl.innerHTML = "<li>—</li>");
  }

  async function loadMembers(buildingId) {
    if (!adminsEl || !repsEl || !ownersEl) return;
    const { token } = window.getAuth();
    if (!token || !buildingId) {
      renderEmptyMembers();
      return;
    }

    const res = await fetch(
      `${window.API_BASE}/buildings/${encodeURIComponent(buildingId)}/members`,
      { headers: { Authorization: "Bearer " + token } }
    );
    const data = await res.json().catch(() => []);
    if (!res.ok || !Array.isArray(data)) {
      renderEmptyMembers();
      return;
    }

    cacheMembers[buildingId] = data;
    const admins = [], reps = [], owners = [];
    for (const m of data) {
      const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || m.userId;
      const li = `<li>${window.escapeHtml(name)}</li>`;
      const r = (m.roleInBuilding || "").toLowerCase();
      if (r === "admin") admins.push(li);
      else if (r === "predstavnik") reps.push(li);
      else owners.push(li);
    }

    adminsEl.innerHTML = admins.length ? admins.join("") : "<li>—</li>";
    repsEl.innerHTML = reps.length ? reps.join("") : "<li>—</li>";
    ownersEl.innerHTML = owners.length ? owners.join("") : "<li>—</li>";
  }

  async function loadBuildings(opts = {}) {
    const { afterLoad } = opts;
    if (!buildingSel) {
      if (typeof afterLoad === "function") afterLoad(null);
      return;
    }

    const { token } = window.getAuth();
    if (!token) {
      buildingSel.innerHTML = "<option value=''>Prijavite se</option>";
      if (typeof afterLoad === "function") afterLoad(null);
      return;
    }

    const res = await fetch(`${window.API_BASE}/buildings/my`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json().catch(() => []);
    if (!res.ok || !Array.isArray(data) || data.length === 0) {
      buildingSel.innerHTML = "<option value=''>Nema zgrada</option>";
      if (typeof afterLoad === "function") afterLoad(null);
      return;
    }

    buildingSel.innerHTML = data
      .map((b) => `<option value="${b.id}">${window.escapeHtml(b.name)}</option>`)
      .join("");

    const saved = localStorage.getItem("lastBuildingId");
    if (saved && data.some((b) => b.id === saved)) {
      buildingSel.value = saved;
    } else {
      buildingSel.value = data[0].id;
      localStorage.setItem("lastBuildingId", data[0].id);
    }

    await loadMembers(buildingSel.value);
    if (typeof afterLoad === "function") afterLoad(buildingSel.value);

    buildingSel.addEventListener("change", async () => {
      localStorage.setItem("lastBuildingId", buildingSel.value);
      await loadMembers(buildingSel.value);
      if (typeof afterLoad === "function") afterLoad(buildingSel.value);
    });
  }

  function getMembers(buildingId) {
    return cacheMembers[buildingId] || [];
  }

  return { loadBuildings, loadMembers, getMembers };
})();

(async function refreshAuthFromServer() {
  const { token } = window.getAuth();
  if (!token) return;
  try {
    const res = await fetch(`${window.API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      window.setAuth("", null);
      window.renderProfilePanel && window.renderProfilePanel();
      return;
    }
    const user = await res.json();
    window.setAuth(token, user);
    window.renderProfilePanel && window.renderProfilePanel();
  } catch (err) {
    console.warn("Ne mogu dohvatiti /auth/me:", err);
    window.renderProfilePanel && window.renderProfilePanel();
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("homeBtn");
  if (!btn) return;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = (user?.role || "").toLowerCase();
    btn.addEventListener("click", () => {
      if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    });
  } catch (err) {
    console.warn("Topbar role check failed:", err);
    window.location.href = "/";
  }
});