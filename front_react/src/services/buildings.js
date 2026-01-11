import { getAuth } from "../utils/auth";

export async function loadBuildings() {
  const { token } = getAuth();

  const res = await fetch(`/api/buildings/my`, {
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

  const res = await fetch(`/api/buildings/${buildingId}/members`, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!res.ok) {
    const out = await res.json().catch(() => ({}));
    throw new Error(out.error || `HTTP ${res.status}`);
  }

  return res.json();
}
