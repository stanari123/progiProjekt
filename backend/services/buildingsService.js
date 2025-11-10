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

export async function getBuildingForUser(buildingId, user) {
    const building = await assertBuilding(buildingId);

    if (user.role !== "admin") {
        await userInBuilding(user.id, buildingId);
    }

    return building;
}

export async function getRoleInBuilding(userId, buildingId) {
    const { data: userRole } = await db
        .from("building_membership")
        .select("role")
        .equal("userId", userId)
        .equal("buildingId", buildingId)
        .single();

    return userRole;
}

export async function listMembers(buildingId, user) {
    const building = await assertBuilding(buildingId);

    if (user.role !== "admin") {
        await userInBuilding(user.id, buildingId);
    }

    const memberships = await db
        .from("building_membership")
        .select("*")
        .equal("buildingId", buildingId);

    return memberships || [];
}

export async function listMyBuildings(user) {
    if (user && user.role === "admin") {
        const { data: buildings } = await db.from("building").select("*");
        return buildings || [];
    }

    if (!user) return [];

    const { data: memberships } = await db
        .from("building_membership")
        .select("building_id")
        .eq("user_id", user.id);

    if (!memberships || memberships.length === 0) return [];

    const buildingIds = memberships.map((m) => m.building_id);

    const { data: buildings } = await db
        .from("building")
        .select("*")
        .in("id", buildingIds);

    return buildings || [];
}
