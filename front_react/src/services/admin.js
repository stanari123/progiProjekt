import { getAuth } from "../utils/auth";

export async function adminFetch(path, options = {}) {
  const { token } = getAuth();

  const res = await fetch(`/api${path}`, {
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

export function createBuilding(payload) {
  return adminFetch("/admin/buildings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
