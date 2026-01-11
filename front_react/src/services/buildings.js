import { getAuth } from "../utils/auth";
import { API_BASE } from "../config";

export async function loadBuildings() {
  const { token } = getAuth();

  const res = await fetch(`${API_BASE}/buildings/my`, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!res.ok) {
    const out = await res.json().catch(() => ({}));
    throw new Error(out.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function loadMembers(buildingId) {
  const { token } = getAuth();

  const res = await fetch(`${API_BASE}/buildings/${buildingId}/members`, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!res.ok) {
    const out = await res.json().catch(() => ({}));
    throw new Error(out.error || `HTTP ${res.status}`);
  }

  return res.json();
}
