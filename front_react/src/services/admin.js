import { getAuth } from "../utils/auth";

export async function adminFetch(path, options = {}) {
  const { token } = getAuth();

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      Authorization: "Bearer " + token,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data;
}

export function getAdminBuildings() {
  return adminFetch("/admin/buildings");
}

export function createAdminUser(payload) {
  return adminFetch("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createBuilding(payload) {
  return adminFetch("/admin/buildings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAllUsers() {
  return adminFetch("/admin/users");
}

export function addMembersToBuilding(buildingId, userIds) {
  return adminFetch(`/admin/buildings/${buildingId}/members/add`, {
    method: "POST",
    body: JSON.stringify({ userIds }),
  });
}

export function removeMembersFromBuilding(buildingId, userIds) {
  return adminFetch(`/admin/buildings/${buildingId}/members/remove`, {
    method: "POST",
    body: JSON.stringify({ userIds }),
  });
}

export function getStanPlanLink() {
  return adminFetch("/admin/stanplan-link");
}

export function setStanPlanLink(link) {
  return adminFetch("/admin/stanplan-link", {
    method: "POST",
    body: JSON.stringify({ link }),
  });
}

