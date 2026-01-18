import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";

//helpers
export async function assertBuilding(buildingId) {
    const { data: building, error } = await db
        .from("building")
        .select("*")
        .eq("id", buildingId)
        .single();

    if (error || !building) throw new AppError("Zgrada nije pronađena", 404);
    return building;
}

export async function userInBuilding(userId, buildingId) {
    const { data, error } = await db
        .from("building_membership")
        .select("user_id")
        .eq("user_id", userId)
        .eq("building_id", buildingId);

    if (error) throw new AppError("Greška pri provjeri članstva.", 500);
    if (!data || data.length === 0) throw new AppError("Korisnik nije član zgrade!", 403);
    return true;
}

export async function getBuildingForUser(buildingId, user) {
    const building = await assertBuilding(buildingId);

    if ((user?.role || "").toLowerCase() !== "admin") {
        const userId = user?.sub || user?.id;
        if (!userId) throw new AppError("Neispravan token.", 401);
        await userInBuilding(userId, buildingId);
    }

    return building;
}

export async function getRoleInBuilding(userId, buildingId) {
    const { data, error } = await db
        .from("building_membership")
        .select("user_role")
        .eq("user_id", userId)
        .eq("building_id", buildingId)
        .single();

    if (error || !data) return null;
    return data.user_role || null;
}

export async function listMembers(buildingId, user) {
    const { data: memberships, error: mErr } = await db
        .from("building_membership")
        .select("user_id, user_role")
        .eq("building_id", buildingId);

    if (mErr) throw new AppError("Greška pri dohvaćanju članova zgrade", 500);

    const userArr = [];

    for (const membership of memberships || []) {
        const userId = membership.user_id;

        const { data: userInfo, error: uErr } = await db
        .from("app_user")
        .select("first_name, last_name, email")
        .eq("id", userId)
        .single();

        if (uErr || !userInfo) continue;

        userArr.push({
        userId,
        firstName: userInfo.first_name,
        lastName: userInfo.last_name,
        email: userInfo.email,
        roleInBuilding: membership.user_role,
        });
    }

    return userArr;
}

export async function listMyBuildings(user) {
    if ((user?.role || "").toLowerCase() === "admin") {
        const { data: buildings, error } = await db.from("building").select("*");
        if (error) throw new AppError("Greška pri dohvaćanju zgrada.", 500);
        return buildings || [];
    }

    if (!user) return [];

    const { data: userRecord, error: uErr } = await db
        .from("app_user")
        .select("id")
        .eq("email", user.email)
        .single();

    if (uErr || !userRecord) return [];

    const { data: memberships, error: mErr } = await db
        .from("building_membership")
        .select("building_id")
        .eq("user_id", userRecord.id);

    if (mErr || !memberships || memberships.length === 0) return [];

    const buildingIds = memberships.map((m) => m.building_id);

    const { data: buildings, error: bErr } = await db
        .from("building")
        .select("*")
        .in("id", buildingIds);

    if (bErr) throw new AppError("Greška pri dohvaćanju zgrada.", 500);

    return buildings || [];
}

export async function createBuilding(payload = {}, adminUser) {
    const name = (payload.name || "").trim();
    const address = (payload.address || "").trim();

    if (!name || !address) {
        throw new AppError("Naziv i adresa su obavezni", 400);
    }

    if (!adminUser || (adminUser.role || "").toLowerCase() !== "admin") {
        throw new AppError("Samo admin može kreirati zgradu", 403);
    }

    const { data: inserted, error: insErr } = await db
        .from("building")
        .insert({ name, address })
        .select("*")
        .single();

    if (insErr || !inserted) {
        throw new AppError("Greška pri spremanju zgrade", 500);
    }

    const { error: memErr } = await db
        .from("building_membership")
        .insert({
            user_id: adminUser.sub || adminUser.id,
            building_id: inserted.id,
            user_role: "admin",
        });

    if (memErr) {
        throw new AppError("Greška pri dodavanju admina u zgradu", 500);
    }

    return inserted;
}

