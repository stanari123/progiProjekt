import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";

//helpers
export function assertBuilding(buildingId) {
    const b = db.buildings.find((x) => x.id === buildingId);
    if (!b) throw new AppError("Zgrada nije pronađena", 404);
    return b;
}
export function userInBuilding(userId, buildingId) {
    return db.memberships.some(
        (m) => m.userId === userId && m.buildingId === buildingId
    );
}
export function getBuildingForUser(buildingId, user) {
    const b = assertBuilding(buildingId);
    if (user.role !== "admin" && !userInBuilding(user.sub, buildingId)) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }
    return b;
}
export function getRoleInBuilding(userId, buildingId) {
    const m = db.memberships.find(
        (x) => x.userId === userId && x.buildingId === buildingId
    );
    return m?.roleInBuilding || null;
}

/**/
export function listMembers(buildingId, user) {
    assertBuilding(buildingId);
    if (user.role !== "admin" && !userInBuilding(user.sub, buildingId)) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    const ms = db.memberships.filter((m) => m.buildingId === buildingId);
    return ms.map((m) => {
        const u = db.users.find((x) => x.id === m.userId) || {};
        return {
            userId: m.userId,
            roleInBuilding: m.roleInBuilding || u.role || "suvlasnik",
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
        };
    });
}
export async function listMyBuildings(user) {
    if (user.role === "admin") return await db.from("building").select("*");

    const myIds = db.memberships
        .filter((m) => m.userId === user.sub)
        .map((m) => m.buildingId);

    const uniq = new Set(myIds);
    return db.buildings.filter((b) => uniq.has(b.id));
}
