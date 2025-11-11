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
        .eq("user_id", userId)
        .eq("building_id", buildingId)
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
    const memberships = await db
        .from("building_membership")
        .select("*")
        .eq("building_id", buildingId);

    const userArr = [];

    for (const membership of memberships.data) {
        let userId = membership.user_id;

        let userInfo = await db
            .from("app_user")
            .select("first_name, last_name")
            .eq("id", userId)
            .single();

        if (userInfo.data) {
            userArr.push({
                firstName: userInfo.data.first_name,
                lastName: userInfo.data.last_name,
                roleInBuilding: membership.user_role,
            });
        }
    }

    return userArr || [];
}

export async function listMyBuildings(user) {
    if (user && user.role === "admin") {
        const { data: buildings } = await db.from("building").select("*");
        return buildings || [];
    }

    if (!user) return [];

    const { data: userRecord } = await db
        .from("app_user")
        .select("*")
        .eq("email", user.email)
        .single();

    const { data: memberships } = await db
        .from("building_membership")
        .select("building_id")
        .eq("user_id", userRecord.id);

    if (!memberships || memberships.length === 0) return [];

    const buildingIds = memberships.map((m) => m.building_id);

    const { data: buildings } = await db
        .from("building")
        .select("*")
        .in("id", buildingIds);

    return buildings || [];
}
