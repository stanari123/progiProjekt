export function getAuth() {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

export function setAuth(token, user) {
  localStorage.setItem(
    "auth",
    JSON.stringify({ token, user })
  );
}

export function clearAuth() {
  localStorage.removeItem("auth");
}
