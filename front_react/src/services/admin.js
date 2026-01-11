import { API_BASE } from "../config";
import { getAuth } from "../utils/auth";

export async function adminFetch(path, options = {}) {
  const { token } = getAuth();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...(options.headers || {})
    }
  });

  return res.json();
}

export function getAdminBuildings() {
  return adminFetch("/admin/buildings");
}

export function createAdminUser(payload) {
  return adminFetch("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

