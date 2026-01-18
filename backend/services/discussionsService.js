import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { userInBuilding } from "./buildingsService.js";

// helpers
function isAdminRole(role) {
    return (role || "").toLowerCase() === "admin";
}

export function buildDisplayName(user) {
    if (!user) return "(nepoznat)";
    const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
    if (full) return full;
    if (user.role === "admin") return "Administrator";
    return user.email || "(nepoznat)";
}

export async function userCanAccessDiscussion(discussion, authUser) {
    if (!discussion) return false;

    const userId = authUser?.sub;
    const role = authUser?.role;

    if (isAdminRole(role)) return true;
    if (!userId) return false;

    if (discussion.visibility === "javno") return true;
    if (discussion.owner_id === userId) return true;

    const { data: rows, error } = await db
        .from("discussion_participant")
        .select("user_id")
        .eq("discussion_id", discussion.id)
        .eq("user_id", userId);

    if (error) return false;
    return Array.isArray(rows) && rows.length > 0;
}

export async function assertDiscussion(id) {
    const { data, error } = await db
        .from("discussion")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) throw new AppError("Diskusija nije pronađena", 404);
    return data;
}

export async function listDiscussions(authUser, buildingId) {
    if (!buildingId) throw new AppError("buildingId je obavezan", 400);

    const userId = authUser?.sub;
    if (!userId) throw new AppError("Neispravan token (nema sub)", 401);

    const role = authUser?.role;

    if (!isAdminRole(role) && !(await userInBuilding(userId, buildingId))) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    const { data: discussions, error: dErr } = await db
        .from("discussion")
        .select("*")
        .eq("building_id", buildingId);

    if (dErr) throw new AppError(dErr.message || "Greška pri dohvaćanju rasprava", 500);

    const list = discussions || [];
    if (list.length === 0) return [];

    const discussionIds = list.map((d) => d.id);

    let participantSet = new Set();
    if (!isAdminRole(role) && discussionIds.length > 0) {
        const { data: partRows, error: pErr } = await db
            .from("discussion_participant")
            .select("discussion_id")
            .eq("user_id", userId)
            .in("discussion_id", discussionIds);

        if (pErr) {
            console.error("participantSet error:", pErr);
        } else {
            participantSet = new Set((partRows || []).map((r) => r.discussion_id));
        }
    }

    const ownerIds = [...new Set(list.map((d) => d.owner_id).filter(Boolean))];
    let ownerMap = new Map();

    if (ownerIds.length > 0) {
        const { data: owners, error: oErr } = await db
            .from("app_user")
            .select("id,email,role,first_name,last_name")
            .in("id", ownerIds);

        if (oErr) {
            console.error("owner lookup error:", oErr);
        } else {
            ownerMap = new Map((owners || []).map((o) => [o.id, buildDisplayName(o)]));
        }
    }

    for (const d of list) {
        d.ownerName = ownerMap.get(d.owner_id) || d.ownerName || "";

        if (isAdminRole(role)) d.canViewContent = true;
        else if (d.visibility === "javno") d.canViewContent = true;
        else if (d.owner_id === userId) d.canViewContent = true;
        else d.canViewContent = participantSet.has(d.id) === true;
    }

    return list;
}

export async function createDiscussion(
    authUser,
    buildingId,
    title,
    body = "",
    isPrivate = false,
    participants = []
) {
    if (!title?.trim()) throw new AppError("Naslov je obavezan", 400);
    if (!buildingId) throw new AppError("buildingId je obavezan", 400);

    const userId = authUser?.sub;
    const role = authUser?.role;

    if (!userId) throw new AppError("Neispravan token (nema sub)", 401);

    const { data: userRecord, error: uErr } = await db
        .from("app_user")
        .select("*")
        .eq("id", userId)
        .single();

    if (uErr || !userRecord) throw new AppError("Korisnik nije pronađen", 401);

    if (!isAdminRole(role) && !(await userInBuilding(userRecord.id, buildingId))) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    const { data: inserted, error: insErr } = await db
        .from("discussion")
        .insert({
            title: title.trim(),
            building_id: buildingId,
            owner_id: userRecord.id,
            visibility: isPrivate ? "privatno" : "javno",
            status: "otvoreno",
            poll_description: (body || "").trim(),
        })
        .select();

    if (insErr) throw new AppError(insErr.message || "Greška pri stvaranju rasprave", 500);
    if (!inserted || inserted.length === 0) throw new AppError("Greška pri stvaranju rasprave", 500);

    const discussionId = inserted[0].id;

    if (isPrivate && Array.isArray(participants) && participants.length > 0) {
        const ids = [...new Set(participants)].filter(Boolean);

        if (ids.length > 0) {
            const participantRecords = ids.map((uid) => ({
                discussion_id: discussionId,
                user_id: uid,
                can_post: true,
            }));

            const { error: pInsErr } = await db
                .from("discussion_participant")
                .insert(participantRecords);

            if (pInsErr) {
                console.error("insert discussion_participant error:", pInsErr);
                throw new AppError("Greška pri dodavanju sudionika", 500);
            }
        }
    }

    return inserted;
}
