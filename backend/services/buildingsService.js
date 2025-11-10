import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";

//helpers
export async function assertBuilding(buildingId) {
    const building = await db
        .from("building")
        .select("*")
        .equal("id", buildingId)
        .single();
    if (!building) throw new AppError("Zgrada nije pronađena", 404);

    return building;
}

export async function userInBuilding(userId, buildingId) {
    const { data: membership } = await db
        .from("building_membership")
        .select("*")
        .equal("userId", userId)
        .equal("buildingId", buildingId)
        .single();

    if (!membership) throw new AppError("Korisnik nije član zgrade!", 403);

    return membership;
}

export function getBuildingForUser(buildingId, user) {
    const building = assertBuilding(buildingId);

    if (user.role !== "admin" && !userInBuilding(user.id, buildingId)) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    return building;
}

export async function getRoleInBuilding(userId, buildingId) {
    const userRole = await db
        .from("building_membership")
        .select("role")
        .equal("userId", userId)
        .equal("buildingId", buildingId)
        .single();

    return userRole;
}

export async function listMembers(buildingId, user) {
    const building = await assertBuilding(buildingId);

    if (user.role !== "admin" && !userInBuilding(user, buildingId)) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    const memberships = await db
        .from("building_membership")
        .select("*")
        .equal("buildingId", buildingId);

    return memberships;
}

export async function listMyBuildings(user) {
    if (user.role === "admin") return await db.from("building").select("*");

    const myIds = await db
        .from("building_membership")
        .select("buildingId")
        .equal("userId", user.id);

    const uniq = new Set(myIds);
    return await db
        .from("building")
        .select("*")
        .in(
            "id",
            Array.from(uniq).map((m) => m.buildingId)
        );
}
