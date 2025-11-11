const form = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");
const feedback = document.getElementById("feedback");
const toggleBtn = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

function setFeedback(type, msg) {
  if (!feedback) return;
  feedback.classList.remove("error", "success", "info");
  if (!msg) {
    feedback.textContent = "";
    return;
  }
  if (type) feedback.classList.add(type);
  feedback.textContent = msg;
}

if (toggleBtn && passwordInput) {
  toggleBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.textContent = isHidden
      ? "Vidljiva šifra 👁️"
      : "Skrivena šifra 🙈";
  });
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email) {
      setFeedback("error", "Upišite elektroničku poštu");
      return;
    }
    if (!password) {
      setFeedback("error", "Upišite lozinku");
      return;
    }

    setFeedback("info", "Prijava...");

    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFeedback("error", data.error || "Došlo je do greške");
        return;
      }

      // spremi token i usera
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setFeedback("success", "Uspješna prijava!");

      // redirect po ulozi
      const role = data.user?.role?.toLowerCase();
      if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      setFeedback("error", "Greška u komunikaciji s poslužiteljem");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

const params = new URLSearchParams(window.location.search);
const googleToken = params.get("token");
if (googleToken) {
  localStorage.setItem("token", googleToken);

  try {
    const payload = JSON.parse(atob(googleToken.split(".")[1]));
    const role = (payload.role || "").toLowerCase();

    if (role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/";
    }
  } catch {
    window.location.href = "/";
  }
}
