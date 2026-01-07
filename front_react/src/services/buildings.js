import { getAuth } from "../utils/auth";
import { API_BASE } from "../config";


export async function loadBuildings() {
  const { token } = getAuth();

  const res = await fetch(`${API_BASE}/buildings`, {
    headers: { Authorization: "Bearer " + token },
  });

  return res.json();
}

export async function loadMembers(buildingId) {
  const { token } = getAuth();

  const res = await fetch(
    `${API_BASE}/buildings/${buildingId}/members`,
    {
      headers: { Authorization: "Bearer " + token },
    }
  );

  return res.json();
}
