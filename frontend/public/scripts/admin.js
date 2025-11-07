document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("card-new-user");
  const modal = document.getElementById("newUserModal");
  const closeBtn = document.getElementById("newUserModalClose");
  const saveBtn = document.getElementById("nu-save");
  const fb = document.getElementById("nu-feedback");

  const firstNameEl = document.getElementById("nu-firstName");
  const lastNameEl = document.getElementById("nu-lastName");
  const emailEl = document.getElementById("nu-email");
  const passwordEl = document.getElementById("nu-password");
  const roleEl = document.getElementById("nu-role");
  const buildingsBox = document.getElementById("nu-buildings");

  function renderBuildings(list) {
    if (!buildingsBox) return;
    if (!Array.isArray(list) || list.length === 0) {
      buildingsBox.innerHTML = "<p class='text-muted'>Nema zgrada.</p>";
      return;
    }
    buildingsBox.innerHTML = list
      .map(
        (b) => `
        <label class="building-item">
          <input type="checkbox" value="${b.id}" />
          <span>${b.name}${b.address ? " – " + b.address : ""}</span>
        </label>
      `
      )
      .join("");
  }

  async function loadBuildingsForAdmin() {
    const { token } = window.getAuth ? window.getAuth() : { token: "" };
    if (!token) {
      renderBuildings([]);
      return;
    }
    try {
      const res = await fetch("/api/admin/buildings", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      if (!res.ok) {
        renderBuildings([]);
        return;
      }
      const data = await res.json();
      renderBuildings(data);
    } catch (err) {
      console.warn("Ne mogu dohvatiti zgrade za admina:", err);
      renderBuildings([]);
    }
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    fb && (fb.textContent = "");
    loadBuildingsForAdmin();
  }

  function clearForm() {
    if (firstNameEl) firstNameEl.value = "";
    if (lastNameEl) lastNameEl.value = "";
    if (emailEl) emailEl.value = "";
    if (passwordEl) passwordEl.value = "";
    if (roleEl) roleEl.value = "predstavnik";
    if (buildingsBox) {
      const inputs = buildingsBox.querySelectorAll("input[type=checkbox]");
      inputs.forEach((i) => (i.checked = false));
    }
    fb && (fb.textContent = "");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    clearForm();
  }

  openBtn && openBtn.addEventListener("click", openModal);
  closeBtn && closeBtn.addEventListener("click", closeModal);

  modal && modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("open")) {
      closeModal();
    }
  });

  function collectSelectedBuildingIds() {
    if (!buildingsBox) return [];
    const inputs = buildingsBox.querySelectorAll("input[type=checkbox]:checked");
    return Array.from(inputs).map((i) => i.value);
  }

  async function saveUser() {
    const firstName = firstNameEl?.value?.trim();
    const lastName = lastNameEl?.value?.trim();
    const email = emailEl?.value?.trim();
    const password = passwordEl?.value;
    const role = roleEl?.value;
    const buildingIds = collectSelectedBuildingIds();

    if (!email || !password) {
      fb && (fb.textContent = "E-pošta i lozinka su obavezni.");
      return;
    }

    const { token } = window.getAuth ? window.getAuth() : { token: "" };
    if (!token) {
      fb && (fb.textContent = "Niste prijavljeni.");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          buildingIds,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        fb && (fb.textContent = data?.message || "Neuspješno spremanje.");
        return;
      }
      closeModal();
    } catch (err) {
      console.error(err);
      fb && (fb.textContent = "Greška u komunikaciji sa serverom.");
    }
  }

  saveBtn && saveBtn.addEventListener("click", saveUser);
});
